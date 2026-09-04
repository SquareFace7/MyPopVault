const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PopCatalog = require('../models/PopCatalog');

// Reliable, hardcoded mock dataset (20 Funko Pops: 6 Grails > $100 and 14 Standard <= $100)
const mockPopsCatalog = [
  // ================= 6 GRAIL ITEMS (Market Value > $100) =================
  {
    name: 'Planet Arlia Vegeta',
    series: 'Anime',
    itemNumber: '10',
    imageUrl: 'https://pops.today/imagep?r=POP_ANIMATION%2FAnimation+186_160x160.webp',
    marketPrice: 1250.00
  },
  {
    name: 'Freddy Funko (as Jaime Lannister)',
    series: 'General',
    itemNumber: '24',
    imageUrl: 'https://pops.today/imagep?r=POP_TELEVISION%2FTelevision+24_160x160.webp',
    marketPrice: 850.00
  },
  {
    name: 'Batman (Metallic Blue SDCC)',
    series: 'DC',
    itemNumber: '01',
    imageUrl: 'https://pops.today/imagep?r=POP_HEROES%2FHeroes+01_160x160.webp',
    marketPrice: 650.00
  },
  {
    name: 'Headless Hershel Greene',
    series: 'General',
    itemNumber: '153',
    imageUrl: 'https://pops.today/imagep?r=POP_TELEVISION%2FTelevision+153_160x160.webp',
    marketPrice: 450.00
  },
  {
    name: 'Mickey Mouse (Solid 24k Gold)',
    series: 'Disney',
    itemNumber: '01',
    imageUrl: 'https://pops.today/imagep?r=POP_DISNEY%2FDisney+01_160x160.webp',
    marketPrice: 350.00
  },
  {
    name: 'Darth Vader (Metallic Glow)',
    series: 'Star Wars',
    itemNumber: '68',
    imageUrl: 'https://pops.today/imagep?r=POP_STAR_WARS%2FStar+Wars+68_160x160.webp',
    marketPrice: 220.00
  },

  // ================= 14 STANDARD ITEMS (Market Value <= $100) =================
  {
    name: 'Thanos (Infinity Gauntlet Glow)',
    series: 'Marvel',
    itemNumber: '289',
    imageUrl: 'https://pops.today/imagep?r=POP_MARVEL%2FMarvel+289_160x160.webp',
    marketPrice: 95.00
  },
  {
    name: 'Iron Man (Mark 50 Chrome)',
    series: 'Marvel',
    itemNumber: '285',
    imageUrl: 'https://pops.today/imagep?r=POP_MARVEL%2FMarvel+285_160x160.webp',
    marketPrice: 85.00
  },
  {
    name: 'Spider-Man (Symbiote Glow)',
    series: 'Marvel',
    itemNumber: '362',
    imageUrl: 'https://pops.today/imagep?r=POP_MARVEL%2FMarvel+362_160x160.webp',
    marketPrice: 75.00
  },
  {
    name: 'Wolverine (Classic Yellow)',
    series: 'Marvel',
    itemNumber: '555',
    imageUrl: 'https://pops.today/imagep?r=POP_MARVEL%2FMarvel+555_160x160.webp',
    marketPrice: 65.00
  },
  {
    name: 'Grogu (The Child in Pod)',
    series: 'Star Wars',
    itemNumber: '368',
    imageUrl: 'https://pops.today/imagep?r=POP_STAR_WARS%2FStar+Wars+368_160x160.webp',
    marketPrice: 55.00
  },
  {
    name: 'Captain America (Quantum Suit)',
    series: 'Marvel',
    itemNumber: '450',
    imageUrl: 'https://pops.today/imagep?r=POP_MARVEL%2FMarvel+450_160x160.webp',
    marketPrice: 48.50
  },
  {
    name: 'Deadpool (Unmasked)',
    series: 'Marvel',
    itemNumber: '180',
    imageUrl: 'https://pops.today/imagep?r=POP_MARVEL%2FMarvel+180_160x160.webp',
    marketPrice: 42.00
  },
  {
    name: 'Scarlet Witch (Glow Edition)',
    series: 'Marvel',
    itemNumber: '1007',
    imageUrl: 'https://pops.today/imagep?r=POP_MARVEL%2FMarvel+1007+%28Glows%29_160x160.webp',
    marketPrice: 38.00
  },
  {
    name: 'Sam Manson (Nickelodeon)',
    series: 'Anime',
    itemNumber: '2002',
    imageUrl: 'https://pops.today/imagep?r=POP_ANIMATION%2FAnimation+2002_160x160.webp',
    marketPrice: 32.50
  },
  {
    name: 'Max (Disney Princess)',
    series: 'Disney',
    itemNumber: '1577',
    imageUrl: 'https://pops.today/imagep?r=POP_DISNEY%2FDisney+1577_160x160.webp',
    marketPrice: 28.00
  },
  {
    name: 'Wicked Tin Man',
    series: 'General',
    itemNumber: '1931',
    imageUrl: 'https://pops.today/imagep?r=POP_MOVIES%2FMovies+1931_160x160.webp',
    marketPrice: 24.50
  },
  {
    name: 'Ripster (Street Sharks)',
    series: 'General',
    itemNumber: '1711',
    imageUrl: 'https://pops.today/imagep?r=POP_TELEVISION%2FTelevision+1711_160x160.webp',
    marketPrice: 19.99
  },
  {
    name: 'Goku (Super Saiyan Form)',
    series: 'Anime',
    itemNumber: '186',
    imageUrl: 'https://pops.today/imagep?r=POP_ANIMATION%2FAnimation+186_160x160.webp',
    marketPrice: 16.50
  },
  {
    name: 'Classic Batman',
    series: 'DC',
    itemNumber: '01',
    imageUrl: 'https://pops.today/imagep?r=POP_HEROES%2FHeroes+01_160x160.webp',
    marketPrice: 15.99
  }
];

async function seedPops() {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('❌ MONGO_URI environment variable is missing.');
    process.exit(1);
  }

  try {
    console.log('🍃 Connecting to MongoDB Database...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully.');

    console.log('🧹 Clearing existing catalog items from MongoDB...');
    await PopCatalog.deleteMany({});
    console.log('✅ Existing catalog cleared cleanly.');

    console.log(`📦 Inserting ${mockPopsCatalog.length} curated Funko Pops into MongoDB...`);
    const insertedItems = await PopCatalog.insertMany(mockPopsCatalog);

    const grails = insertedItems.filter(item => item.marketPrice > 100);
    const standard = insertedItems.filter(item => item.marketPrice <= 100);

    console.log('\n================ SEEDING VERIFICATION & LOGS ================');
    console.log(`👑 Grail Pops (Value > $100): ${grails.length} items`);
    grails.forEach((g, idx) => {
      console.log(`  [G${idx + 1}] ${g.name} (${g.series}) - $${g.marketPrice} | URL: ${g.imageUrl}`);
    });

    console.log(`\n📦 Standard Pops (Value <= $100): ${standard.length} items`);
    standard.forEach((s, idx) => {
      console.log(`  [S${idx + 1}] ${s.name} (${s.series}) - $${s.marketPrice} | URL: ${s.imageUrl}`);
    });

    console.log('\n============================================================');
    console.log(`🚀 Total Inserted Funko Pops: ${insertedItems.length} items`);
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedPops();
