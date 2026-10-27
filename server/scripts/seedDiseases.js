import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { Disease } from '../src/models/Disease.js';
import { INITIAL_DISEASES } from '../src/utils/seedData.js';
import { logger } from '../src/utils/logger.js';

async function runSeedDiseases() {
  try {
    await connectDatabase();

    let upserted = 0;
    for (const item of INITIAL_DISEASES) {
      await Disease.findOneAndUpdate(
        { classLabel: item.classLabel },
        { $set: item },
        { upsert: true, new: true, runValidators: true }
      );
      upserted += 1;
    }

    logger.info(`Upserted ${upserted} PlantVillage disease guidance records into MongoDB.`);
  } catch (err) {
    logger.error('Disease seeding failed', { message: err?.message });
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

runSeedDiseases();
