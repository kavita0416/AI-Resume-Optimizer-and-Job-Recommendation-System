

import express from "express";
import { createResume, getResumes, updateResume, deleteResume } from "../controllers/resumeController.js";
import auth from "../middleware/auth.js";

import upload from "../middleware/upload.js";
import Resume from "../models/resume.js";
import resumeQueue from "../queues/resumeQueue.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createResume);
router.get("/", auth, getResumes);
router.put("/:id", auth, updateResume);
router.delete("/:id", auth, deleteResume);

// router.post("/upload", upload.single("resume"), (req, res) => {
//   res.json({ message: "Resume uploaded successfully", file: req.file });
// });
router.post("/upload", protect, upload.single("resume"), async (req, res) => {
  try {
    console.log("File received:", req.file);
    console.log("Body fields:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newResume = await Resume.create({
      user: req.user.id,
      filename: req.file.filename,
      path: req.file.path,
      status: "pending"
    });

    await resumeQueue.add({ resumeId: newResume._id });

    res.json({ message: "Resume uploaded & queued for analysis", resume: newResume });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
