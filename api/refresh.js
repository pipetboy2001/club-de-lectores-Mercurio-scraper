import fs from 'fs';
import path from 'path';
import { scrapeComics } from '../scrapers/scraper.js';

export default async function handler(req, res) {
  // Validar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  // Validar API key
  console.log('Header recibido:', req.headers['x-api-key']);
  console.log('API_KEY esperada:', process.env.API_KEY);
  console.log('Todas las headers:', req.headers);


  if (req.headers['x-api-key'] !== process.env.API_KEY) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  // Ejecutar scraping
  try {
    const comics = await scrapeComics();
    const filePath = path.join(process.cwd(), 'data', 'comics.json');
    
    fs.writeFileSync(filePath, JSON.stringify(comics, null, 2), 'utf-8');
    res.status(200).json({ 
      message: 'Scraping ejecutado con éxito',
      count: comics.length
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Error durante scraping',
      details: err.message
    });
  }
}