const cron = require('node-cron');
const { updateCatalogPrices } = require('../scripts/seedCatalog');

function initCron() {
  console.log('⏰ Initializing Catalog Price Auto-Update Cron Scheduler...');

  // Schedule task: Daily at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`⏰ [${timestamp}] CRON TRIGGER: Starting automated Pop catalog market values refresh...`);
    
    try {
      const count = await updateCatalogPrices();
      console.log(`⏰ [${new Date().toISOString()}] CRON SUCCESS: Auto-updated ${count} catalog items cleanly.`);
    } catch (err) {
      console.error(`⏰ [${new Date().toISOString()}] CRON FAILURE: Catalog auto-update task encountered errors:`, err);
    }
  });

  console.log('⏰ Daily Midnight Cron task is scheduled and listening.');
}

module.exports = { initCron };
