from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from bert_matcher import ClinicalTrialMatcher
import os

app = FastAPI(title="Clinical Trial BERT Matcher API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientRequest(BaseModel):
    description: str
    top_k: Optional[int] = 5
    similarity_threshold: Optional[float] = 0.3

class TrialResponse(BaseModel):
    nct_id: Optional[str]
    title: Optional[str]
    condition: Optional[str]
    summary: Optional[str]
    inclusion: Optional[str]
    exclusion: Optional[str]
    country: Optional[str]
    status: Optional[str]
    phase: Optional[str]
    enrollment: Optional[str]
    contact_name: Optional[str]
    contact_role: Optional[str]
    contact_phone: Optional[str]
    contact_email: Optional[str]
    lead_sponsor: Optional[str]
    sponsor_type: Optional[str]
    similarity: float

class MatchResponse(BaseModel):
    matches: List[TrialResponse]
    total_found: int

matcher = None

@app.on_event("startup")
async def startup_event():
    global matcher
    try:
        matcher = ClinicalTrialMatcher()
        csv_file = 'all_conditions_trials.csv'
        
        if not os.path.exists(csv_file):
            raise FileNotFoundError(f"CSV file {csv_file} not found")
        
        matcher.load_trials_data(csv_file)
        
        embeddings_file = 'trial_embeddings.pt'
        if not matcher.load_embeddings(embeddings_file):
            print("Computing embeddings...")
            matcher.compute_embeddings()
            matcher.save_embeddings(embeddings_file)
        
        print("BERT API initialized successfully")
    except Exception as e:
        print(f"Error initializing BERT API: {e}")
        raise

@app.get("/")
async def root():
    return {"message": "Clinical Trial BERT Matcher API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "matcher_loaded": matcher is not None}

@app.post("/match", response_model=MatchResponse)
async def match_trials(request: PatientRequest):
    if matcher is None:
        raise HTTPException(status_code=500, detail="Matcher not initialized")
    
    try:
        matches = matcher.find_matches(
            request.description,
            top_k=request.top_k,
            similarity_threshold=request.similarity_threshold
        )
        
        return MatchResponse(
            matches=matches,
            total_found=len(matches)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching trials: {str(e)}")

@app.get("/trial/{nct_id}")
async def get_trial_details(nct_id: str):
    if matcher is None:
        raise HTTPException(status_code=500, detail="Matcher not initialized")
    
    try:
        trial_details = matcher.get_trial_details(nct_id)
        if trial_details is None:
            raise HTTPException(status_code=404, detail="Trial not found")
        
        return trial_details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting trial details: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 