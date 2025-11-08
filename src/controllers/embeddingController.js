import Job from "../models/job.js";

export const pushEmbeddings = async (req, res) => {
  try {
    const items = req.body.items || []; // [{jobId, embedding: [...]}, ...]
    let updated = 0;
    for (const it of items) {
      if (!it.jobId || !Array.isArray(it.embedding)) continue;
      await Job.findByIdAndUpdate(it.jobId, { $set: { embedding: it.embedding } });
      updated++;
    }
    res.json({ message: "Embeddings saved", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
