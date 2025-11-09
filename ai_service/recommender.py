# ai_service/recommender.py
from sentence_transformers import SentenceTransformer, util
import numpy as np
import requests
import re

# Load model once
model = SentenceTransformer("all-MiniLM-L6-v2")


# ✅ Helper to clean text
def clean_text(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()


# 🔹 Fetch jobs from RapidAPI (JSearch)
def fetch_job_links(job_titles, location="India", limit_per_title=3):
    """
    Fetch real job links and details from JSearch API (RapidAPI)
    """
    api_url = "https://jsearch.p.rapidapi.com/search"
    headers = {
        "x-rapidapi-key": "da11a5f9dfmsh6637ea9b36d1c20p1fe200jsnb26eb2daea21",  # ✅ your key
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    job_results = []

    for title in job_titles:
        params = {
            "query": f"{title} in {location}",
            "page": "1",
            "num_pages": "1"
        }
        try:
            response = requests.get(api_url, headers=headers, params=params, timeout=10)
            if response.status_code != 200:
                print("⚠️ API error:", response.status_code, response.text[:200])
                continue

            data = response.json()
            jobs_data = data.get("data", [])
            for j in jobs_data[:limit_per_title]:
                job_results.append({
                    "title": clean_text(j.get("job_title")),
                    "company": clean_text(j.get("employer_name")),
                    "desc": clean_text(j.get("job_description") or j.get("job_title")),
                    "location": clean_text(j.get("job_city") or location),
                    "apply_link": j.get("job_apply_link")
                                   or j.get("job_google_link")
                                   or f"https://www.google.com/search?q={title}+jobs+{location}",
                    "via": clean_text(j.get("job_publisher") or "LinkedIn")
                })

        except Exception as e:
            print("❌ Error fetching jobs:", e)

    # ✅ Remove duplicates (title + company)
    unique_jobs = []
    seen = set()
    for job in job_results:
        key = (job["title"], job["company"])
        if key not in seen and job["title"]:
            unique_jobs.append(job)
            seen.add(key)

    return unique_jobs


# 🔹 Recommend jobs based on extracted skills
def recommend_jobs_for_skills(skills, location="India", top_k=3):
    """
    Recommend top-matching jobs based on semantic similarity to resume skills.
    """
    if not skills:
        return []

    job_titles = [
        "Data Scientist", "AI Engineer", "ML Engineer",
        "Frontend Developer", "Backend Developer", "Software Developer",
        "Data Analyst", "Full Stack Developer"
    ]

    # Fetch jobs dynamically
    jobs = fetch_job_links(job_titles, location=location, limit_per_title=3)
    if not jobs:
        print("⚠️ No jobs fetched from API.")
        return []

    # Prepare embeddings
    skills_text = ", ".join(skills)
    q_emb = model.encode([skills_text], convert_to_tensor=True)
    job_texts = [f"{job['title']} - {job['desc']}" for job in jobs]
    job_embs = model.encode(job_texts, convert_to_tensor=True)

    # Compute similarity (0–1 range)
    sims = util.cos_sim(q_emb, job_embs)[0].cpu().numpy()

    # Pick top matches
    idxs = np.argsort(-sims)[:top_k]
    recommendations = []
    for i in idxs:
        job = jobs[int(i)].copy()
        job["score"] = round(float(sims[int(i)]) * 100, 1)
        recommendations.append(job)

    # Sort and format final output
    recommendations = sorted(recommendations, key=lambda x: x["score"], reverse=True)

    formatted = [
        {
            "title": job["title"],
            "company": job["company"],
            "score": job["score"],
            "apply_link": job["apply_link"],
            "via": job["via"],
            "location": job["location"]
        }
        for job in recommendations
    ]

    return formatted
