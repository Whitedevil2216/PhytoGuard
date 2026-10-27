import mongoose from 'mongoose';

const referenceUrlSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      match: [/^https?:\/\/.+/i, 'Reference URL must start with http:// or https://'],
    },
  },
  { _id: false }
);

const diseaseSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: [true, 'Crop name is required.'],
      trim: true,
      maxlength: 80,
      index: true,
    },
    diseaseName: {
      type: String,
      required: [true, 'Disease or condition name is required.'],
      trim: true,
      maxlength: 120,
    },
    scientificName: {
      type: String,
      trim: true,
      default: '',
      maxlength: 160,
    },
    classLabel: {
      type: String,
      required: [true, 'PlantVillage classLabel is required.'],
      unique: true,
      trim: true,
      maxlength: 160,
    },
    isHealthy: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, 'Disease description is required.'],
      trim: true,
      maxlength: 2500,
    },
    symptoms: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one symptom or visual indicator is required.',
      },
    },
    prevention: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one prevention practice is required.',
      },
    },
    management: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one management practice is required.',
      },
    },
    referenceUrls: {
      type: [referenceUrlSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

diseaseSchema.index({
  cropName: 'text',
  diseaseName: 'text',
  scientificName: 'text',
  description: 'text',
});

diseaseSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const Disease = mongoose.models.Disease || mongoose.model('Disease', diseaseSchema);
