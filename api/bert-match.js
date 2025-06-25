import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { pipeline } from '@xenova/transformers';

let bertModel = null;

async function getBertModel() {
  if (!bertModel) {
    bertModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return bertModel;
}

function meanPool(embeddings) {
  // embeddings: [tokens, dims] => [dims]
  const dims = embeddings[0].length;
  const avg = new Array(dims).fill(0);
  for (const vec of embeddings) {
    for (let d = 0; d < dims; d++) {
      avg[d] += vec[d];
    }
  }
  for (let d = 0; d < dims; d++) {
    avg[d] /= embeddings.length;
  }
  return avg;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function readTrialsFromCSV() {
  const csvPath = path.join(__dirname, '../all_conditions_trials.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error('all_conditions_trials.csv not found');
  }
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  return parsed.data;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { patientDescription, topK = 5 } = req.body;
    if (!patientDescription) {
      return res.status(400).json({ error: 'Patient description is required' });
    }

    // Read trials from CSV
    let trials;
    try {
      trials = readTrialsFromCSV();
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }

    // Prepare trial texts
    const trialTexts = trials.map(trial => `
      Condition: ${trial.Condition || ''}
      Title: ${trial.BriefTitle || ''}
      Summary: ${trial.BriefSummary || ''}
      Inclusion: ${trial.InclusionCriteria || ''}
      Intervention: ${trial.InterventionName || ''}
      Phase: ${trial.Phase || ''}
      Status: ${trial.OverallStatus || ''}
    `.trim());

    // Load BERT model
    const model = await getBertModel();

    // Compute patient embedding
    const patientEmbeddingTokens = await model(patientDescription);
    const patientEmbedding = meanPool(patientEmbeddingTokens.data[0]);

    // Compute trial embeddings in batches
    const batchSize = 10;
    const trialEmbeddings = [];
    for (let i = 0; i < trialTexts.length; i += batchSize) {
      const batch = trialTexts.slice(i, i + batchSize);
      const batchEmbeddings = await model(batch);
      for (const tokens of batchEmbeddings.data) {
        trialEmbeddings.push(meanPool(tokens));
      }
    }

    // Compute similarities
    const similarities = trialEmbeddings.map(e => cosineSimilarity(patientEmbedding, e));
    // Get topK indices
    const topIndices = similarities
      .map((score, idx) => ({ score, idx }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.idx);

    // Prepare matches
    const matches = topIndices.map(idx => {
      const trial = trials[idx];
      return {
        nct_id: trial.NCTId,
        title: trial.BriefTitle,
        condition: trial.Condition,
        summary: trial.BriefSummary,
        inclusion: trial.InclusionCriteria,
        exclusion: trial.ExclusionCriteria,
        country: trial.LocationCountry,
        status: trial.OverallStatus,
        phase: trial.Phase,
        enrollment: trial.EnrollmentCount,
        contact_name: trial.ContactName,
        contact_role: trial.ContactRole,
        contact_phone: trial.ContactPhone,
        contact_email: trial.ContactEmail,
        lead_sponsor: trial.LeadSponsor,
        sponsor_type: trial.SponsorType
      };
    });

    res.status(200).json({ matches, total_found: matches.length, method: 'bert' });
  } catch (error) {
    console.error('Error in bert-match endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 