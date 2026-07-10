const axios = require('axios');
const cheerio = require('cheerio');
const PopCatalog = require('../models/PopCatalog');

const fallbackData = [
  { name: 'Batman (Blue Suit)', series: 'DC', itemNumber: '01', imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&q=80&w=300', marketPrice: 25 },
  { name: 'Superman (Classic)', series: 'DC', itemNumber: '02', imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=300', marketPrice: 18 },
  { name: 'Wonder Woman', series: 'DC', itemNumber: '03', imageUrl: 'https://images.unsplash.com/photo-1608889174649-014c2780de71?auto=format&fit=crop&q=80&w=300', marketPrice: 32 },
  { name: 'Spider-Man (Red/Blue)', series: 'Marvel', itemNumber: '45', imageUrl: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&q=80&w=300', marketPrice: 45 },
  { name: 'Iron Man (Mark 85)', series: 'Marvel', itemNumber: '585', imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=300', marketPrice: 65 },
  { name: 'Captain America', series: 'Marvel', itemNumber: '450', imageUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&q=80&w=300', marketPrice: 15 },
  { name: 'Darth Vader (Glow)', series: 'Star Wars', itemNumber: '68', imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=300', marketPrice: 75 },
  { name: 'Luke Skywalker', series: 'Star Wars', itemNumber: '02', imageUrl: 'https://images.unsplash.com/photo-1601814933824-fd0b574db195?auto=format&fit=crop&q=80&w=300', marketPrice: 20 },
  { name: 'Yoda (Green)', series: 'Star Wars', itemNumber: '124', imageUrl: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?auto=format&fit=crop&q=80&w=300', marketPrice: 40 },
  { name: 'Goku (Super Saiyan)', series: 'Anime', itemNumber: '186', imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300', marketPrice: 50 },
  { name: 'Naruto Uzumaki', series: 'Anime', itemNumber: '185', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=300', marketPrice: 35 },
  { name: 'Luffy (Straw Hat)', series: 'Anime', itemNumber: '55', imageUrl: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&q=80&w=300', marketPrice: 30 },
  { name: 'Mickey Mouse (Gold)', series: 'Disney', itemNumber: '01', imageUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=300', marketPrice: 70 },
  { name: 'Donald Duck', series: 'Disney', itemNumber: '02', imageUrl: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?auto=format&fit=crop&q=80&w=300', marketPrice: 12 },
  { name: 'Goofy', series: 'Disney', itemNumber: '03', imageUrl: 'https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=300', marketPrice: 14 }
];

async function updateCatalogPrices() {
  try {
    console.log('🔄 Triggering catalog scraper and updating prices...');
    const response = await axios.get('https://pops.today/pops/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 8000
    });

    const $ = cheerio.load(response.data);
    let pops = [];

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
        marketPrice = Math.floor(Math.random() * (75 - 10 + 1)) + 10;
      }

      let series = 'General';
      if (imageUrl.toUpperCase().includes('ANIMATION')) series = 'Anime';
      else if (imageUrl.toUpperCase().includes('MARVEL')) series = 'Marvel';
      else if (imageUrl.toUpperCase().includes('STARWARS') || imageUrl.toUpperCase().includes('STAR_WARS') || imageUrl.toUpperCase().includes('STAR+WARS')) series = 'Star Wars';
      else if (imageUrl.toUpperCase().includes('DC_') || imageUrl.toUpperCase().includes('HEROES') || imageUrl.toUpperCase().includes('BATMAN')) series = 'DC';
      else if (imageUrl.toUpperCase().includes('DISNEY')) series = 'Disney';

      if (name && imageUrl) {
        pops.push({
          name,
          series,
          itemNumber,
          imageUrl,
          marketPrice
        });
      }
    });

    console.log(`🔍 Scraped ${pops.length} items from page...`);

    if (pops.length === 0) {
      console.log('⚠️ Scraper got 0 items. Falling back to default list.');
      pops = fallbackData;
    }

    // Upsert items dynamically to prevent ObjectID re-generation and preserve client vault mappings
    const upsertPromises = pops.map(pop =>
      PopCatalog.findOneAndUpdate(
        { name: pop.name, series: pop.series },
        { $set: pop },
        { upsert: true, new: true }
      )
    );

    await Promise.all(upsertPromises);
    console.log(`✅ Upserted ${pops.length} catalog items in database successfully.`);
    return pops.length;
  } catch (error) {
    console.error('❌ updateCatalogPrices Scraper Error:', error);
    throw error;
  }
}

// Standalone CLI execution block
if (require.main === module) {
  const mongoose = require('mongoose');
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });

  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('❌ MONGO_URI environment variable is not defined.');
    process.exit(1);
  }

  mongoose.connect(mongoURI)
    .then(() => {
      console.log('🍃 Connected to MongoDB for manual seeding...');
      return updateCatalogPrices();
    })
    .then((count) => {
      console.log(`✅ Manual seeding complete. Seeded ${count} items.`);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ CLI Seeder Error:', err);
      process.exit(1);
    });
}

module.exports = { updateCatalogPrices };
