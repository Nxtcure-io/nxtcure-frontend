import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

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

function enhancedKeywordMatch(patientDescription, trialsData) {
    const patientWords = patientDescription.toLowerCase().split(/\s+/);
    const matches = [];
    
    for (const trial of trialsData) {
        const trialText = [
            trial.Condition || '',
            trial.BriefTitle || '',
            trial.BriefSummary || '',
            trial.InclusionCriteria || '',
            trial.ExclusionCriteria || ''
        ].join(' ').toLowerCase();
        
        const trialWords = trialText.split(/\s+/);
        
        let score = 0;
        let exactMatches = 0;
        let partialMatches = 0;
        
        for (const patientWord of patientWords) {
            if (patientWord.length < 3) continue;
            
            for (const trialWord of trialWords) {
                if (trialWord.length < 3) continue;
                
                if (patientWord === trialWord) {
                    exactMatches++;
                    score += 2;
                } else if (trialWord.includes(patientWord) || patientWord.includes(trialWord)) {
                    partialMatches++;
                    score += 1;
                }
            }
        }
        
        if (score > 0) {
            const normalizedScore = score / (patientWords.length * 2);
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
                similarity: Math.min(normalizedScore, 1)
            });
        }
    }
    
    return matches
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);
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
        
        const csvPath = path.join(process.cwd(), 'all_conditions_trials.csv');
        
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
        
        const matches = enhancedKeywordMatch(patientDescription, trialsData);
        
        const response = {
            matches: matches,
            total_found: matches.length,
            method: 'enhanced_keyword'
        };
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error('Error in match endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} 