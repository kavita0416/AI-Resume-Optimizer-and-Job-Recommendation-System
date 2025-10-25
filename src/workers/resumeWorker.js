import resumeQueue from "../queues/resumeQueue.js";
import Resume from "../models/resume.js";

// Worker to process resume analysis
resumeQueue.process(async (job, done) => {
  const { resumeId } = job.data;

  console.log("🔄 Processing resume:", resumeId);

  try {
    // TODO: Call AI microservice here (e.g. HTTP request to analyzer service)

    // Simulate analysis
    await Resume.findByIdAndUpdate(resumeId, {
      status: "completed",
      analysis: { score: 85, suggestions: ["Add more keywords", "Format properly"] }
    });

    console.log(`✅ Resume ${resumeId} processed`);
    done(null, { success: true });
  } catch (err) {
    console.error(`❌ Error processing resume ${resumeId}:`, err);
    done(err);
  }
});
