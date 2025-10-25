import Queue from "bull";
import dotenv from "dotenv";

dotenv.config();

// Create Bull queue connected to Redis Cloud
const resumeQueue = new Queue("resume-analysis", process.env.REDIS_URL);

// ✅ Log events for debugging
resumeQueue.on("waiting", (jobId) => {
  console.log(`📥 Job waiting in queue: ${jobId}`);
});

resumeQueue.on("active", (job) => {
  console.log(`⚡ Job started: ${job.id}`);
});

resumeQueue.on("completed", (job, result) => {
  console.log(`✅ Job completed: ${job.id}`, result);
});

resumeQueue.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err);
});

export default resumeQueue;
