import express from "express";
import upload from "../middleware/upload.js"; 
import resumeQueue from "../queues/resumeQueue.js";
import Resume from "../models/resume.js";

const router = express.Router();




router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("Uploaded file:", req.file);

    // Construct file URL (for local development)
    const fileUrl = `/uploads/${req.file.filename}`;
    //const title = req.file.originalname; // file name as title

    // Save to DB
    const newResume = await Resume.create({
      user: req.user?.id || null, // optional if you have auth middleware
      title: req.file.originalname, // using filename as title
      fileUrl: fileUrl,    // required field
      status: "pending"
    });

    // // Queue analysis job
    // await resumeQueue.add({ resumeId: newResume._id });

        // 🧩 Add job to queue
    await resumeQueue.add("analyzeResume", { resumeId: newResume._id });

    res.json({
      message: "Resume uploaded & queued for analysis",
      resume: newResume,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
