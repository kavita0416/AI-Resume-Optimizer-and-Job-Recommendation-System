// workers/resumeWorker.js
import { Worker } from "bullmq";
import { connection } from "../queues/resumeQueue.js";
import Resume from "../models/resume.js";

const worker = new Worker(
  "resumeQueue",
  async job => {
    const { resumeId } = job.data;
    console.log("🔄 Processing resume:", resumeId);



    const score = 85; // replace with your real computed score
    const suggestions = ["Add more keywords", "Format properly"];

    await Resume.findByIdAndUpdate(resumeId, {
      status: "completed",
      analysis: { score, suggestions },
      atsScore: score
    }, { new: true });
    // // TODO: call your AI analyzer; for now simulate:
    // await Resume.findByIdAndUpdate(resumeId, {
    //   status: "completed",
    //   analysis: { score: 85, suggestions: ["Add more keywords", "Format properly"] }
    // });

    console.log(`✅ Resume ${resumeId} processed`);
    return { success: true };
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});
