import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { pipeline } from '@xenova/transformers';

let model = null;
let trialEmbeddings = null;
let trialsMap = null;

async function initializeMatcher() {
  if (model && trialEmbeddings && trialsMap) {
    return; // Already initialized
  }

  // Load the model
  model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  // Load pre-computed trial embeddings
  const embeddingsPath = path.join(process.cwd(), 'trial_embeddings.json');
  const embeddingsData = fs.readFileSync(embeddingsPath, 'utf8');
  trialEmbeddings = JSON.parse(embeddingsData);

  // Load trial data to map NCTId back to trial info
  const csvPath = path.join(process.cwd(), 'filtered_trials.csv');
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
  
  trialsMap = new Map();
  for (const trial of parsed.data) {
    trialsMap.set(trial.NCTId, trial);
  }
}

function meanPool(embeddings) {
  const avg = new Array(embeddings[0].length).fill(0);
  for (const vec of embeddings) {
    for (let d = 0; d < vec.length; d++) {
      avg[d] += vec[d];
    }
  }
  for (let d = 0; d < avg.length; d++) {
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { patientDescription, topK = 5 } = req.body;
    if (!patientDescription) {
      return res.status(400).json({ error: 'Patient description is required' });
    }

    await initializeMatcher();

    // Compute patient embedding
    const patientEmbeddingTokens = await model(patientDescription, { pooling: 'mean', normalize: true });
    const patientEmbedding = patientEmbeddingTokens.data;
    
    const nctIds = Object.keys(trialEmbeddings);

    // Compute similarities
    const similarities = nctIds.map(nctId => {
        const trialEmbedding = trialEmbeddings[nctId];
        return cosineSimilarity(patientEmbedding, trialEmbedding);
    });

    // Get topK indices
    const topResults = similarities
      .map((score, idx) => ({ score, idx }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
      
    const matches = topResults.map(item => {
        const nctId = nctIds[item.idx];
        const trial = trialsMap.get(nctId);
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
          sponsor_type: trial.SponsorType,
          score: item.score
        };
    });

    res.status(200).json(matches);

  } catch (error) {
    console.error('Error in bert-match endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 