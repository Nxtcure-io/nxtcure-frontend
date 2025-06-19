from http.server import BaseHTTPRequestHandler
import json
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
import torch
import os
from typing import Dict, Any

# Global variables to store model and data (loaded once per cold start)
model = None
df = None
embeddings = None

def load_model_and_data():
    global model, df, embeddings
    
    if model is None:
        print("Loading SentenceTransformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("Loading clinical trials data...")
        # Get the path to the CSV file
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'heart_disease_trials.csv')
        df = pd.read_csv(csv_path)
        
        # Combine relevant text fields for embedding
        df["full_text"] = (
            df["Condition"].fillna('') + " " +
            df["BriefSummary"].fillna('') + " " +
            df["InclusionCriteria"].fillna('') + " " +
            df["ExclusionCriteria"].fillna('')
        )
        
        print("Computing embeddings for clinical trials...")
        embeddings = model.encode(df["full_text"].tolist(), convert_to_tensor=True)
        df["embedding"] = [emb.cpu().numpy() for emb in embeddings]
        
        print("Backend ready!")

def match_trials(patient_description):
    try:
        if not patient_description.strip():
            return {"error": "Empty description provided"}

        # Encode patient description
        patient_embedding = model.encode(patient_description, convert_to_tensor=True).cpu()

        # Convert stored NumPy embeddings back to torch tensors for comparison
        trial_embeddings = torch.stack([torch.tensor(emb) for emb in df["embedding"]]).cpu()

        # Compute cosine similarity
        cosine_scores = util.pytorch_cos_sim(patient_embedding, trial_embeddings)[0]

        # Get top 5 matches
        top_k = 5
        top_results = torch.topk(cosine_scores, k=top_k)

        matches = []
        for score, idx in zip(top_results.values, top_results.indices):
            idx = int(idx)
            trial = df.iloc[idx]
            
            # Handle potential NaN or infinite values in similarity score
            similarity_score = float(score.item())
            if not (similarity_score == similarity_score):  # Check for NaN
                similarity_score = 0.0
            elif similarity_score == float('inf') or similarity_score == float('-inf'):
                similarity_score = 1.0 if similarity_score > 0 else 0.0
            
            matches.append({
                "nct_id": str(trial["NCTId"]) if pd.notna(trial["NCTId"]) else "",
                "title": str(trial["BriefTitle"]) if pd.notna(trial["BriefTitle"]) else "",
                "similarity": similarity_score,
                "condition": str(trial["Condition"]) if pd.notna(trial["Condition"]) else "",
                "summary": str(trial["BriefSummary"]) if pd.notna(trial["BriefSummary"]) else "",
                "inclusion": str(trial["InclusionCriteria"]) if pd.notna(trial["InclusionCriteria"]) else "",
                "exclusion": str(trial["ExclusionCriteria"]) if pd.notna(trial["ExclusionCriteria"]) else "",
                "country": str(trial["LocationCountry"]) if pd.notna(trial["LocationCountry"]) else ""
            })

        return {"matches": matches}
    
    except Exception as e:
        print(f"Error in match_trials: {str(e)}")
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
        # Load model and data (will only load once per cold start)
        load_model_and_data()
        
        # Get request body
        if request.method == 'POST':
            body = request.get_json()
            patient_description = body.get('description', '') if body else ''
            
            # Get matches
            result = match_trials(patient_description)
            
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

# Legacy handler for compatibility
class LegacyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            # Load model and data (will only load once per cold start)
            load_model_and_data()
            
            # Get request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # Extract patient description
            patient_description = request_data.get('description', '')
            
            # Get matches
            result = match_trials(patient_description)
            
            # Send response
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            error_response = {"error": f"Server error: {str(e)}"}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 