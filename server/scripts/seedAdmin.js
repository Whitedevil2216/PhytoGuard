import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { logger } from '../src/utils/logger.js';

async function runSeedAdmin() {
  const adminEmail = (process.env.ADMIN_SEED_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || '';
  const adminName = (process.env.ADMIN_SEED_NAME || 'PhytoGuard Administrator').trim();

  if (!adminEmail || !adminPassword) {
    console.error(
      'ERROR: Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD environment variables before running seedAdmin.js.'
    );
    console.error(
      'PowerShell example:\n  $env:ADMIN_SEED_EMAIL="admin@college.edu"; $env:ADMIN_SEED_PASSWORD="StrongPassword#2026"; npm run seed:admin'
    );
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error('ERROR: ADMIN_SEED_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    await connectDatabase();
    const passwordHash = await User.hashPassword(adminPassword);

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      existing.name = adminName;
      existing.passwordHash = passwordHash;
      existing.role = 'admin';
      existing.status = 'active';
      await existing.save();
      logger.info(`Updated existing administrator account: ${adminEmail}`);
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
      });
      logger.info(`Created new administrator account: ${adminEmail}`);
    }
  } catch (err) {
    logger.error('Admin seeding failed', { message: err?.message });
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

runSeedAdmin();
