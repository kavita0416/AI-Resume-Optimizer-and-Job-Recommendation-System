//recommendationEmbedController.js
import Resume from "../models/resume.js";
import Job from "../models/job.js";
import { cosineSimilarity } from "../utils/vector.js";

export const recommendByEmbedding = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);

    const resume = await Resume.findById(resumeId).lean();
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // If embeddings available, use them
    if (Array.isArray(resume.embedding) && resume.embedding.length > 0) {
      const candidates = await Job.find({ embedding: { $exists: true, $ne: [] } }).lean();
      const scored = candidates.map(job => ({
        job,
        score: cosineSimilarity(resume.embedding, job.embedding)
      }));
      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, limit).map(s => ({
        jobId: s.job._id,
        title: s.job.title,
        company: s.job.company,
        location: s.job.location,
        url: s.job.url,
        skills: s.job.skills,
        score: Number(s.score.toFixed(4))
      }));

      await Resume.findByIdAndUpdate(resumeId, { $set: { recommendations: top } });
      return res.json({ source: "embedding", recommendations: top });
    }

    // Fallback: skill match
    const resumeSkills = new Set((resume.skills || []).map(s => s.toLowerCase()));
    const jobs = await Job.find({}).lean();
    const scored = jobs.map(job => {
      const jobSkills = (job.skills || []).map(s => s.toLowerCase());
      const matches = jobSkills.filter(s => resumeSkills.has(s)).length;
      const score = jobSkills.length ? matches / jobSkills.length : 0;
      return { job, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, limit).map(s => ({
      jobId: s.job._id,
      title: s.job.title,
      company: s.job.company,
      location: s.job.location,
      url: s.job.url,
      skills: s.job.skills,
      score: Number(s.score.toFixed(4))
    }));
    await Resume.findByIdAndUpdate(resumeId, { $set: { recommendations: top } });
    res.json({ source: "skill-match", recommendations: top });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
