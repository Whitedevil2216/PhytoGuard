import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const uploadStorage = multer.memoryStorage();

export const uploadSingleLeafImage = multer({
  storage: uploadStorage,
  limits: {
    fileSize: env.maxUploadMb * 1024 * 1024,
    files: 1,
  },
}).single('image');

export function detectImageMagicFormat(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return null;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'png';
  }

  // WebP: "RIFF" [4 bytes] "WEBP"
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp';
  }

  return null;
}

export const validateAndPersistLeafImage = asyncHandler(async (req, _res, next) => {
  if (!req.file || !req.file.buffer) {
    throw new ApiError(
      400,
      'Please select a valid crop leaf image file (JPEG, PNG, or WebP) before submitting.',
      'IMAGE_REQUIRED'
    );
  }

  const magicFormat = detectImageMagicFormat(req.file.buffer);
  if (!magicFormat) {
    throw new ApiError(
      400,
      'Rejected file: binary file signature does not match a genuine JPEG, PNG, or WebP image.',
      'INVALID_IMAGE_SIGNATURE'
    );
  }

  let metadata;
  let normalizedBuffer;
  try {
    const pipeline = sharp(req.file.buffer, { limitInputPixels: 40_000_000 });
    metadata = await pipeline.metadata();

    if (!metadata.width || !metadata.height || metadata.width < 32 || metadata.height < 32) {
      throw new ApiError(
        400,
        'Leaf photograph dimensions must be at least 32x32 pixels for CNN analysis.',
        'IMAGE_TOO_SMALL'
      );
    }

    normalizedBuffer = await sharp(req.file.buffer, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toColorspace('srgb')
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      400,
      'Unable to decode uploaded image. The file may be corrupted or truncated.',
      'CORRUPTED_IMAGE_DATA'
    );
  }

  await fs.mkdir(env.uploadDir, { recursive: true });

  const safeFilename = `leaf_${crypto.randomUUID()}.jpg`;
  const resolvedBase = path.resolve(env.uploadDir);
  const destinationPath = path.resolve(resolvedBase, safeFilename);

  if (!destinationPath.startsWith(resolvedBase + path.sep)) {
    throw new ApiError(400, 'Unsafe upload destination path blocked.', 'PATH_TRAVERSAL_BLOCKED');
  }

  await fs.writeFile(destinationPath, normalizedBuffer);

  req.processedImage = {
    filename: safeFilename,
    publicUrl: `/uploads/${safeFilename}`,
    buffer: normalizedBuffer,
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    detectedFormat: magicFormat,
  };

  next();
});

export async function safeDeleteUploadedFile(filename) {
  if (!filename || typeof filename !== 'string') return;
  const cleanName = path.basename(filename);
  if (cleanName !== filename || !cleanName.startsWith('leaf_')) return;

  const resolvedBase = path.resolve(env.uploadDir);
  const targetPath = path.resolve(resolvedBase, cleanName);
  if (!targetPath.startsWith(resolvedBase + path.sep)) return;

  try {
    await fs.unlink(targetPath);
  } catch {
    // Ignore if file was already removed
  }
}
