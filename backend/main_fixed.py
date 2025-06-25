from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Setup CORS for React frontend
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for data and vectorizer
df = None
vectorizer = None
trial_vectors = None

def load_and_process_data():
    """Load clinical trials data and prepare text embeddings"""
    global df, vectorizer, trial_vectors
    
    try:
        print("Loading clinical trials data...")
        df = pd.read_csv("all_conditions_trials.csv")
        print(f"Loaded {len(df)} clinical trials")
        
        # Combine relevant text fields for matching
        df["full_text"] = (
            df["Condition"].fillna('') + " " +
            df["BriefSummary"].fillna('') + " " +
            df["InclusionCriteria"].fillna('') + " " +
            df["ExclusionCriteria"].fillna('')
        )
        
        print("Creating text embeddings using TF-IDF...")
        # Use TF-IDF instead of SentenceTransformers for stability
        vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )
        
        trial_vectors = vectorizer.fit_transform(df["full_text"])
        print("Text embeddings created successfully!")
        
        return True
        
    except Exception as e:
        print(f"Error loading data: {e}")
        import traceback
        traceback.print_exc()
        return False

# Load data on startup
print("Initializing backend...")
if load_and_process_data():
    print("Backend ready!")
else:
    print("Failed to initialize backend!")

# Request format
class PatientRequest(BaseModel):
    description: str

@app.post("/match")
def match_trials(request: PatientRequest):
    global df, vectorizer, trial_vectors
    
    try:
        print(f"Received request: {request.description}")
        
        if not request.description.strip():
            return {"error": "Empty description provided"}
        
        if df is None or vectorizer is None or trial_vectors is None:
            return {"error": "Backend not properly initialized"}

        patient_description = request.description
        print("Processing patient description...")
        
        # Convert patient description to vector
        patient_vector = vectorizer.transform([patient_description])
        
        # Compute cosine similarity
        similarities = cosine_similarity(patient_vector, trial_vectors)[0]
        
        # Get top 5 matches
        top_k = 5
        top_indices = similarities.argsort()[::-1][:top_k]
        
        print("Building response...")
        matches = []
        for idx in top_indices:
            trial = df.iloc[idx]
            similarity_score = float(similarities[idx])
            
            matches.append({
                "nct_id": trial["NCTId"],
                "title": trial["BriefTitle"],
                "similarity": similarity_score,
                "condition": trial["Condition"],
                "summary": trial["BriefSummary"],
                "inclusion": trial["InclusionCriteria"],
                "exclusion": trial["ExclusionCriteria"],
                "country": trial["LocationCountry"]
            })

        print(f"Returning {len(matches)} matches")
        return {"matches": matches}
    
    except Exception as e:
        print(f"Error in match_trials: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {"error": f"Server error: {str(e)}"}

@app.get("/")
def read_root():
    return {"message": "Clinical Trials Matching API is running!", "status": "healthy"}

@app.get("/stats")
def get_stats():
    """Get statistics about the loaded data"""
    global df
    if df is not None:
        return {
            "total_trials": len(df),
            "conditions": df["Condition"].value_counts().head(10).to_dict(),
            "countries": df["LocationCountry"].value_counts().head(10).to_dict(),
            "status": "Data loaded successfully"
        }
    else:
        return {"error": "No data loaded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 