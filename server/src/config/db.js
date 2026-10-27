import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import { Disease } from '../models/Disease.js';
import { User } from '../models/User.js';
import { INITIAL_DISEASES } from '../utils/seedData.js';

let memoryServerInstance = null;
let connectionMode = 'disconnected';

export function getDbStatus() {
  const readyState = mongoose.connection.readyState;
  return {
    connected: readyState === 1,
    readyState,
    mode: connectionMode,
  };
}

export async function seedInitialCatalogIfEmpty() {
  const existingCount = await Disease.countDocuments();
  if (existingCount === 0) {
    await Disease.insertMany(INITIAL_DISEASES, { ordered: false });
    logger.info(`Seeded ${INITIAL_DISEASES.length} verified PlantVillage disease classes.`);
  }
}

async function seedDevelopmentReviewAccounts() {
  const isTestRuntime = process.env.NODE_ENV === 'test' || env.isTest;
  if (env.isProduction || isTestRuntime) return;

  const adminEmail = 'admin@phytoguard.edu';
  const farmerEmail = 'farmer@phytoguard.edu';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Dr. Kavitha Raman (Admin)',
      email: adminEmail,
      passwordHash: await User.hashPassword('Admin@2026!'),
      role: 'admin',
      status: 'active',
      location: 'Coimbatore Agricultural Campus',
      preferredLanguage: 'en-IN',
    });
  }

  const existingFarmer = await User.findOne({ email: farmerEmail });
  if (!existingFarmer) {
    await User.create({
      name: 'Ramesh Subramanian',
      email: farmerEmail,
      passwordHash: await User.hashPassword('Farmer@2026!'),
      role: 'user',
      status: 'active',
      location: 'Erode District, Tamil Nadu',
      preferredLanguage: 'en-IN',
    });
  }
}

export async function connectDatabase(overrideUri = '') {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const targetUri = overrideUri || env.mongodbUri;

  if (targetUri) {
    await mongoose.connect(targetUri);
    connectionMode = 'external-mongodb';
    logger.info('Connected to external MongoDB instance.');
  } else {
    if (env.isProduction) {
      throw new Error(
        'FATAL: MONGODB_URI must be configured in production when external MongoDB is required.'
      );
    }

    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memoryUri = memoryServerInstance.getUri('phytoguard_db');
    await mongoose.connect(memoryUri);
    connectionMode = 'embedded-mongodb-memory-server';
    logger.info('Connected to embedded MongoDB Memory Server for local/preview development.');
  }

  await seedInitialCatalogIfEmpty();
  await seedDevelopmentReviewAccounts();

  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
  connectionMode = 'disconnected';
}
