# ai_service/recommender.py
from sentence_transformers import SentenceTransformer, util
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

# small demo job DB (replace with your real job postings)
JOB_DB = [
    {"id":1,"title":"Data Scientist","desc":"Python, Machine Learning, Pandas, scikit-learn, SQL"},
    {"id":2,"title":"Backend Engineer","desc":"Node.js, Express, MongoDB, REST APIs"},
    {"id":3,"title":"Frontend Developer","desc":"React, JavaScript, CSS, HTML"},
    {"id":4,"title":"DevOps Engineer","desc":"AWS, Docker, Kubernetes, CI/CD"},
    {"id":5,"title":"ML Engineer","desc":"TensorFlow, PyTorch, Deep Learning, Python"},
]

JOB_EMBS = model.encode([j["desc"] for j in JOB_DB], convert_to_numpy=True)

def recommend_jobs_for_skills(skills, top_k=3):
    # skills: list of strings -- convert to single query text
    if not skills:
        return JOB_DB[:top_k]
    q = ", ".join(skills)
    q_emb = model.encode([q], convert_to_numpy=True)
    sims = util.cos_sim(q_emb, JOB_EMBS)[0].cpu().numpy()
    idx = np.argsort(-sims)[:top_k]
    recs = []
    for i in idx:
        job = JOB_DB[int(i)].copy()
        job["score"] = float(sims[int(i)])
        recs.append(job)
    return recs
