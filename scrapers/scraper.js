const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.clubdelectores.cl/marvel-superheroes-clasico/';
const HOST = 'https://www.clubdelectores.cl';

async function fetchHTML(url, retries = 3) {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`🔄 Reintentando ${url}... quedan ${retries} intentos`);
      await new Promise(r => setTimeout(r, 1000));
      return fetchHTML(url, retries - 1);
    }
    throw error;
  }
}

async function getComicLinks() {
  const html = await fetchHTML(BASE_URL);
  const $ = cheerio.load(html);
  const comics = [];

  $('.tc-destacados-item').each((_, el) => {
    const title = $(el).find('.tc-destacados-item__titulo').text().trim() || 'Sin título';
    const url = $(el).find('.tc-destacados-item__comprar a').attr('href');
    const imgSrc = $(el).find('img').attr('src');
    const image = imgSrc ? imgSrc.startsWith('http') ? imgSrc : `${HOST}${imgSrc}` : null;

    if (url) {
      comics.push({ title, url, stock: -1, image });
    }
  });

  return comics;
}

async function fetchStock(comic) {
  try {
    const html = await fetchHTML(comic.url);
    const $ = cheerio.load(html);

    const label = $('strong:contains("Stock disponible:")');
    let stock = 0;

    if (label.length > 0) {
      const text = label.parent().text();
      const match = text.match(/Stock disponible:\s*(\d+)/);
      if (match) stock = parseInt(match[1], 10);
    }

    return { ...comic, stock };
  } catch (err) {
    console.error(`❌ Error al leer stock de "${comic.title}":`, err.message);
    return { ...comic, stock: -1 };
  }
}

async function scrapeComics() {
  const comics = await getComicLinks();
  const results = await Promise.all(comics.map(fetchStock));
  return results.filter(c => c.stock >= 0).sort((a, b) => a.stock - b.stock);
}

module.exports = { scrapeComics };
