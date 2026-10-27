import { env } from '../config/env.js';
import { Disease } from '../models/Disease.js';
import { Prediction } from '../models/Prediction.js';
import { safeDeleteUploadedFile } from '../middleware/upload.js';
import { requestCnnPrediction } from '../services/mlServiceClient.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const CALIBRATION_DISCLAIMER =
  'Model confidence represents softmax similarity to PlantVillage leaf imagery and does not guarantee field diagnostic accuracy. Always confirm uncertain or high-stakes crop decisions with a certified local agricultural extension specialist.';

function escapeRegex(input) {
  return String(input || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const createPrediction = asyncHandler(async (req, res) => {
  const imageMeta = req.processedImage;
  if (!imageMeta) {
    throw new ApiError(400, 'Processed leaf image data is missing.', 'IMAGE_REQUIRED');
  }

  try {
    const isDemoWalkthrough = String(req.body?.demoWalkthrough || '').toLowerCase() === 'true';

    if (isDemoWalkthrough) {
      const requestedLabel = String(req.body?.demoClassLabel || '').trim();
      const demoDisease =
        (requestedLabel ? await Disease.findOne({ classLabel: requestedLabel }) : null) ||
        (await Disease.findOne({ classLabel: 'Tomato___Early_blight' })) ||
        (await Disease.findOne());

      if (!demoDisease) {
        throw new ApiError(
          500,
          'Disease catalog is empty. Run npm run seed:diseases first.',
          'DISEASE_CATALOG_EMPTY'
        );
      }

      const demoRecord = await Prediction.create({
        userId: req.user._id,
        diseaseId: demoDisease._id,
        cropName: demoDisease.cropName,
        diseaseName: demoDisease.diseaseName,
        classLabel: demoDisease.classLabel,
        confidence: null,
        topPredictions: [],
        imageUrl: imageMeta.publicUrl,
        imageFilename: imageMeta.filename,
        modelVersion: 'ui-walkthrough-simulation-no-cnn',
        status: 'demo_simulation',
        isDemo: true,
      });

      return res.status(201).json({
        success: true,
        isDemo: true,
        prediction: demoRecord.toJSON(),
        disease: demoDisease.toJSON(),
        disclaimer:
          'SIMULATED UI WALKTHROUGH RECORD: No CNN inference was executed. Confidence is intentionally omitted so simulated walkthroughs are never confused with trained model output.',
      });
    }

    const mlOutput = await requestCnnPrediction(imageMeta.buffer, imageMeta.filename);

    const classLabel = String(mlOutput.classLabel || '').trim();
    const rawConfidence = Number(mlOutput.confidence);
    if (!classLabel || Number.isNaN(rawConfidence)) {
      throw new ApiError(
        502,
        'FastAPI model service returned an incomplete prediction payload.',
        'INVALID_ML_RESPONSE'
      );
    }

    const confidence = Math.max(0, Math.min(1, rawConfidence));
    const matchedDisease = await Disease.findOne({ classLabel });

    const cropName = matchedDisease?.cropName || mlOutput.cropName || 'Unknown Crop';
    const diseaseName = matchedDisease?.diseaseName || mlOutput.diseaseName || classLabel;

    let status = 'completed';
    if (!matchedDisease) {
      status = 'unknown_class';
    } else if (confidence < env.confidenceThreshold) {
      status = 'uncertain';
    }

    const topPredictions = Array.isArray(mlOutput.topPredictions)
      ? mlOutput.topPredictions.slice(0, 3).map((item) => ({
          classLabel: String(item.classLabel || ''),
          cropName: String(item.cropName || cropName),
          diseaseName: String(item.diseaseName || diseaseName),
          confidence:
            typeof item.confidence === 'number'
              ? Math.max(0, Math.min(1, item.confidence))
              : null,
        }))
      : [];

    const prediction = await Prediction.create({
      userId: req.user._id,
      diseaseId: matchedDisease ? matchedDisease._id : null,
      cropName,
      diseaseName,
      classLabel,
      confidence,
      topPredictions,
      imageUrl: imageMeta.publicUrl,
      imageFilename: imageMeta.filename,
      modelVersion: String(mlOutput.modelVersion || 'plantvillage-cnn-v1'),
      status,
      isDemo: false,
    });

    return res.status(201).json({
      success: true,
      isDemo: false,
      prediction: prediction.toJSON(),
      disease: matchedDisease ? matchedDisease.toJSON() : null,
      disclaimer: CALIBRATION_DISCLAIMER,
    });
  } catch (err) {
    await safeDeleteUploadedFile(imageMeta.filename);
    throw err;
  }
});

export const getUserPredictions = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = { userId: req.user._id };

  if (req.query.crop && req.query.crop !== 'All') {
    filter.cropName = {
      $regex: `^${escapeRegex(req.query.crop)}$`,
      $options: 'i',
    };
  }

  if (req.query.status) {
    filter.status = String(req.query.status);
  }

  if (req.query.search && String(req.query.search).trim()) {
    const safePattern = escapeRegex(String(req.query.search).trim());
    filter.$or = [
      { cropName: { $regex: safePattern, $options: 'i' } },
      { diseaseName: { $regex: safePattern, $options: 'i' } },
      { classLabel: { $regex: safePattern, $options: 'i' } },
    ];
  }

  const [records, total, genuineCount, uncertainCount] = await Promise.all([
    Prediction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Prediction.countDocuments(filter),
    Prediction.countDocuments({ userId: req.user._id, isDemo: false }),
    Prediction.countDocuments({ userId: req.user._id, status: 'uncertain' }),
  ]);

  return res.status(200).json({
    success: true,
    predictions: records.map((doc) => doc.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    summary: {
      total,
      genuineCount,
      uncertainCount,
    },
  });
});

export const getPredictionById = asyncHandler(async (req, res) => {
  const prediction = await Prediction.findById(req.params.id);
  if (!prediction) {
    throw new ApiError(404, 'Prediction record not found.', 'PREDICTION_NOT_FOUND');
  }

  const isOwner = prediction.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      'Access denied: you can only inspect your own crop leaf predictions.',
      'FORBIDDEN_RESOURCE'
    );
  }

  const disease = prediction.diseaseId
    ? await Disease.findById(prediction.diseaseId)
    : await Disease.findOne({ classLabel: prediction.classLabel });

  return res.status(200).json({
    success: true,
    prediction: prediction.toJSON(),
    disease: disease ? disease.toJSON() : null,
    disclaimer: prediction.isDemo
      ? 'SIMULATED UI WALKTHROUGH RECORD: No CNN inference was executed.'
      : CALIBRATION_DISCLAIMER,
  });
});

export const deletePrediction = asyncHandler(async (req, res) => {
  const prediction = await Prediction.findById(req.params.id).select('+imageFilename');
  if (!prediction) {
    throw new ApiError(404, 'Prediction record not found.', 'PREDICTION_NOT_FOUND');
  }

  const isOwner = prediction.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      'Access denied: you can only delete your own crop leaf predictions.',
      'FORBIDDEN_RESOURCE'
    );
  }

  const filename = prediction.imageFilename;
  await prediction.deleteOne();
  await safeDeleteUploadedFile(filename);

  return res.status(200).json({
    success: true,
    message: 'Prediction record deleted.',
  });
});
