import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '../heart_disease_trials.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV to JSON
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const trials = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const trial = {};
        
        headers.forEach((header, index) => {
          trial[header] = values[index] || null;
        });
        
        trials.push(trial);
      }
    }
    
    res.status(200).json(trials);
  } catch (error) {
    console.error('Error reading trials data:', error);
    res.status(500).json({ error: 'Failed to load trials data' });
  }
} 