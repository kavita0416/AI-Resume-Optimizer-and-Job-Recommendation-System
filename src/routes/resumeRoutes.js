

import express from "express";

import { createResume, getResumes, updateResume, deleteResume,saveAIResults } from "../controllers/resumeController.js";
import { createResumeFromText } from '../controllers/resumeController.js';
//import auth from "../middleware/auth.js";

import upload from "../middleware/upload.js";
import Resume from "../models/resume.js";
import resumeQueue from "../queues/resumeQueue.js";
import { protect } from "../middleware/auth.js";


import { getRecommendations } from "../controllers/recommendationController.js";
import { recommendByEmbedding } from "../controllers/recommenderEmbedController.js";


const router = express.Router();

router.post("/", protect, createResume);
router.get("/", protect, getResumes);
router.put("/:id", protect, updateResume);
router.delete("/:id", protect, deleteResume);
router.patch("/:resumeId/analyze", protect, saveAIResults);


router.post('/create', protect, createResumeFromText);


// GET recommendations (cached or computed)
router.get("/recommendations/:resumeId", protect, getRecommendations);
router.get("/recommendations/embed/:resumeId", protect, recommendByEmbedding);



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

    // ✅ Construct a proper file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    const newResume = await Resume.create({
      user: req.user.id,
      title: req.file.originalname || "Untitled Resume",
      fileUrl: fileUrl,
      status: "pending"
    });

    await resumeQueue.add("uploadResume", { resumeId: String(newResume._id) });


    res.json({
          message: "Resume uploaded & queued for analysis",
          resume: newResume
        });
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed", details: err.message });
      }
});
  
export default router;
