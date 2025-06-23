import { pipeline } from '@xenova/transformers';

class ClientSideBertMatcher {
    constructor() {
        this.model = null;
        this.trialsData = [];
        this.trialEmbeddings = null;
        this.isInitialized = false;
    }

    async initialize(trialsData) {
        try {
            console.log('Loading BERT model in browser...');
            
            // Use a reliable, smaller model
            this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            
            this.trialsData = trialsData;
            
            console.log('Computing trial embeddings...');
            await this.computeTrialEmbeddings();
            
            this.isInitialized = true;
            console.log('Client-side BERT matcher initialized successfully');
        } catch (error) {
            console.error('Error initializing BERT matcher:', error);
            throw error;
        }
    }

    async computeTrialEmbeddings() {
        // Limit to first 100 trials for faster processing
        const limitedTrials = this.trialsData.slice(0, 100);
        
        const trialTexts = limitedTrials.map(trial => `
            Condition: ${trial.Condition || ''}
            Title: ${trial.BriefTitle || ''}
            Summary: ${trial.BriefSummary || ''}
            Inclusion: ${trial.InclusionCriteria || ''}
            Intervention: ${trial.InterventionName || ''}
            Phase: ${trial.Phase || ''}
            Status: ${trial.OverallStatus || ''}
        `.trim());

        this.trialEmbeddings = await this.model(trialTexts);
        console.log('Trial embeddings computed for', limitedTrials.length, 'trials');
    }

    async findMatches(patientDescription, topK = 5, similarityThreshold = 0.2) {
        if (!this.isInitialized) {
            throw new Error('Matcher not initialized');
        }

        console.log('Finding matches for:', patientDescription);

        const patientEmbedding = await this.model([patientDescription]);
        
        const similarities = this.computeCosineSimilarity(patientEmbedding.data, this.trialEmbeddings.data);
        const topIndices = this.getTopKIndices(similarities, topK);
        
        const matches = [];
        for (let i = 0; i < topIndices.length; i++) {
            const idx = topIndices[i];
            const similarityScore = similarities[idx];
            
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

    computeCosineSimilarity(vecA, vecB) {
        const similarities = [];
        
        for (let i = 0; i < vecB.length; i++) {
            const similarity = this.cosineSimilarity(vecA, vecB[i]);
            similarities.push(similarity);
        }
        
        return similarities;
    }

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
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

    getTrialDetails(nctId) {
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

export async function initializeBertMatcher(trialsData) {
    if (!matcher) {
        matcher = new ClientSideBertMatcher();
        await matcher.initialize(trialsData);
    }
    return matcher;
}

export async function getBertMatcher() {
    if (!matcher) {
        throw new Error('BERT matcher not initialized. Call initializeBertMatcher first.');
    }
    return matcher;
} 