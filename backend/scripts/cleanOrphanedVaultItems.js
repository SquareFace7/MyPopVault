const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const VaultItem = require('../models/VaultItem');
const PopCatalog = require('../models/PopCatalog');

async function cleanOrphanedVaultItems() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('❌ MONGO_URI is missing');
    process.exit(1);
  }

  try {
    console.log('🍃 Connecting to MongoDB Database...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected.');

    const vaultItems = await VaultItem.find({});
    console.log(`🔍 Inspecting ${vaultItems.length} total VaultItem records in user collections...`);

    let orphanedCount = 0;
    const idsToDelete = [];

    for (const item of vaultItems) {
      if (!item.pop) {
        idsToDelete.push(item._id);
        orphanedCount++;
        continue;
      }
      const catalogItem = await PopCatalog.findById(item.pop);
      if (!catalogItem) {
        idsToDelete.push(item._id);
        orphanedCount++;
      }
    }

    if (idsToDelete.length > 0) {
      await VaultItem.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`🧹 Cleaned & deleted ${orphanedCount} orphaned VaultItem records with missing catalog references.`);
    } else {
      console.log('✅ No orphaned VaultItem records found. User collections are 100% clean!');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Clean Orphaned Items Error:', err);
    process.exit(1);
  }
}

cleanOrphanedVaultItems();
