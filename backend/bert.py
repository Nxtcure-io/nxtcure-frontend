import streamlit as st
import pandas as pd
import torch
import numpy as np
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity

@st.cache_resource
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

@st.cache_data
def load_trials():
    df = pd.read_csv("heart_disease_trials.csv")
    df["full_text"] = (
        df["Condition"].fillna('') + " " +
        df["BriefSummary"].fillna('') + " " +
        df["InclusionCriteria"].fillna('') + " " +
        df["ExclusionCriteria"].fillna('')
    )
    df["embedding"] = df["full_text"].apply(get_bert_embedding)
    return df

df = load_trials()

st.title("🧬 Match Patients to Clinical Trials using BERT")
patient_description = st.text_area("Paste your clinical patient description below:", height=250)

if st.button("Find Matching Trials"):
    if not patient_description.strip():
        st.warning("Please enter a valid description.")
    else:
        patient_emb = get_bert_embedding(patient_description).reshape(1, -1)
        trial_embeddings = np.vstack(df["embedding"].to_numpy())
        similarities = cosine_similarity(patient_emb, trial_embeddings)[0]
        top_k = 5
        top_indices = similarities.argsort()[::-1][:top_k]

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
