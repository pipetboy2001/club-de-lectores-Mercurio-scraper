const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.clubdelectores.cl/marvel-superheroes-clasico/';

// fetchHTML con retry automático
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
    console.error(`❌ Error al leer stock de "${comic.title}":`, err.message);
    return { ...comic, stock: -1 };
  }
}

function printComics(comics) {
  console.log('\n📉 Cómics ordenados por stock (menos a más):\n');

  comics.forEach(({ title, stock, url }) => {
    let stockText = '';
    let emoji = '';

    if (stock === 0) {
      stockText = '😱 AGOTADO';
      emoji = '🔴';
    } else if (stock > 0 && stock <= 5) {
      stockText = `⚠️ Quedan ${stock} unidades`;
      emoji = '🟠';
    } else if (stock > 5 && stock <= 20) {
      stockText = `🟡 Stock medio: ${stock}`;
      emoji = '🟡';
    } else {
      stockText = `✅ Stock OK: ${stock}`;
      emoji = '🟢';
    }

    console.log(`${emoji}  ${title}\n    → ${stockText}\n    → Link: ${url}\n`);
  });
}

function saveJSON(comics, filename = 'comics-stock.json') {
  fs.writeFileSync(path.resolve(__dirname, filename), JSON.stringify(comics, null, 2));
  console.log(`💾 Guardado JSON en ${filename}`);
}

function saveCSV(comics, filename = 'comics-stock.csv') {
  const header = 'Título,Stock,URL\n';
  const rows = comics.map(({ title, stock, url }) =>
    `"${title.replace(/"/g, '""')}",${stock},"${url}"`
  );
  const csvContent = header + rows.join('\n');
  fs.writeFileSync(path.resolve(__dirname, filename), csvContent);
  console.log(`💾 Guardado CSV en ${filename}`);
}

(async () => {
  try {
    console.log('🚀 Obteniendo lista de cómics...');
    let comics = await getComicLinks();

    console.log(`🧩 Encontrados ${comics.length} ítems. Consultando stock...`);

    const promises = comics.map(c => fetchStock(c));
    comics = await Promise.all(promises);

    comics = comics
      .filter(c => c.stock >= 0)
      .sort((a, b) => a.stock - b.stock);

    printComics(comics);
    saveJSON(comics);
    saveCSV(comics);

  } catch (error) {
    console.error('💥 Error fatal:', error.message);
  }
})();
