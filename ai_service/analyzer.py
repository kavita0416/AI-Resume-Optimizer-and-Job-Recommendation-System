# ai_service/analyzer.py
import json
import re
from utils import extract_text_from_bytes
from rake_nltk import Rake
import spacy
from sentence_transformers import SentenceTransformer, util
import numpy as np

# Load NLP models once
nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# 🌱 Extendable skill seed list
COMMON_SKILLS = [
    "python", "java", "javascript", "typescript", "react", "angular", "node", "node.js", "express",
    "django", "flask", "fastapi", "c++", "c#", "html", "css", "sql", "mysql", "postgresql", "mongodb",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "linux", "data science", "machine learning",
    "deep learning", "data analysis", "nlp", "computer vision", "pandas", "numpy", "tensorflow",
    "pytorch", "matplotlib", "power bi", "excel"
]


# 🧹 Utility: clean and normalize raw text
def clean_text(text: str) -> str:
    if not text:
        return ""
    # remove emails, URLs, extra spaces
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'http\S+', ' ', text)
    text = re.sub(r'[^A-Za-z0-9\s\.\-\+]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()


# 🔍 Extract keywords using RAKE
def extract_keywords(text: str, topk: int = 20):
    r = Rake()
    r.extract_keywords_from_text(text)
    phrases = r.get_ranked_phrases()[:topk]
    return [p.lower() for p in phrases if len(p) > 2]


# 🧠 Skill extraction using lookup + NLP tokens
def extract_skills(text: str):
    text = clean_text(text)
    found = set()

    # direct match from COMMON_SKILLS
    for skill in COMMON_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text):
            found.add(skill.lower())

    # also detect proper nouns / entities that look like skills
    doc = nlp(text)
    noun_chunks = {chunk.text.lower() for chunk in doc.noun_chunks}
    for chunk in noun_chunks:
        for skill in COMMON_SKILLS:
            if skill in chunk:
                found.add(skill.lower())

    return sorted(found)


# ⚖️ ATS score calculation (smarter)
def heuristic_ats_score(resume_skills, job_skills=None):
    """
    If job_skills are given: calculate matched ratio.
    Else: calculate skill richness (normalized).
    """
    if not resume_skills:
        return 0

    if not job_skills:
        # simple heuristic: more skills = higher base score
        score = min(100, 30 + len(resume_skills) * 5)
        return round(score)

    req = set([s.lower() for s in job_skills])
    matched = req.intersection(set(resume_skills))
    score = int((len(matched) / max(1, len(req))) * 100)
    return round(score)


# 🧬 Semantic skill matching (optional)
def semantic_similarity(a_skills, b_skills):
    """Computes average cosine similarity between two skill lists."""
    if not a_skills or not b_skills:
        return 0
    a_emb = embedder.encode(a_skills, convert_to_tensor=True)
    b_emb = embedder.encode(b_skills, convert_to_tensor=True)
    sim = util.cos_sim(a_emb, b_emb)
    return float(sim.mean().cpu().numpy()) * 100


# 📄 Analyze text
def analyze_text(text: str, job_text: str = None, use_semantic=False):
    text = clean_text(text)

    # keyword + skill extraction
    keywords = extract_keywords(text, topk=25)
    skills = extract_skills(text)

    # generate mini-summary
    doc = nlp(text)
    sents = [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 30]
    summary = " ".join(sents[:2]) if sents else text[:200]

    # if job text provided, extract job skills
    job_skills = []
    ats_score = 0
    missing_skills = []
    similarity_score = 0.0

    if job_text:
        job_skills = extract_skills(job_text)
        ats_score = heuristic_ats_score(skills, job_skills)
        missing_skills = list(set(job_skills) - set(skills))
        if use_semantic:
            similarity_score = semantic_similarity(skills, job_skills)
    else:
        ats_score = heuristic_ats_score(skills)

    return {
        "atsScore": ats_score,
        "semanticScore": round(similarity_score, 2) if use_semantic else None,
        "skills": skills,
        "keywords": keywords,
        "missingSkills": missing_skills,
        "summary": summary,
        "jobSkills": job_skills,
    }


# 🧾 Wrapper for uploaded file
def analyze_text_from_file(file_bytes, filename, job_text=None):
    text = extract_text_from_bytes(file_bytes, filename)
    return analyze_text(text, job_text=job_text)
