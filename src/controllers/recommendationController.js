import Resume from "../models/resume.js";
import Job from "../models/job.js";
import { rankJobs } from "../utils/recommender.js";

/**
 * GET /api/resumes/recommendations/:resumeId?refresh=true&limit=5
 * - returns cached recommendations unless refresh=true
 */
export const getRecommendations = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const refresh = String(req.query.refresh || "false").toLowerCase() === "true";
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);

    const resume = await Resume.findById(resumeId);
    if(!resume) return res.status(404).json({ message: "Resume not found" });

    // if cached and not refresh, return cache (respecting limit)
    if(!refresh && Array.isArray(resume.recommendations) && resume.recommendations.length > 0){
      return res.json({ source: "cache", recommendations: resume.recommendations.slice(0, limit) });
    }

    // get candidate jobs (you can add filters later)
    const jobs = await Job.find({}).lean().limit(1000);

    // decide which fields to use from resume
    // prefer resume.keywords -> resume.skills -> extracted from content (if available)
    const resumeKeywords = (resume.keywords && resume.keywords.length) ? resume.keywords
                           : (resume.skills && resume.skills.length) ? resume.skills
                           : [];

    // compute ranking
    const ranked = rankJobs(resumeKeywords, jobs, limit);

    // cache compact results in resume.recommendations
    resume.recommendations = ranked; // store array of objects (jobId, title, company, score...)
    await resume.save();

    return res.json({ source: "computed", recommendations: ranked });
  } catch(err){
    console.error("Recommendation error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
