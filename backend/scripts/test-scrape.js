const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://pops.today/pops/', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}).then(res => {
  const $ = cheerio.load(res.data);
  $('.sales-item').each((i, el) => {
    if (i < 5) {
      console.log(`\n=== Card ${i} ===`);
      const infoText = $(el).find('.fs-5.text-white-90').first().text().trim();
      const numberMatch = infoText.match(/^#(\d+)\s+(.*)$/);
      let itemNumber = 'N/A';
      let name = infoText;
      if (numberMatch) {
        itemNumber = numberMatch[1];
        name = numberMatch[2];
      }
      const imageSrc = $(el).find('img[alt="Product"]').first().attr('src') || '';
      const priceText = $(el).find('.fs-3.fw-bold').first().text().trim();
      const marketPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

      let series = 'General';
      if (imageSrc.toUpperCase().includes('ANIMATION')) series = 'Anime';
      else if (imageSrc.toUpperCase().includes('MARVEL')) series = 'Marvel';
      else if (imageSrc.toUpperCase().includes('STARWARS') || imageSrc.toUpperCase().includes('STAR_WARS') || imageSrc.toUpperCase().includes('STAR+WARS')) series = 'Star Wars';
      else if (imageSrc.toUpperCase().includes('DC_') || imageSrc.toUpperCase().includes('HEROES') || imageSrc.toUpperCase().includes('BATMAN')) series = 'DC';
      else if (imageSrc.toUpperCase().includes('DISNEY')) series = 'Disney';

      console.log('Original Text:', infoText);
      console.log('Parsed Name:', name);
      console.log('Parsed Number:', itemNumber);
      console.log('Parsed Image:', imageSrc);
      console.log('Parsed Price:', marketPrice);
      console.log('Parsed Series:', series);
    }
  });
}).catch(err => console.error(err));
