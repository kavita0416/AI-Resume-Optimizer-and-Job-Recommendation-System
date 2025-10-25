import express from "express";
import upload from "../middleware/upload.js"; 
import resumeQueue from "../queues/resumeQueue.js";
import Resume from "../models/resume.js";

const router = express.Router();



router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    // Save resume entry in DB
    const newResume = await Resume.create({
      filename: req.file.filename,
      path: req.file.path,
      status: "pending"
    });

    // Enqueue job for analysis
    await resumeQueue.add({ resumeId: newResume._id });

    res.json({ message: "Resume uploaded & queued for analysis", resume: newResume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
