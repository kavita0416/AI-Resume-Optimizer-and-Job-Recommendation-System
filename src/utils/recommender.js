// simple skill-based recommender (fast, deterministic)
export function normalizeArray(arr){
  if(!Array.isArray(arr)) return [];
  return arr.map(s => String(s).trim().toLowerCase());
}

export function scoreJobAgainstResume(resumeKeywords = [], job){
  const resume = new Set(normalizeArray(resumeKeywords));
  const jobSkills = normalizeArray(job.skills || job.metadata?.skills || []);
  if(jobSkills.length === 0) return 0;

  let match = 0;
  for(const s of jobSkills) if(resume.has(s)) match++;

  // base score = fraction matched
  let score = match / jobSkills.length;

  // small title/company boost
  const title = (job.title || "").toLowerCase();
  const company = (job.company || "").toLowerCase();
  for(const kw of resume){
    if(!kw) continue;
    if(title.includes(kw)) score += 0.05;
    if(company.includes(kw)) score += 0.03;
  }

  return Math.max(0, Math.min(1, score));
}

export function rankJobs(resumeKeywords, jobs = [], topN = 10){
  const scored = jobs.map(j => ({ job: j, score: scoreJobAgainstResume(resumeKeywords, j) }));
  scored.sort((a,b) => b.score - a.score);
  // return compact form
  return scored.slice(0, topN).map(s => ({
    jobId: s.job._id,
    title: s.job.title,
    company: s.job.company,
    location: s.job.location,
    url: s.job.url,
    skills: s.job.skills,
    score: Number(s.score.toFixed(4))
  }));
}
