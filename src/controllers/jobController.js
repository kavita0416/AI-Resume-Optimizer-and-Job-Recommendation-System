import Job from "../models/job.js";

export const ingestJobs = async (req, res) => {
  try {
    const jobs = req.body.jobs || [];
    let count = 0;
    for (const j of jobs) {
      if (Array.isArray(j.skills)) j.skills = j.skills.map(s => String(s).trim());
      const filter = j.url ? { url: j.url } : { title: j.title, company: j.company };
      await Job.findOneAndUpdate(filter, { $set: j }, { upsert: true });
      count++;
    }
    res.json({ message: "Jobs ingested", count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
