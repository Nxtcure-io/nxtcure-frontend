from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import torch
from fastapi.middleware.cors import CORSMiddleware
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity

def load_bert_model():
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    model = BertModel.from_pretrained('bert-base-uncased')
    model.eval()
    return tokenizer, model

tokenizer, model = load_bert_model()

def get_bert_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

# Setup CORS for React frontend
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://10.0.0.112:5173"],  # Frontend running on port 5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df = pd.read_csv("heart_disease_trials.csv")
df["full_text"] = (
    df["Condition"].fillna('') + " " +
    df["BriefSummary"].fillna('') + " " +
    df["InclusionCriteria"].fillna('') + " " +
    df["ExclusionCriteria"].fillna('')
)
df["embedding"] = df["full_text"].apply(get_bert_embedding)

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

        patient_embedding = get_bert_embedding(patient_description).reshape(1, -1)
        trial_embeddings = np.vstack(df["embedding"].to_numpy())
        similarities = cosine_similarity(patient_embedding, trial_embeddings)[0]
        top_k = 5
        top_results = similarities.argsort()[::-1][:top_k]
        '''
        st.subheader(f"🔎 Top {top_k} Clinical Trial Matches:")
        for rank, idx in enumerate(top_indices, start=1):
            trial = df.iloc[idx]
            with st.expander(f"🔹 Match #{rank}: {trial['BriefTitle']}"):
                st.markdown(f"**🧪 NCT ID**: `{trial['NCTId']}`")
                st.markdown(f"**📈 Similarity Score**: `{similarities[idx]:.4f}`")
                st.markdown(f"**🩺 Condition**: {trial['Condition']}")
                st.markdown(f"**📝 Brief Summary**: {trial['BriefSummary']}")
                st.markdown(f"**✅ Inclusion Criteria:**\n{trial['InclusionCriteria']}")
                st.markdown(f"**🚫 Exclusion Criteria:**\n{trial['ExclusionCriteria']}")
                st.markdown(f"**🌍 Country**: {trial['LocationCountry']}")
        ''' 
        # Encode patient description
        ### patient_embedding = model.encode(patient_description, convert_to_tensor=True).cpu()

        # Convert stored NumPy embeddings back to torch tensors for comparison
        ### trial_embeddings = torch.stack([torch.tensor(emb) for emb in df["embedding"]]).cpu()

        # Compute cosine similarity
        ### cosine_scores = util.pytorch_cos_sim(patient_embedding, trial_embeddings)[0]

        # Get top 5 matches
        ###top_k = 5
        ###top_results = torch.topk(cosine_scores, k=top_k)
        matches = []
        #for score, idx in zip(top_results.values, top_results.indices):
        for score, idx in enumerate(top_results, start=1):
            trial = df.iloc[idx]
            
            # Handle potential NaN or infinite values in similarity score
            #similarity_score = float(score.item())
            similarity_score = float(score)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)



