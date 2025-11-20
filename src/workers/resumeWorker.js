// workers/resumeWorker.js
import { Worker } from "bullmq";
import { connection } from "../queues/resumeQueue.js";
import Resume from "../models/resume.js";
import { analyzeResumeWithML } from "../services/mlClient.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

// ===== CONNECT TO MONGO FIRST =====
console.log("⏳ Connecting MongoDB for Worker...");
await connectDB();
console.log("✅ Worker MongoDB Connected");

// ===== START WORKER =====
const worker = new Worker(
  "resumeQueue",
  async (job) => {
    const { resumeId } = job.data;

    console.log(`⚙️ Processing Resume ID: ${resumeId}`);

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      console.log("❌ Resume not found in DB");
      return;
    }

    const filePath = `.${resume.fileUrl}`; // /uploads/file.pdf
    const mlResult = await analyzeResumeWithML(filePath);

    if (!mlResult) {
      resume.status = "failed";
      await resume.save();
      console.log("❌ ML Failed, resume updated as failed.");
      return;
    }

    // Save results
    resume.atsScore = mlResult.ats_score;
    resume.keywords = mlResult.skills || [];
    resume.analysis = mlResult;
    resume.recommendations = mlResult.jobs || [];
    resume.status = "completed";

    await resume.save();
    console.log("🎉 Resume analysis saved successfully");
  },
  { connection }
);

// Worker logs
worker.on("completed", () => console.log("🎉 Resume Job completed"));
worker.on("failed", (err) => console.error("❌ Worker Error:", err));
