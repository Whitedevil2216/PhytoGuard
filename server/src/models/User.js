import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters.'],
      maxlength: [80, 'Full name cannot exceed 80 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required.'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'deactivated'],
      default: 'active',
      index: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters.'],
      default: '',
    },
    preferredLanguage: {
      type: String,
      enum: ['en-IN', 'en-US', 'ta-IN'],
      default: 'en-IN',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.hashPassword = async function hashPassword(plainPassword) {
  return bcrypt.hash(String(plainPassword), BCRYPT_SALT_ROUNDS);
};

userSchema.methods.verifyPassword = async function verifyPassword(candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(String(candidatePassword), this.passwordHash);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
