const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Pop = require('./models/Pop');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI || mongoURI === 'your_connection_string_here') {
  console.error('❌ Error: MONGO_URI is not set or configured in .env');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(mongoURI);
    console.log('🍃 Connected to MongoDB for seeding...');

    // Load seeds.json
    const seedsPath = path.join(__dirname, 'seeds.json');
    const seedsData = JSON.parse(fs.readFileSync(seedsPath, 'utf8'));

    // Clear existing collection
    await Pop.deleteMany({});
    console.log('🗑️  Cleared existing pops collection.');

    // Insert seeds
    const insertedPops = await Pop.insertMany(seedsData);
    console.log(`✅ Successfully seeded database with ${insertedPops.length} Pop entries!`);

    // Exit gracefully
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB. Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
