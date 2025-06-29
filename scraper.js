const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.clubdelectores.cl/marvel-superheroes-clasico/';

async function fetchHTML(url) {
  const res = await axios.get(url);
  return res.data;
}

async function getComicLinks() {
  const html = await fetchHTML(BASE_URL);
  const $ = cheerio.load(html);
  const comics = [];

  $('.tc-destacados-item').each((i, el) => {
    const title = $(el).find('.tc-destacados-item__titulo').text().trim() || 'Sin título';
    const url = $(el).find('.tc-destacados-item__comprar a').attr('href');

    if (url) {
      comics.push({ title, url, stock: -1 });
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
    console.error(`❌ Error al leer stock de ${comic.title}:`, err.message);
    return { ...comic, stock: -1 };
  }
}

(async () => {
  console.log('🚀 Obteniendo lista de cómics...');
  let comics = await getComicLinks();

  console.log(`🧩 Encontrados ${comics.length} ítems. Solicitando stock...`);

  const promises = comics.map(c => fetchStock(c));
  comics = await Promise.all(promises);

  comics = comics
    .filter(c => c.stock >= 0)
    .sort((a, b) => a.stock - b.stock);

  console.log('📉 Cómics ordenados por menos stock:');
  comics.forEach(c => {
    console.log(`• ${c.title} — ${c.stock} unidades — ${c.url}`);
  });
})();
