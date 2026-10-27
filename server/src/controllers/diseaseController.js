import mongoose from 'mongoose';
import { Disease } from '../models/Disease.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function escapeRegex(input) {
  return String(input || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const listDiseases = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.crop && req.query.crop !== 'All') {
    filter.cropName = {
      $regex: `^${escapeRegex(req.query.crop)}$`,
      $options: 'i',
    };
  }

  if (req.query.healthy === 'true') {
    filter.isHealthy = true;
  } else if (req.query.healthy === 'false') {
    filter.isHealthy = false;
  }

  if (req.query.search && String(req.query.search).trim()) {
    const safeSearch = escapeRegex(String(req.query.search).trim());
    filter.$or = [
      { cropName: { $regex: safeSearch, $options: 'i' } },
      { diseaseName: { $regex: safeSearch, $options: 'i' } },
      { scientificName: { $regex: safeSearch, $options: 'i' } },
      { classLabel: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [items, total, crops] = await Promise.all([
    Disease.find(filter).sort({ cropName: 1, diseaseName: 1 }).skip(skip).limit(limit),
    Disease.countDocuments(filter),
    Disease.distinct('cropName'),
  ]);

  return res.status(200).json({
    success: true,
    diseases: items.map((d) => d.toJSON()),
    crops: crops.sort(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const getDiseaseById = asyncHandler(async (req, res) => {
  const identifier = String(req.params.id || '').trim();

  let disease = null;
  if (mongoose.isValidObjectId(identifier)) {
    disease = await Disease.findById(identifier);
  }
  if (!disease) {
    disease = await Disease.findOne({ classLabel: identifier });
  }

  if (!disease) {
    throw new ApiError(404, 'Disease guide not found in library.', 'DISEASE_NOT_FOUND');
  }

  return res.status(200).json({
    success: true,
    disease: disease.toJSON(),
  });
});

export const createDisease = asyncHandler(async (req, res) => {
  const classLabel = String(req.body.classLabel || '').trim();
  const existing = await Disease.findOne({ classLabel });
  if (existing) {
    throw new ApiError(
      409,
      `A disease entry with classLabel "${classLabel}" already exists.`,
      'DUPLICATE_CLASS_LABEL'
    );
  }

  const created = await Disease.create({
    cropName: String(req.body.cropName || '').trim(),
    diseaseName: String(req.body.diseaseName || '').trim(),
    scientificName: String(req.body.scientificName || '').trim(),
    classLabel,
    isHealthy: Boolean(req.body.isHealthy),
    description: String(req.body.description || '').trim(),
    symptoms: Array.isArray(req.body.symptoms) ? req.body.symptoms : [],
    prevention: Array.isArray(req.body.prevention) ? req.body.prevention : [],
    management: Array.isArray(req.body.management) ? req.body.management : [],
    referenceUrls: Array.isArray(req.body.referenceUrls) ? req.body.referenceUrls : [],
  });

  return res.status(201).json({
    success: true,
    message: 'Disease entry added to catalog.',
    disease: created.toJSON(),
  });
});

export const updateDisease = asyncHandler(async (req, res) => {
  const disease = await Disease.findById(req.params.id);
  if (!disease) {
    throw new ApiError(404, 'Disease entry not found.', 'DISEASE_NOT_FOUND');
  }

  const editableStringFields = ['cropName', 'diseaseName', 'scientificName', 'classLabel', 'description'];
  for (const field of editableStringFields) {
    if (typeof req.body[field] === 'string') {
      disease[field] = req.body[field].trim();
    }
  }

  if (typeof req.body.isHealthy === 'boolean') {
    disease.isHealthy = req.body.isHealthy;
  }

  const editableArrayFields = ['symptoms', 'prevention', 'management', 'referenceUrls'];
  for (const field of editableArrayFields) {
    if (Array.isArray(req.body[field])) {
      disease[field] = req.body[field];
    }
  }

  await disease.save();

  return res.status(200).json({
    success: true,
    message: 'Disease entry updated.',
    disease: disease.toJSON(),
  });
});

export const deleteDisease = asyncHandler(async (req, res) => {
  const disease = await Disease.findById(req.params.id);
  if (!disease) {
    throw new ApiError(404, 'Disease entry not found.', 'DISEASE_NOT_FOUND');
  }

  await disease.deleteOne();

  return res.status(200).json({
    success: true,
    message: 'Disease entry deleted from catalog.',
  });
});
