const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PopCatalog = require('../models/PopCatalog');

// Helper: Asynchronous delay function to avoid rate-limiting/IP bans
const delay = ms => new Promise(res => setTimeout(res, ms));

async function collectProductUrlsFromGrids() {
  const categoryGridUrls = [
    'https://pops.today/pops/',
    'https://pops.today/',
    'https://pops.today/category/animation',
    'https://pops.today/category/marvel',
    'https://pops.today/category/star-wars',
    'https://pops.today/category/heroes',
    'https://pops.today/category/movies',
    'https://pops.today/category/television',
    'https://pops.today/category/disney'
  ];

  const excludeKeywords = [
    '/category/', '/user/', '/users/', '/usersc/', '/articles/',
    '/about', '/contact', '/terms', '/privacy', '/subscribe',
    '/login', '/join', 'top-rated', 'name/', 'top-value',
    '/cdn-cgi/', '/pops/top-', '/pops/popular'
  ];

  const gridDetailUrls = new Set();
  console.log(`🌐 Collecting individual product detail URLs from ${categoryGridUrls.length} category grid pages...`);

  for (const catUrl of categoryGridUrls) {
    try {
      const response = await axios.get(catUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      $('a[href]').each((i, a) => {
        let href = $(a).attr('href');
        if (!href) return;
        href = href.trim();
        if (href.startsWith('/')) href = `https://pops.today${href}`;
        if (!href.startsWith('https://pops.today/')) return;

        const isExcluded = excludeKeywords.some(kw => href.includes(kw));
        if (isExcluded) return;

        const pathSegment = href.replace('https://pops.today/', '');
        const segments = pathSegment.split('/').filter(Boolean);

        // Product detail URLs have 2 path segments (e.g., category/product-slug)
        if (segments.length === 2) {
          gridDetailUrls.add(href);
        }
      });
    } catch (err) {
      console.warn(`⚠️ Failed to collect URLs from ${catUrl}: ${err.message}`);
    }
  }

  console.log(`✅ Extracted ${gridDetailUrls.size} unique product detail URLs from category grids.`);
  return Array.from(gridDetailUrls);
}

async function scrapePopsToday() {
  // 1. Specific Grails Array (Authentic high-value items > $100)
  const grailUrls = [
    'https://pops.today/funko-original/se-freddy-funko-as-pennywise',
    'https://pops.today/funko-original/58-oompa-loompa-golden-ticket-gold-funko',
    'https://pops.today/funko-original/14-freddy-funko-as-wolfman-flocked-funko',
    'https://pops.today/animation/10-vegeta-planet-arlia-dragon-ball-z'
  ];

  // 2. Scrape Category Grids ONLY to collect individual product URLs
  const gridUrls = await collectProductUrlsFromGrids();

  // 3. Combine Grails URLs & Grid URLs into a single deduplicated list
  const combinedUrls = Array.from(new Set([...grailUrls, ...gridUrls]));
  console.log(`\n👑 Deep-scraping ${combinedUrls.length} total product detail pages with a 1500ms delay...`);

  const scrapedItems = [];

  // 4. Loop through combined list SEQUENTIALLY (for...of loop, strictly NO Promise.all)
  for (const url of combinedUrls) {
    // Before making the Axios request, wait 1.5 seconds to prevent rate-limiting/IP bans
    await delay(1500);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const fullTitle = $('h1').text().trim();
      if (!fullTitle) continue;

      const numberMatch = fullTitle.match(/^#?(\d+)\s+(.*)$/);
      let itemNumber = 'N/A';
      let name = fullTitle;
      if (numberMatch) {
        itemNumber = numberMatch[1];
        name = numberMatch[2];
      }

      let imgEl = $('img[alt*="Funko"]').first();
      if (!imgEl.length) imgEl = $('img.img-fluid').first();
      if (!imgEl.length) imgEl = $('img').first();

      let imageUrl = imgEl.attr('src') || imgEl.attr('data-src') || '';
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `https://pops.today${imageUrl}`;
      }

      // Filter out empty titles or brand/logo images
      if (!name || !imageUrl || imageUrl.toLowerCase().includes('logo') || imageUrl.toLowerCase().includes('funko.png') || imageUrl.toLowerCase().includes('fun-com.png')) {
        continue;
      }

      // Extract true collector value ("Estimated Value (USD)")
      let marketPrice = 0;
      $('tr').each((i, row) => {
        const text = $(row).text();
        if (text.includes('Estimated Value (USD)')) {
          const match = text.match(/\$\s*([\d,]+\.?\d*)/);
          if (match) {
            marketPrice = parseFloat(match[1].replace(/,/g, ''));
          }
        }
      });

      if (isNaN(marketPrice) || marketPrice <= 0) continue;

      let series = 'General';
      const upperUrl = url.toUpperCase();
      const upperTitle = name.toUpperCase();
      const upperImg = imageUrl.toUpperCase();

      if (upperUrl.includes('ANIMATION') || upperTitle.includes('DRAGON BALL') || upperTitle.includes('VEGETA') || upperImg.includes('ANIMATION')) series = 'Anime';
      else if (upperUrl.includes('MARVEL') || upperTitle.includes('MARVEL') || upperImg.includes('MARVEL')) series = 'Marvel';
      else if (upperUrl.includes('STARWARS') || upperTitle.includes('STAR WARS') || upperImg.includes('STARWARS')) series = 'Star Wars';
      else if (upperUrl.includes('HEROES') || upperUrl.includes('DC_') || upperTitle.includes('BATMAN')) series = 'DC';
      else if (upperUrl.includes('DISNEY') || upperTitle.includes('DISNEY') || upperImg.includes('DISNEY')) series = 'Disney';
      else if (upperUrl.includes('MOVIES') || upperTitle.includes('MOVIES') || upperImg.includes('MOVIES')) series = 'Movies';
      else if (upperUrl.includes('TELEVISION') || upperTitle.includes('TELEVISION') || upperImg.includes('TELEVISION')) series = 'Television';

      const item = { name, series, itemNumber, imageUrl, marketPrice };
      scrapedItems.push(item);
      console.log(`  └─ [${scrapedItems.length}/${combinedUrls.length}] Deep-scraped: "${name}" (#${itemNumber}) | Series: ${series} | True Value: $${marketPrice}`);
    } catch (err) {
      console.warn(`⚠️ Deep-scraping ${url} failed: ${err.message}`);
    }
  }

  // Deduplicate scraped items by name & imageUrl
  const uniqueMap = new Map();
  scrapedItems.forEach(item => {
    const key = `${item.name.toLowerCase()}_${item.imageUrl.toLowerCase()}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  const finalScraped = Array.from(uniqueMap.values());
  console.log(`\n📡 Scraped ${finalScraped.length} 100% authentic, deep-scraped product items with true market value.`);
  return finalScraped;
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

    // 1. Perform full deep-scraping on all product detail pages with rate-limit delay
    const catalogItems = await scrapePopsToday();

    // 2. Upsert newly scraped, 100% authentic catalog items without destroying existing foreign keys
    console.log(`📦 Upserting ${catalogItems.length} authentic catalog items into MongoDB...`);
    const upsertPromises = catalogItems.map(pop =>
      PopCatalog.findOneAndUpdate(
        { name: pop.name, series: pop.series },
        { $set: pop },
        { upsert: true, new: true }
      )
    );
    const inserted = await Promise.all(upsertPromises);

    const grailsCount = inserted.filter(p => p.marketPrice > 100).length;
    const standardCount = inserted.filter(p => p.marketPrice <= 100).length;

    // 3. Print sample of scraped items in console logs
    console.log('\n================ DEEP-SCRAPED ITEM MATCH & TRUE MARKET VALUE SAMPLE ================');
    inserted.slice(0, 5).forEach((item, idx) => {
      console.log(`Sample [${idx + 1}] | Title: "${item.name}" (#${item.itemNumber}) | Series: ${item.series} | Collector Value: $${item.marketPrice}`);
      console.log(`  └─ Image URL: ${item.imageUrl}`);
    });
    console.log('====================================================================================\n');

    console.log('================ LIVE DEEP-SCRAPING & SEEDING COMPLETE ================');
    console.log(`👑 High-Value Grails (Price > $100): ${grailsCount} items`);
    console.log(`📦 Standard Items (Price <= $100): ${standardCount} items`);
    console.log(`🚀 Total Catalog Items in Database: ${inserted.length} items`);
    console.log('=======================================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedPops();
