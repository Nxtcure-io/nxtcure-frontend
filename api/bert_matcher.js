import * as tf from '@tensorflow/tfjs-node';
import { load } from '@tensorflow-models/universal-sentence-encoder';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

class ClinicalTrialMatcher {
    constructor() {
        this.model = null;
        this.trialsData = [];
        this.trialEmbeddings = null;
        this.trialTexts = [];
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('Loading Universal Sentence Encoder model...');
            this.model = await load();
            console.log('Model loaded successfully');

            await this.loadTrialsData();
            await this.computeEmbeddings();
            
            this.isInitialized = true;
            console.log('BERT matcher initialized successfully');
        } catch (error) {
            console.error('Error initializing BERT matcher:', error);
            throw error;
        }
    }

    async loadTrialsData() {
        console.log('Loading trials data...');
        const csvPath = path.join(process.cwd(), 'heart_disease_trials.csv');
        
        if (!fs.existsSync(csvPath)) {
            throw new Error('CSV file not found');
        }

        return new Promise((resolve, reject) => {
            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (row) => {
                    this.trialsData.push(row);
                    
                    const trialText = `
                        Condition: ${row.Condition || ''}
                        Title: ${row.BriefTitle || ''}
                        Summary: ${row.BriefSummary || ''}
                        Inclusion Criteria: ${row.InclusionCriteria || ''}
                        Exclusion Criteria: ${row.ExclusionCriteria || ''}
                        Intervention: ${row.InterventionName || ''}
                        Phase: ${row.Phase || ''}
                        Status: ${row.OverallStatus || ''}
                        Location: ${row.LocationCountry || ''}
                        Sponsor: ${row.LeadSponsor || ''}
                    `.trim();
                    
                    this.trialTexts.push(trialText);
                })
                .on('end', () => {
                    console.log(`Loaded ${this.trialsData.length} trials`);
                    resolve();
                })
                .on('error', reject);
        });
    }

    async computeEmbeddings() {
        console.log('Computing embeddings for trials...');
        
        if (!this.model) {
            throw new Error('Model not loaded');
        }

        this.trialEmbeddings = await this.model.embed(this.trialTexts);
        console.log('Embeddings computed successfully');
    }

    async findMatches(patientDescription, topK = 5, similarityThreshold = 0.3) {
        if (!this.isInitialized) {
            throw new Error('Matcher not initialized');
        }

        console.log('Finding matches for:', patientDescription);

        const patientEmbedding = await this.model.embed([patientDescription]);
        
        const similarities = tf.matMul(patientEmbedding, this.trialEmbeddings.transpose());
        const similarityScores = await similarities.data();
        
        const topIndices = this.getTopKIndices(similarityScores, topK);
        
        const matches = [];
        for (let i = 0; i < topIndices.length; i++) {
            const idx = topIndices[i];
            const similarityScore = similarityScores[idx];
            
            if (similarityScore >= similarityThreshold) {
                const trial = this.trialsData[idx];
                
                const match = {
                    nct_id: this.getCleanValue(trial.NCTId),
                    title: this.getCleanValue(trial.BriefTitle),
                    condition: this.getCleanValue(trial.Condition),
                    summary: this.getCleanValue(trial.BriefSummary),
                    inclusion: this.getCleanValue(trial.InclusionCriteria),
                    exclusion: this.getCleanValue(trial.ExclusionCriteria),
                    country: this.getCleanValue(trial.LocationCountry),
                    status: this.getCleanValue(trial.OverallStatus),
                    phase: this.getCleanValue(trial.Phase),
                    enrollment: this.getCleanValue(trial.EnrollmentCount),
                    contact_name: this.getCleanValue(trial.ContactName),
                    contact_role: this.getCleanValue(trial.ContactRole),
                    contact_phone: this.getCleanValue(trial.ContactPhone),
                    contact_email: this.getCleanValue(trial.ContactEmail),
                    lead_sponsor: this.getCleanValue(trial.LeadSponsor),
                    sponsor_type: this.getCleanValue(trial.SponsorType),
                    similarity: parseFloat(similarityScore.toFixed(3))
                };
                
                matches.push(match);
            }
        }
        
        return matches;
    }

    getTopKIndices(scores, k) {
        const indexed = scores.map((score, index) => ({ score, index }));
        indexed.sort((a, b) => b.score - a.score);
        return indexed.slice(0, k).map(item => item.index);
    }

    getCleanValue(val) {
        if (!val || val === 'N/A' || val === '' || val === 'nan') {
            return null;
        }
        return String(val).trim();
    }

    async getTrialDetails(nctId) {
        if (!this.isInitialized) {
            throw new Error('Matcher not initialized');
        }

        const trial = this.trialsData.find(t => t.NCTId === nctId);
        
        if (!trial) {
            return null;
        }

        return {
            nct_id: this.getCleanValue(trial.NCTId),
            title: this.getCleanValue(trial.BriefTitle),
            official_title: this.getCleanValue(trial.OfficialTitle),
            condition: this.getCleanValue(trial.Condition),
            summary: this.getCleanValue(trial.BriefSummary),
            inclusion: this.getCleanValue(trial.InclusionCriteria),
            exclusion: this.getCleanValue(trial.ExclusionCriteria),
            country: this.getCleanValue(trial.LocationCountry),
            status: this.getCleanValue(trial.OverallStatus),
            phase: this.getCleanValue(trial.Phase),
            enrollment: this.getCleanValue(trial.EnrollmentCount),
            study_type: this.getCleanValue(trial.StudyType),
            start_date: this.getCleanValue(trial.StartDate),
            completion_date: this.getCleanValue(trial.CompletionDate),
            intervention: this.getCleanValue(trial.InterventionName),
            primary_outcome: this.getCleanValue(trial.PrimaryOutcomeMeasure),
            contact_name: this.getCleanValue(trial.ContactName),
            contact_role: this.getCleanValue(trial.ContactRole),
            contact_phone: this.getCleanValue(trial.ContactPhone),
            contact_email: this.getCleanValue(trial.ContactEmail),
            lead_sponsor: this.getCleanValue(trial.LeadSponsor),
            sponsor_type: this.getCleanValue(trial.SponsorType),
            gender: this.getCleanValue(trial.Gender),
            min_age: this.getCleanValue(trial.MinimumAge),
            max_age: this.getCleanValue(trial.MaximumAge),
            age_groups: this.getCleanValue(trial.StdAges),
            healthy_volunteers: this.getCleanValue(trial.HealthyVolunteers)
        };
    }
}

let matcher = null;

export async function initializeMatcher() {
    if (!matcher) {
        matcher = new ClinicalTrialMatcher();
        await matcher.initialize();
    }
    return matcher;
}

export async function getMatcher() {
    if (!matcher) {
        await initializeMatcher();
    }
    return matcher;
} 