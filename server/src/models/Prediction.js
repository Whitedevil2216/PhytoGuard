import mongoose from 'mongoose';

const topPredictionSchema = new mongoose.Schema(
  {
    classLabel: { type: String, required: true },
    cropName: { type: String, required: true },
    diseaseName: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1, default: null },
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Prediction must belong to an authenticated user.'],
      index: true,
    },
    diseaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disease',
      default: null,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    diseaseName: {
      type: String,
      required: true,
      trim: true,
    },
    classLabel: {
      type: String,
      required: true,
      trim: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    topPredictions: {
      type: [topPredictionSchema],
      default: [],
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imageFilename: {
      type: String,
      required: true,
      select: false,
    },
    modelVersion: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['completed', 'uncertain', 'unknown_class', 'demo_simulation'],
      default: 'completed',
      index: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

predictionSchema.index({ userId: 1, createdAt: -1 });
predictionSchema.index({ createdAt: -1 });

predictionSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret.imageFilename;
    delete ret.__v;
    return ret;
  },
});

export const Prediction =
  mongoose.models.Prediction || mongoose.model('Prediction', predictionSchema);
