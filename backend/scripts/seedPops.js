const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PopCatalog = require('../models/PopCatalog');

// High-value "Grail" Pops (Market value strictly > $100)
const grailItems = [
  { name: 'Planet Arlia Vegeta', series: 'Anime', itemNumber: '10', imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300', marketPrice: 1250.00 },
  { name: 'Freddy Funko (as Jaime Lannister)', series: 'General', itemNumber: '24', imageUrl: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&q=80&w=300', marketPrice: 850.00 },
  { name: 'Batman (Metallic Blue SDCC)', series: 'DC', itemNumber: '01', imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=300', marketPrice: 650.00 },
  { name: 'Headless Hershel Greene', series: 'General', itemNumber: '153', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=300', marketPrice: 450.00 },
  { name: 'Mickey Mouse (Solid 24k Gold)', series: 'Disney', itemNumber: '01', imageUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=300', marketPrice: 350.00 },
  { name: 'Darth Vader (Glow in the Dark Metallic)', series: 'Star Wars', itemNumber: '68', imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=300', marketPrice: 220.00 },
  { name: 'Thanos (Infinity Gauntlet Glow)', series: 'Marvel', itemNumber: '289', imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=300', marketPrice: 200.00 },
  { name: 'Yoda (Gold Chrome NYCC)', series: 'Star Wars', itemNumber: '124', imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574db195?auto=format&fit=crop&q=80&w=300', marketPrice: 180.00 },
  { name: 'Tony Stark (Endgame Unmasked SDCC)', series: 'Marvel', itemNumber: '449', imageUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&q=80&w=300', marketPrice: 175.00 },
  { name: 'Goku (Super Saiyan Rose Glow)', series: 'Anime', itemNumber: '260', imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300', marketPrice: 160.00 },
  { name: 'Spider-Man (Symbiote Glow)', series: 'Marvel', itemNumber: '362', imageUrl: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&q=80&w=300', marketPrice: 140.00 },
  { name: 'Iron Man (Mark 50 Chrome)', series: 'Marvel', itemNumber: '285', imageUrl: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&q=80&w=300', marketPrice: 120.00 }
];

// Standard Catalog Pops (Market value <= $100)
const standardItems = [
  { name: 'Wolverine (Classic Yellow)', series: 'Marvel', itemNumber: '555', imageUrl: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&q=80&w=300', marketPrice: 95.00 },
  { name: 'Grogu (The Child in Pod)', series: 'Star Wars', itemNumber: '368', imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574db195?auto=format&fit=crop&q=80&w=300', marketPrice: 90.00 },
  { name: 'Maleficent (Dragon Form)', series: 'Disney', itemNumber: '720', imageUrl: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?auto=format&fit=crop&q=80&w=300', marketPrice: 75.00 },
  { name: 'Captain America (Quantum Suit)', series: 'Marvel', itemNumber: '450', imageUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&q=80&w=300', marketPrice: 65.00 },
  { name: 'Deadpool (Unmasked)', series: 'Marvel', itemNumber: '180', imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=300', marketPrice: 60.00 },
  { name: 'Boba Fett (Mandalorian Armor)', series: 'Star Wars', itemNumber: '297', imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=300', marketPrice: 55.00 },
  { name: 'Superman (Classic Red/Blue)', series: 'DC', itemNumber: '02', imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=300', marketPrice: 48.00 },
  { name: 'Thor (Endgame Stormbreaker)', series: 'Marvel', itemNumber: '452', imageUrl: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&q=80&w=300', marketPrice: 45.00 },
  { name: 'Stitch (Aloha Shirt)', series: 'Disney', itemNumber: '1049', imageUrl: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?auto=format&fit=crop&q=80&w=300', marketPrice: 40.00 },
  { name: 'Wonder Woman (Golden Armor)', series: 'DC', itemNumber: '03', imageUrl: 'https://images.unsplash.com/photo-1608889174649-014c2780de71?auto=format&fit=crop&q=80&w=300', marketPrice: 38.00 },
  { name: 'Luffy (Straw Hat Pirate)', series: 'Anime', itemNumber: '55', imageUrl: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&q=80&w=300', marketPrice: 35.00 },
  { name: 'Elsa (Frozen 2)', series: 'Disney', itemNumber: '595', imageUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=300', marketPrice: 30.00 },
  { name: 'Luke Skywalker (Jedi Knight)', series: 'Star Wars', itemNumber: '02', imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574db195?auto=format&fit=crop&q=80&w=300', marketPrice: 28.00 },
  { name: 'Batman (Blue Suit)', series: 'DC', itemNumber: '01', imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=300', marketPrice: 25.00 },
  { name: 'Donald Duck (Classic)', series: 'Disney', itemNumber: '02', imageUrl: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?auto=format&fit=crop&q=80&w=300', marketPrice: 18.00 },
  { name: 'Goofy (Classic Outfit)', series: 'Disney', itemNumber: '03', imageUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=300', marketPrice: 14.00 }
];

async function scrapePopsToday() {
  try {
    console.log('🌐 Scraping live catalog data from https://pops.today/pops/ ...');
    const response = await axios.get('https://pops.today/pops/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const scrapedPops = [];

    $('.sales-item').each((i, el) => {
      const infoText = $(el).find('.fs-5.text-white-90').first().text().trim();
      const numberMatch = infoText.match(/^#(\d+)\s+(.*)$/);
      let itemNumber = 'N/A';
      let name = infoText;
      if (numberMatch) {
        itemNumber = numberMatch[1];
        name = numberMatch[2];
      }
      const imageUrl = $(el).find('img[alt="Product"]').first().attr('src') || '';
      const priceText = $(el).find('.fs-3.fw-bold').first().text().trim();
      let marketPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      if (isNaN(marketPrice) || marketPrice <= 0) {
        marketPrice = 15.00;
      }

      let series = 'General';
      const upperImg = imageUrl.toUpperCase();
      if (upperImg.includes('ANIMATION')) series = 'Anime';
      else if (upperImg.includes('MARVEL')) series = 'Marvel';
      else if (upperImg.includes('STARWARS') || upperImg.includes('STAR_WARS') || upperImg.includes('STAR+WARS')) series = 'Star Wars';
      else if (upperImg.includes('DC_') || upperImg.includes('HEROES') || upperImg.includes('BATMAN')) series = 'DC';
      else if (upperImg.includes('DISNEY')) series = 'Disney';

      if (name && imageUrl) {
        scrapedPops.push({
          name,
          series,
          itemNumber,
          imageUrl,
          marketPrice
        });
      }
    });

    console.log(`📡 Scraped ${scrapedPops.length} live items from pops.today.`);
    return scrapedPops;
  } catch (error) {
    console.warn('⚠️ Web scraping pops.today failed or timed out:', error.message);
    return [];
  }
}

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

    // Fetch live scraped pops from pops.today
    const scrapedPops = await scrapePopsToday();

    // Combine guaranteed Grails (> $100), standard items, and scraped items
    const combinedPops = [...grailItems, ...standardItems, ...scrapedPops];

    // Deduplicate by name & series
    const uniquePopsMap = new Map();
    combinedPops.forEach(item => {
      const key = `${item.name.toLowerCase()}_${item.series.toLowerCase()}`;
      if (!uniquePopsMap.has(key)) {
        uniquePopsMap.set(key, item);
      }
    });

    const finalPops = Array.from(uniquePopsMap.values());

    console.log(`📦 Upserting ${finalPops.length} unique catalog items into MongoDB...`);

    const upsertPromises = finalPops.map(pop =>
      PopCatalog.findOneAndUpdate(
        { name: pop.name, series: pop.series },
        { $set: pop },
        { upsert: true, new: true }
      )
    );

    await Promise.all(upsertPromises);

    const grailsCount = finalPops.filter(p => p.marketPrice > 100).length;
    const standardCount = finalPops.filter(p => p.marketPrice <= 100).length;

    console.log('\n================ DATA SEEDING COMPLETE ================');
    console.log(`👑 High-Value "Grail" Pops (> $100): ${grailsCount} items`);
    console.log(`📦 Standard Catalog Pops (<= $100): ${standardCount} items`);
    console.log(`🚀 Total Catalog Items in Database: ${finalPops.length} items`);
    console.log('=======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Data Seeding Error:', error);
    process.exit(1);
  }
}

seedPops();
