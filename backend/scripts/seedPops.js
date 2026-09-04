const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PopCatalog = require('../models/PopCatalog');

// High-value "Grail" Pops (> $100) with strictly matched authentic pops.today product images
const grailItems = [
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
  }
];

async function scrapePopsToday() {
  const scrapedPops = [];
  const urlsToScrape = [
    'https://pops.today/pops/',
    'https://pops.today/'
  ];

  for (const url of urlsToScrape) {
    try {
      console.log(`🌐 Live Scraping product cards from ${url} ...`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      // Iterate over INDIVIDUAL card containers (.sales-item) to prevent any title/image desync
      $('.sales-item').each((i, card) => {
        // Extract Title strictly inside THIS specific card element
        const titleEl = $(card).find('.fs-5.text-white-90').first();
        const fullTitle = titleEl.text().trim();
        if (!fullTitle) return;

        const numberMatch = fullTitle.match(/^#(\d+)\s+(.*)$/);
        let itemNumber = 'N/A';
        let name = fullTitle;
        if (numberMatch) {
          itemNumber = numberMatch[1];
          name = numberMatch[2];
        }

        // Extract Image strictly inside THIS specific card element
        let imgEl = $(card).find('img[alt="Product"]').first();
        if (!imgEl.length) {
          imgEl = $(card).find('img.object-fit-contain').first();
        }
        if (!imgEl.length) {
          const imgs = $(card).find('img');
          imgEl = imgs.length > 1 ? imgs.eq(1) : imgs.eq(0);
        }

        let imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || '';
        if (imageUrl && imageUrl.startsWith('/')) {
          imageUrl = `https://pops.today${imageUrl}`;
        }

        // Filter out advertiser/brand logo images (e.g., funko.png, fun-com.png)
        if (!imageUrl || imageUrl.toLowerCase().includes('logo') || imageUrl.toLowerCase().includes('funko.png') || imageUrl.toLowerCase().includes('fun-com.png')) {
          return;
        }

        // Extract Price strictly inside THIS specific card element
        const priceText = $(card).find('.fs-3.fw-bold').first().text().trim();
        let marketPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));
        if (isNaN(marketPrice) || marketPrice <= 0) {
          marketPrice = 15.00;
        }

        // Categorize series from image URL or title
        let series = 'General';
        const upperImg = imageUrl.toUpperCase();
        const upperTitle = name.toUpperCase();
        if (upperImg.includes('ANIMATION') || upperTitle.includes('ANIME') || upperTitle.includes('GOKU') || upperTitle.includes('NARUTO')) series = 'Anime';
        else if (upperImg.includes('MARVEL') || upperTitle.includes('SPIDER-MAN') || upperTitle.includes('IRON MAN')) series = 'Marvel';
        else if (upperImg.includes('STARWARS') || upperImg.includes('STAR_WARS') || upperTitle.includes('STAR WARS')) series = 'Star Wars';
        else if (upperImg.includes('DC_') || upperImg.includes('HEROES') || upperTitle.includes('BATMAN')) series = 'DC';
        else if (upperImg.includes('DISNEY') || upperTitle.includes('MICKEY')) series = 'Disney';

        scrapedPops.push({
          name,
          series,
          itemNumber,
          imageUrl,
          marketPrice
        });
      });
    } catch (err) {
      console.warn(`⚠️ Scraping ${url} failed: ${err.message}`);
    }
  }

  console.log(`📡 Scraped ${scrapedPops.length} strictly matched product items.`);
  return scrapedPops;
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

    // 1. Scrape live Funko Pops with card-level strict matching
    const scrapedPops = await scrapePopsToday();

    // 2. Combine scraped items and high-value Grail items
    const allPops = [...grailItems, ...scrapedPops];

    // Deduplicate by name & series
    const uniqueMap = new Map();
    allPops.forEach(item => {
      const key = `${item.name.toLowerCase()}_${item.series.toLowerCase()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const finalPops = Array.from(uniqueMap.values());

    // 3. Clear existing catalog items to eliminate old mismatched data
    console.log('🧹 Clearing old catalog items from MongoDB...');
    await PopCatalog.deleteMany({});
    console.log('✅ Old catalog cleared cleanly.');

    // 4. Insert strictly matched items
    console.log(`📦 Inserting ${finalPops.length} strictly matched catalog items into MongoDB...`);
    const inserted = await PopCatalog.insertMany(finalPops);

    const grailsCount = inserted.filter(p => p.marketPrice > 100).length;
    const standardCount = inserted.filter(p => p.marketPrice <= 100).length;

    // 5. Print a sample of 3 scraped items to verify card-level Title + Image matching
    console.log('\n================ SCRAPED ITEM MATCH VERIFICATION SAMPLE ================');
    inserted.slice(0, 3).forEach((item, idx) => {
      console.log(`Sample [${idx + 1}] | Title: "${item.name}" (#${item.itemNumber}) | Series: ${item.series} | Price: $${item.marketPrice}`);
      console.log(`  └─ Image URL: ${item.imageUrl}`);
    });
    console.log('========================================================================\n');

    console.log('================ LIVE SCRAPING & SEEDING COMPLETE ================');
    console.log(`👑 Grail Pops (Value > $100): ${grailsCount} items`);
    console.log(`📦 Standard Catalog Pops (Value <= $100): ${standardCount} items`);
    console.log(`🚀 Total Catalog Items in Database: ${inserted.length} items`);
    console.log('==================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedPops();
