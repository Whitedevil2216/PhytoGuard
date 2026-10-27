import { Disease } from '../models/Disease.js';
import { Prediction } from '../models/Prediction.js';
import { User } from '../models/User.js';
import { checkMlServiceHealth } from '../services/mlServiceClient.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function escapeRegex(input) {
  return String(input || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSevenDayUtcSeries(dailyBuckets) {
  const bucketMap = new Map(dailyBuckets.map((b) => [b._id, b.total]));
  const series = [];
  const now = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset)
    );
    const isoDate = day.toISOString().slice(0, 10);
    const label = day.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    series.push({
      date: isoDate,
      label,
      total: bucketMap.get(isoDate) || 0,
    });
  }

  return series;
}

export const getAdminStats = asyncHandler(async (_req, res) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    adminCount,
    totalPredictions,
    genuinePredictions,
    uncertainPredictions,
    demoSimulations,
    totalDiseases,
    dailyAgg,
    cropAgg,
    recentDocs,
    mlService,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ role: 'admin', status: 'active' }),
    Prediction.countDocuments(),
    Prediction.countDocuments({ isDemo: false }),
    Prediction.countDocuments({ status: 'uncertain' }),
    Prediction.countDocuments({ isDemo: true }),
    Disease.countDocuments(),
    Prediction.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
        },
      },
    ]),
    Prediction.aggregate([
      {
        $group: {
          _id: '$cropName',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 8 },
    ]),
    Prediction.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('userId', 'name email'),
    checkMlServiceHealth(),
  ]);

  return res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      adminCount,
      totalPredictions,
      genuinePredictions,
      uncertainPredictions,
      demoSimulations,
      totalDiseases,
      mlService,
      activitySeries: buildSevenDayUtcSeries(dailyAgg),
      cropDistribution: cropAgg.map((row) => ({
        cropName: row._id || 'Unknown',
        count: row.count,
      })),
      recentPredictions: recentDocs.map((doc) => doc.toJSON()),
    },
  });
});

export const listAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search && String(req.query.search).trim()) {
    const safeSearch = escapeRegex(String(req.query.search).trim());
    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
      { location: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    users: users.map((u) => u.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const listAdminPredictions = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search && String(req.query.search).trim()) {
    const safeSearch = escapeRegex(String(req.query.search).trim());
    filter.$or = [
      { cropName: { $regex: safeSearch, $options: 'i' } },
      { diseaseName: { $regex: safeSearch, $options: 'i' } },
      { classLabel: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [predictions, total] = await Promise.all([
    Prediction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'),
    Prediction.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    predictions: predictions.map((p) => p.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new ApiError(404, 'Target user account not found.', 'USER_NOT_FOUND');
  }

  const nextRole = String(req.body.role || '').trim();
  if (!['user', 'admin'].includes(nextRole)) {
    throw new ApiError(400, 'Role must be either "user" or "admin".', 'INVALID_ROLE');
  }

  if (targetUser._id.toString() === req.user._id.toString() && nextRole !== 'admin') {
    throw new ApiError(
      400,
      'Self-lockout protection: administrators cannot demote their own account.',
      'SELF_DEMOTION_BLOCKED'
    );
  }

  if (targetUser.role === 'admin' && nextRole !== 'admin') {
    const activeAdmins = await User.countDocuments({ role: 'admin', status: 'active' });
    if (activeAdmins <= 1) {
      throw new ApiError(
        400,
        'Cannot demote the last active administrator account.',
        'LAST_ADMIN_PROTECTED'
      );
    }
  }

  targetUser.role = nextRole;
  await targetUser.save();

  return res.status(200).json({
    success: true,
    message: `Updated ${targetUser.email} role to ${nextRole}.`,
    user: targetUser.toJSON(),
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new ApiError(404, 'Target user account not found.', 'USER_NOT_FOUND');
  }

  const nextStatus = String(req.body.status || '').trim();
  if (!['active', 'deactivated'].includes(nextStatus)) {
    throw new ApiError(
      400,
      'Status must be either "active" or "deactivated".',
      'INVALID_STATUS'
    );
  }

  if (targetUser._id.toString() === req.user._id.toString() && nextStatus !== 'active') {
    throw new ApiError(
      400,
      'Self-lockout protection: administrators cannot deactivate their own account.',
      'SELF_DEACTIVATION_BLOCKED'
    );
  }

  if (targetUser.role === 'admin' && nextStatus !== 'active') {
    const activeAdmins = await User.countDocuments({ role: 'admin', status: 'active' });
    if (activeAdmins <= 1) {
      throw new ApiError(
        400,
        'Cannot deactivate the last active administrator account.',
        'LAST_ADMIN_PROTECTED'
      );
    }
  }

  targetUser.status = nextStatus;
  await targetUser.save();

  return res.status(200).json({
    success: true,
    message: `Updated ${targetUser.email} status to ${nextStatus}.`,
    user: targetUser.toJSON(),
  });
});
