import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import torch
from sklearn.metrics.pairwise import cosine_similarity
import json
from typing import List, Dict, Tuple
import pickle
import os

class ClinicalTrialMatcher:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)
        self.trials_data = None
        self.trial_embeddings = None
        self.trial_texts = []
        
    def load_trials_data(self, csv_file: str):
        print(f"Loading trials data from {csv_file}...")
        self.trials_data = pd.read_csv(csv_file)
        
        self.trial_texts = []
        for _, trial in self.trials_data.iterrows():
            trial_text = f"""
            Condition: {trial.get('Condition', '')}
            Title: {trial.get('BriefTitle', '')}
            Summary: {trial.get('BriefSummary', '')}
            Inclusion Criteria: {trial.get('InclusionCriteria', '')}
            Exclusion Criteria: {trial.get('ExclusionCriteria', '')}
            Intervention: {trial.get('InterventionName', '')}
            Phase: {trial.get('Phase', '')}
            Status: {trial.get('OverallStatus', '')}
            Location: {trial.get('LocationCountry', '')}
            Sponsor: {trial.get('LeadSponsor', '')}
            """.strip()
            
            self.trial_texts.append(trial_text)
        
        print(f"Loaded {len(self.trials_data)} trials")
        
    def compute_embeddings(self):
        print("Computing BERT embeddings for trials...")
        self.trial_embeddings = self.model.encode(
            self.trial_texts, 
            convert_to_tensor=True,
            show_progress_bar=True
        )
        print("Embeddings computed successfully")
        
    def save_embeddings(self, file_path: str):
        print(f"Saving embeddings to {file_path}...")
        torch.save(self.trial_embeddings, file_path)
        print("Embeddings saved successfully")
        
    def load_embeddings(self, file_path: str):
        print(f"Loading embeddings from {file_path}...")
        if os.path.exists(file_path):
            self.trial_embeddings = torch.load(file_path)
            print("Embeddings loaded successfully")
            return True
        else:
            print("Embeddings file not found")
            return False
    
    def find_matches(self, patient_description: str, top_k: int = 5, similarity_threshold: float = 0.3) -> List[Dict]:
        if self.trial_embeddings is None:
            raise ValueError("Trial embeddings not computed. Call compute_embeddings() first.")
        
        patient_embedding = self.model.encode([patient_description], convert_to_tensor=True)
        
        similarities = cosine_similarity(
            patient_embedding.cpu().numpy(), 
            self.trial_embeddings.cpu().numpy()
        )[0]
        
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        matches = []
        for idx in top_indices:
            similarity_score = similarities[idx]
            
            if similarity_score >= similarity_threshold:
                trial = self.trials_data.iloc[idx]
                
                def get_contact_value(val):
                    if pd.isna(val) or val == 'N/A' or val == '':
                        return None
                    return str(val).strip()
                
                match = {
                    'nct_id': get_contact_value(trial.get('NCTId')),
                    'title': get_contact_value(trial.get('BriefTitle')),
                    'condition': get_contact_value(trial.get('Condition')),
                    'summary': get_contact_value(trial.get('BriefSummary')),
                    'inclusion': get_contact_value(trial.get('InclusionCriteria')),
                    'exclusion': get_contact_value(trial.get('ExclusionCriteria')),
                    'country': get_contact_value(trial.get('LocationCountry')),
                    'status': get_contact_value(trial.get('OverallStatus')),
                    'phase': get_contact_value(trial.get('Phase')),
                    'enrollment': get_contact_value(trial.get('EnrollmentCount')),
                    'contact_name': get_contact_value(trial.get('ContactName')),
                    'contact_role': get_contact_value(trial.get('ContactRole')),
                    'contact_phone': get_contact_value(trial.get('ContactPhone')),
                    'contact_email': get_contact_value(trial.get('ContactEmail')),
                    'lead_sponsor': get_contact_value(trial.get('LeadSponsor')),
                    'sponsor_type': get_contact_value(trial.get('SponsorType')),
                    'similarity': float(similarity_score)
                }
                
                matches.append(match)
        
        return matches
    
    def get_trial_details(self, nct_id: str) -> Dict:
        if self.trials_data is None:
            raise ValueError("Trials data not loaded")
        
        trial = self.trials_data[self.trials_data['NCTId'] == nct_id]
        
        if trial.empty:
            return None
        
        trial = trial.iloc[0]
        
        def get_value(val):
            if pd.isna(val) or val == 'N/A' or val == '':
                return None
            return str(val).strip()
        
        return {
            'nct_id': get_value(trial.get('NCTId')),
            'title': get_value(trial.get('BriefTitle')),
            'official_title': get_value(trial.get('OfficialTitle')),
            'condition': get_value(trial.get('Condition')),
            'summary': get_value(trial.get('BriefSummary')),
            'inclusion': get_value(trial.get('InclusionCriteria')),
            'exclusion': get_value(trial.get('ExclusionCriteria')),
            'country': get_value(trial.get('LocationCountry')),
            'status': get_value(trial.get('OverallStatus')),
            'phase': get_value(trial.get('Phase')),
            'enrollment': get_value(trial.get('EnrollmentCount')),
            'study_type': get_value(trial.get('StudyType')),
            'start_date': get_value(trial.get('StartDate')),
            'completion_date': get_value(trial.get('CompletionDate')),
            'intervention': get_value(trial.get('InterventionName')),
            'primary_outcome': get_value(trial.get('PrimaryOutcomeMeasure')),
            'contact_name': get_value(trial.get('ContactName')),
            'contact_role': get_value(trial.get('ContactRole')),
            'contact_phone': get_value(trial.get('ContactPhone')),
            'contact_email': get_value(trial.get('ContactEmail')),
            'lead_sponsor': get_value(trial.get('LeadSponsor')),
            'sponsor_type': get_value(trial.get('SponsorType')),
            'gender': get_value(trial.get('Gender')),
            'min_age': get_value(trial.get('MinimumAge')),
            'max_age': get_value(trial.get('MaximumAge')),
            'age_groups': get_value(trial.get('StdAges')),
            'healthy_volunteers': get_value(trial.get('HealthyVolunteers'))
        }

def main():
    matcher = ClinicalTrialMatcher()
    matcher.load_trials_data('all_conditions_trials.csv')
    
    embeddings_file = 'trial_embeddings.pt'
    if not matcher.load_embeddings(embeddings_file):
        matcher.compute_embeddings()
        matcher.save_embeddings(embeddings_file)
    
    test_descriptions = [
        "I have heart failure and need treatment options",
        "Patient with congenital heart disease looking for clinical trials",
        "Heart attack survivor seeking rehabilitation studies",
        "Elderly patient with atrial fibrillation"
    ]
    
    for desc in test_descriptions:
        print(f"\n{'='*60}")
        print(f"Patient Description: {desc}")
        print(f"{'='*60}")
        
        matches = matcher.find_matches(desc, top_k=3)
        
        for i, match in enumerate(matches, 1):
            print(f"\nMatch {i} (Similarity: {match['similarity']:.3f}):")
            print(f"NCT ID: {match['nct_id']}")
            print(f"Title: {match['title']}")
            print(f"Condition: {match['condition']}")
            print(f"Status: {match['status']}")
            print(f"Contact: {match['contact_name']} - {match['contact_email']}")

if __name__ == "__main__":
    main() 