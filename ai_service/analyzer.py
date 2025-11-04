# ai_service/analyzer.py
import json
from utils import extract_text_from_bytes
from rake_nltk import Rake
import spacy
from sentence_transformers import SentenceTransformer, util
import numpy as np

nlp = spacy.load("en_core_web_sm")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# simple skill seed list (extendable)
COMMON_SKILLS = ["python","java","javascript","react","node.js","node","django","flask","sql","mongodb",
                 "aws","docker","kubernetes","machine learning","nlp","tensorflow","pytorch","excel","powerpoint",
                 "communication","leadership","project management","git","html","css","linux","c++","c#","go","ruby","php",
                 "data analysis","data science","tableau","power bi","agile","scrum","rest","graphql","ci/cd","devops","unity","unreal engine","swift","kotlin  ","android","ios" ,"sales","marketing","seo","content writing","customer service","accounting","financial analysis","business analysis","human resources","recruitment","training","public speaking","time management","problem solving","critical thinking","teamwork","collaboration","adaptability","creativity","strategic planning","negotiation","conflict resolution","research","networking","branding","social media","email marketing","event planning","budgeting","forecasting","supply chain management","logistics","quality assurance","regulatory compliance","risk management","data visualization","big data","hadoop","spark","sas","r programming","matlab","solidworks","autocad","photoshop","illustrator","video editing","animation","3d modeling"]

def clean_tokens(text):
    return text.replace("\n"," ").strip()

def extract_keywords(text, topk=20):
    r = Rake()
    r.extract_keywords_from_text(text)
    phrases = r.get_ranked_phrases()[:topk]
    # normalize
    return [p.lower() for p in phrases]

def extract_skills_by_lookup(text):
    t = text.lower()
    found = set()
    for s in COMMON_SKILLS:
        if s in t:
            found.add(s)
    return list(found)

def heuristic_ats_score(resume_skills, job_skills=None):
    # base: proportion of required job skills found
    if not job_skills:
        # fallback: score by number of detected skills (cap)
        score = min(90, 30 + len(resume_skills)*10)
        return int(score)
    req = set([s.lower() for s in job_skills])
    matched = req.intersection(set(resume_skills))
    score = int((len(matched)/max(1,len(req))) * 100)
    return score

def analyze_text(text, job_text=None):
    text = clean_tokens(text)
    keywords = extract_keywords(text, topk=30)
    skills = extract_skills_by_lookup(text)
    summary = ""
    # small summary using spaCy sentences
    doc = nlp(text)
    sents = [sent.text.strip() for sent in doc.sents]
    if len(sents)>0:
        summary = " ".join(sents[:2])
    # if job_text provided, extract job req skills (simple: keywords)
    job_skills = []
    if job_text:
        job_skills = extract_keywords(job_text, topk=20)
    ats = heuristic_ats_score(skills, job_skills)
    return {
        "atsScore": ats,
        "keywords": keywords,
        "skills": skills,
        "missingSkills": list(set(job_skills)-set(skills)) if job_text else [],
        "summary": summary
    }

def analyze_text_from_file(file_bytes, filename, job_text=None):
    text = extract_text_from_bytes(file_bytes, filename)
    return analyze_text(text, job_text=job_text)
