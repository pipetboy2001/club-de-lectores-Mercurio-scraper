import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'comics.json');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const comics = JSON.parse(data);
    res.status(200).json(comics);
  } catch (err) {
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
}