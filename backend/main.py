from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
import torch
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles

# Setup CORS for React frontend
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend running on port 5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load SentenceTransformer model (much simpler and more reliable)
print("Loading SentenceTransformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load clinical trials data
print("Loading clinical trials data...")
df = pd.read_csv("all_conditions_trials.csv")

# Combine relevant text fields for embedding
df["full_text"] = (
    df["Condition"].fillna('') + " " +
    df["BriefSummary"].fillna('') + " " +
    df["InclusionCriteria"].fillna('') + " " +
    df["ExclusionCriteria"].fillna('')
)

# Compute and store embeddings for all trials
print("Computing embeddings for clinical trials...")
embeddings = model.encode(df["full_text"].tolist(), convert_to_tensor=True)
df["embedding"] = [emb.cpu().numpy() for emb in embeddings]

print("Backend ready!")

# Request format
class PatientRequest(BaseModel):
    description: str

@app.post("/match")
def match_trials(request: PatientRequest):
    try:
        if not request.description.strip():
            return {"error": "Empty description provided"}

        patient_description = request.description
        
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

@app.get("/")
def read_root():
    return {"message": "Clinical Trials Matching API is running!", "status": "healthy"}

# Serve React static files
app.mount("/", StaticFiles(directory="../nxtcure-frontend/dist", html=True), name="static")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)