from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import re

app = FastAPI()

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable for data
df = None

def load_heart_disease_data():
    """Load and process heart disease clinical trials data"""
    global df
    try:
        print("Loading heart disease clinical trials data...")
        df = pd.read_csv("all_conditions_trials.csv")
        print(f"Successfully loaded {len(df)} clinical trials")
        
        # Clean the data
        df["Condition"] = df["Condition"].fillna("Unknown")
        df["BriefSummary"] = df["BriefSummary"].fillna("No summary available")
        df["InclusionCriteria"] = df["InclusionCriteria"].fillna("No inclusion criteria specified")
        df["ExclusionCriteria"] = df["ExclusionCriteria"].fillna("No exclusion criteria specified")
        df["LocationCountry"] = df["LocationCountry"].fillna("Unknown")
        
        # Create searchable text
        df["searchable_text"] = (
            df["Condition"].astype(str) + " " +
            df["BriefSummary"].astype(str) + " " +
            df["InclusionCriteria"].astype(str)
        ).str.lower()
        
        print("Data processing completed!")
        return True
        
    except Exception as e:
        print(f"Error loading data: {e}")
        return False

# Load data on startup
if load_heart_disease_data():
    print("Heart disease API ready!")
else:
    print("Failed to load heart disease data!")

class PatientRequest(BaseModel):
    description: str

def simple_text_match(patient_desc, trial_texts):
    """Simple text matching based on keyword overlap"""
    patient_words = set(re.findall(r'\b\w+\b', patient_desc.lower()))
    
    scores = []
    for text in trial_texts:
        trial_words = set(re.findall(r'\b\w+\b', text.lower()))
        
        # Calculate simple overlap score
        overlap = len(patient_words.intersection(trial_words))
        total_words = len(patient_words.union(trial_words))
        
        if total_words > 0:
            score = overlap / total_words
        else:
            score = 0
            
        scores.append(score)
    
    return scores

@app.post("/match")
def match_trials(request: PatientRequest):
    global df
    
    try:
        print(f"Received request: {request.description}")
        
        if not request.description.strip():
            return {"error": "Empty description provided"}
        
        if df is None:
            return {"error": "Clinical trials data not loaded"}

        patient_description = request.description.lower()
        print(f"Processing patient description: {patient_description}")
        
        # Simple keyword-based matching
        scores = simple_text_match(patient_description, df["searchable_text"].tolist())
        
        # Get top 5 matches
        top_k = 5
        df_with_scores = df.copy()
        df_with_scores["similarity"] = scores
        
        # Sort by similarity score
        top_matches = df_with_scores.nlargest(top_k, "similarity")
        
        print("Building response...")
        matches = []
        for _, trial in top_matches.iterrows():
            matches.append({
                "nct_id": str(trial["NCTId"]),
                "title": str(trial["BriefTitle"]),
                "similarity": float(trial["similarity"]),
                "condition": str(trial["Condition"]),
                "summary": str(trial["BriefSummary"])[:500] + "..." if len(str(trial["BriefSummary"])) > 500 else str(trial["BriefSummary"]),
                "inclusion": str(trial["InclusionCriteria"])[:300] + "..." if len(str(trial["InclusionCriteria"])) > 300 else str(trial["InclusionCriteria"]),
                "exclusion": str(trial["ExclusionCriteria"])[:300] + "..." if len(str(trial["ExclusionCriteria"])) > 300 else str(trial["ExclusionCriteria"]),
                "country": str(trial["LocationCountry"])
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
    return {"message": "Heart Disease Clinical Trials API is running!", "status": "healthy"}

@app.get("/stats")
def get_stats():
    """Get statistics about the loaded data"""
    global df
    if df is not None:
        return {
            "total_trials": len(df),
            "sample_conditions": df["Condition"].value_counts().head(5).to_dict(),
            "sample_countries": df["LocationCountry"].value_counts().head(5).to_dict(),
            "status": "Heart disease data loaded successfully"
        }
    else:
        return {"error": "No data loaded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 