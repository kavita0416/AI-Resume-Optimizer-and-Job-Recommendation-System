// src/controllers/recommenderEmbedController.js
import Resume from "../models/resume.js";
import Job from "../models/job.js";
import { getEmbedding } from "../services/embeddingService.js";
import { cosineSimilarity, topNByScore } from "../utils/vector.js";

export const recommendByEmbedding = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const refresh = String(req.query.refresh || "false").toLowerCase() === "true";
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);

    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // If resume already has an embedding saved and not refresh, use it
    // (we assume you have resume.embedding or compute on the fly)
    let resumeEmbedding = resume.embedding;

    if (!resumeEmbedding || refresh) {
      // Build text from resume content/keywords/skills
      const textParts = [];
      if (resume.title) textParts.push(resume.title);
      if (resume.summary) textParts.push(resume.summary);
      if (Array.isArray(resume.keywords) && resume.keywords.length) textParts.push(resume.keywords.join(" "));
      if (Array.isArray(resume.skills) && resume.skills.length) textParts.push(resume.skills.join(" "));
      if (resume.content) textParts.push(resume.content.slice(0, 15000));

      const text = textParts.join("\n");
      resumeEmbedding = await getEmbedding(text);

      // optionally store on resume for reuse
      resume.embedding = resumeEmbedding;
      await resume.save();
    }

    // Fetch candidate jobs with embeddings
    // For small datasets: fetch all and compute similarity in memory
    const candidates = await Job.find({ embedding: { $exists: true, $ne: [] } }).lean();

    const scored = candidates.map((job) => {
      const score = cosineSimilarity(resumeEmbedding, job.embedding);
      return { job, score };
    });

    // sort and return top N
    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, limit).map((s) => ({
      jobId: s.job._id,
      title: s.job.title,
      company: s.job.company,
      location: s.job.location,
      url: s.job.url,
      skills: s.job.skills,
      score: Number(s.score.toFixed(4)),
    }));

    // cache top on resume if you want (optional)
    resume.recommendations = top; // careful: earlier resume.recommendations schema expects job objects, so this fits
    await resume.save();

    return res.json({ source: "computed_embedding", recommendations: top });
  } catch (err) {
    console.error("Embedding recommender error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
