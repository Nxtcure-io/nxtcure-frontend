import axios from 'axios';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const BERT_API_URL = 'http://localhost:8001';
const FALLBACK_KEYWORDS = [
    'heart', 'cardiac', 'cardiovascular', 'failure', 'disease', 'attack',
    'arrhythmia', 'fibrillation', 'coronary', 'artery', 'valve', 'chamber',
    'ventricle', 'atrium', 'myocardial', 'infarction', 'angina', 'hypertension',
    'blood pressure', 'cholesterol', 'diabetes', 'obesity', 'smoking'
];

function extractKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => 
        FALLBACK_KEYWORDS.some(keyword => 
            word.includes(keyword) || keyword.includes(word)
        )
    );
}

function simpleKeywordMatch(patientDescription, trialsData) {
    const patientKeywords = extractKeywords(patientDescription);
    const matches = [];
    
    for (const trial of trialsData) {
        const trialText = [
            trial.Condition || '',
            trial.BriefTitle || '',
            trial.BriefSummary || '',
            trial.InclusionCriteria || ''
        ].join(' ').toLowerCase();
        
        const matchingKeywords = patientKeywords.filter(keyword =>
            trialText.includes(keyword)
        );
        
        if (matchingKeywords.length > 0) {
            const score = matchingKeywords.length / patientKeywords.length;
            matches.push({
                nct_id: trial.NCTId || null,
                title: trial.BriefTitle || null,
                condition: trial.Condition || null,
                summary: trial.BriefSummary || null,
                inclusion: trial.InclusionCriteria || null,
                exclusion: trial.ExclusionCriteria || null,
                country: trial.LocationCountry || null,
                status: trial.OverallStatus || null,
                phase: trial.Phase || null,
                enrollment: trial.EnrollmentCount || null,
                contact_name: trial.ContactName || null,
                contact_role: trial.ContactRole || null,
                contact_phone: trial.ContactPhone || null,
                contact_email: trial.ContactEmail || null,
                lead_sponsor: trial.LeadSponsor || null,
                sponsor_type: trial.SponsorType || null,
                similarity: score
            });
        }
    }
    
    return matches
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
}

async function getBertMatches(patientDescription, topK = 5, similarityThreshold = 0.3) {
    try {
        const response = await axios.post(`${BERT_API_URL}/match`, {
            description: patientDescription,
            top_k: topK,
            similarity_threshold: similarityThreshold
        }, {
            timeout: 10000
        });
        
        return response.data.matches;
    } catch (error) {
        console.error('BERT API error:', error.message);
        return null;
    }
}

async function getTrialDetails(nctId) {
    try {
        const response = await axios.get(`${BERT_API_URL}/trial/${nctId}`, {
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error('Error getting trial details:', error.message);
        return null;
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { patientDescription, topK = 5, similarityThreshold = 0.3 } = req.body;
        
        if (!patientDescription) {
            return res.status(400).json({ error: 'Patient description is required' });
        }
        
        const csvPath = path.join(process.cwd(), 'heart_disease_trials.csv');
        
        if (!fs.existsSync(csvPath)) {
            return res.status(500).json({ error: 'Trials data not found' });
        }
        
        const trialsData = [];
        
        await new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (row) => trialsData.push(row))
                .on('end', resolve)
                .on('error', reject);
        });
        
        let matches = await getBertMatches(patientDescription, topK, similarityThreshold);
        
        if (!matches) {
            console.log('Falling back to keyword matching...');
            matches = simpleKeywordMatch(patientDescription, trialsData);
        }
        
        // Remove forced keyword matching, use only BERT results if available
        const response = {
            matches: matches,
            total_found: matches.length,
            method: matches && matches.length > 0 && matches[0].hasOwnProperty('similarity') ? 'bert' : 'keyword'
        };
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error('Error in match endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 