// src/scripts/seedJobs.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "../models/job.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resumeDB";

const seedJobs = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    await Job.deleteMany(); // clear existing jobs

    const jobs = [
      {
        title: "Frontend Developer",
        company: "TechCorp",
        location: "Indore",
        description: "Build and maintain user interfaces.",
        skills: ["javascript", "react", "css"],
        url: "https://techcorp.com/jobs/frontend"
      },
      {
        title: "Backend Developer",
        company: "DataWorks",
        location: "Bhopal",
        description: "Design REST APIs and manage databases.",
        skills: ["node.js", "express", "mongodb"],
        url: "https://dataworks.com/jobs/backend"
      },
      {
        title: "Full Stack Engineer",
        company: "InnovateX",
        location: "Pune",
        description: "Work on both frontend and backend systems.",
        skills: ["javascript", "react", "node.js", "mongodb"],
        url: "https://innovatex.com/jobs/fullstack"
      }
    ];

    await Job.insertMany(jobs);
    console.log("✅ Jobs seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding jobs:", err);
    process.exit(1);
  }
};

seedJobs();
