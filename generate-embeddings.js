import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { pipeline } from '@xenova/transformers';
import { fileURLToPath } from 'url';

// Suppress experimental warnings from the transformers library
const originalEmit = process.emit;
process.emit = function (event, error, ...args) {
  if (event === 'warning' && error.name === 'ExperimentalWarning') {
    return false;
  }
  return originalEmit.call(this, event, error, ...args);
};

async function generateEmbeddings() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const csvPath = path.join(__dirname, 'filtered_trials.csv');
  const outputPath = path.join(__dirname, 'trial_embeddings.json');

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: ${csvPath} not found.`);
    return;
  }

  console.log(`Reading trials from ${csvPath}...`);
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const trials = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

  const trialTexts = trials.map(trial => `
    Condition: ${trial.Condition || ''}
    Title: ${trial.BriefTitle || ''}
    Summary: ${trial.BriefSummary || ''}
    Inclusion: ${trial.InclusionCriteria || ''}
  `.trim());

  console.log('Loading feature-extraction model...');
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  console.log('Generating embeddings for all trials...');
  const embeddings = await extractor(trialTexts, { pooling: 'mean', normalize: true });

  const embeddingsDict = {};
  trials.forEach((trial, index) => {
    embeddingsDict[trial.NCTId] = Array.from(embeddings.data.slice(index * 384, (index + 1) * 384));
  });

  fs.writeFileSync(outputPath, JSON.stringify(embeddingsDict, null, 2));
  console.log(`Embeddings saved to ${outputPath}`);
}

generateEmbeddings().catch(console.error); 