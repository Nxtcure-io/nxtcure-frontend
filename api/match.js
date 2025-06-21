import fs from 'fs';
import path from 'path';

// Helper function to parse CSV with proper handling of quoted fields
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = parseCSVLine(lines[0]);
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

// Parse a single CSV line, handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      const { description } = req.body;
      
      if (!description || !description.trim()) {
        return res.status(400).json({ error: "Empty description provided" });
      }

      // Read the CSV file
      const csvPath = path.join(process.cwd(), 'heart_disease_trials.csv');
      
      if (!fs.existsSync(csvPath)) {
        console.error('CSV file not found:', csvPath);
        return res.status(500).json({ error: "Clinical trials data not available" });
      }

      const csvData = fs.readFileSync(csvPath, 'utf-8');
      const csvRows = parseCSV(csvData);
      
      console.log('CSV headers:', Object.keys(csvRows[0] || {}));
      console.log('First row contact data:', {
        ContactName: csvRows[0]?.ContactName,
        ContactPhone: csvRows[0]?.ContactPhone,
        ContactEmail: csvRows[0]?.ContactEmail
      });
      
      // Convert CSV data to our format
      const trials = csvRows
        .filter(row => row.NCTId && row.BriefTitle) // Only include trials with valid data
        .map(row => ({
          nct_id: row.NCTId,
          title: row.BriefTitle,
          condition: row.Condition || 'N/A',
          summary: row.BriefSummary || 'N/A',
          inclusion: row.InclusionCriteria || 'N/A',
          exclusion: row.ExclusionCriteria || 'N/A',
          country: row.LocationCountry || 'N/A',
          status: row.OverallStatus || 'N/A',
          phase: row.Phase || 'N/A',
          enrollment: row.EnrollmentCount || 'N/A',
          contact_name: row.ContactName || 'N/A',
          contact_role: row.ContactRole || 'N/A',
          contact_phone: row.ContactPhone || 'N/A',
          contact_email: row.ContactEmail || 'N/A',
          lead_sponsor: row.LeadSponsor || 'N/A',
          sponsor_type: row.SponsorType || 'N/A'
        }));

      console.log(`Loaded ${trials.length} trials from CSV`);

      // Simple keyword matching
      const patientWords = description.toLowerCase().split(/\s+/);
      const scoredTrials = trials.map(trial => {
        const trialText = `${trial.condition} ${trial.summary} ${trial.inclusion} ${trial.exclusion}`.toLowerCase();
        const trialWords = trialText.split(/\s+/);
        
        const commonWords = patientWords.filter(word => 
          trialWords.some(trialWord => trialWord.includes(word) || word.includes(trialWord))
        );
        
        const similarity = commonWords.length / patientWords.length;
        
        return {
          ...trial,
          similarity: Math.round(similarity * 100) / 100
        };
      });

      // Sort by similarity and return top 5
      const topMatches = scoredTrials
        .filter(trial => trial.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      return res.status(200).json({ matches: topMatches });

    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: "Server error occurred" });
    }
  }

  // Handle other methods
  return res.status(405).json({ error: "Method not allowed" });
} 