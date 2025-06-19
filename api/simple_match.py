import json
import pandas as pd
import re
import os
from typing import Dict, Any

# Global variable to store data
df = None

def load_data():
    global df
    
    if df is None:
        print("Loading clinical trials data...")
        # Use smaller sample dataset for faster deployment
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'sample_trials.csv')
        df = pd.read_csv(csv_path)
        print("Backend ready!")

def simple_match_trials(patient_description):
    """Simple text-based matching without ML for testing"""
    try:
        if not patient_description.strip():
            return {"error": "Empty description provided"}

        # Simple keyword matching
        patient_lower = patient_description.lower()
        
        matches = []
        for idx, trial in df.iterrows():
            # Combine relevant text fields
            trial_text = (
                str(trial.get("Condition", "")) + " " +
                str(trial.get("BriefSummary", "")) + " " +
                str(trial.get("InclusionCriteria", "")) + " " +
                str(trial.get("ExclusionCriteria", ""))
            ).lower()
            
            # Count matching words
            patient_words = set(re.findall(r'\w+', patient_lower))
            trial_words = set(re.findall(r'\w+', trial_text))
            
            # Calculate simple similarity
            if patient_words:
                common_words = patient_words.intersection(trial_words)
                similarity = len(common_words) / len(patient_words)
            else:
                similarity = 0.0
            
            matches.append({
                "nct_id": str(trial.get("NCTId", "")),
                "title": str(trial.get("BriefTitle", "")),
                "similarity": similarity,
                "condition": str(trial.get("Condition", "")),
                "summary": str(trial.get("BriefSummary", "")),
                "inclusion": str(trial.get("InclusionCriteria", "")),
                "exclusion": str(trial.get("ExclusionCriteria", "")),
                "country": str(trial.get("LocationCountry", ""))
            })
        
        # Sort by similarity and return top 5
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        return {"matches": matches[:5]}
    
    except Exception as e:
        print(f"Error in simple_match_trials: {str(e)}")
        return {"error": f"Server error: {str(e)}"}

def handler(request, context):
    """Vercel serverless function handler"""
    # Set CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Load data
        load_data()
        
        # Get request body
        if request.method == 'POST':
            body = request.get_json()
            patient_description = body.get('description', '') if body else ''
            
            # Get matches
            result = simple_match_trials(patient_description)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(result)
            }
        else:
            return {
                'statusCode': 405,
                'headers': headers,
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        error_response = {"error": f"Server error: {str(e)}"}
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps(error_response)
        } 