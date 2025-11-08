// src/scripts/ingestJobs.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import Job from "../models/job.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const JOB_FILE = process.env.JOB_SOURCE_FILE || "./data/jobs_sample.json";

async function run(){
  await mongoose.connect(MONGO_URI);
  console.log("Mongo connected");

  const raw = await fs.readFile(path.resolve(JOB_FILE), "utf8");
  const jobs = JSON.parse(raw);
  console.log("Loaded", jobs.length, "jobs from", JOB_FILE);

  for(const j of jobs){
    // normalize skills to lowercase (optional)
    if(Array.isArray(j.skills)) j.skills = j.skills.map(s => String(s).trim());
    const filter = j.url ? { url: j.url } : { title: j.title, company: j.company };
    await Job.findOneAndUpdate(filter, { $set: j }, { upsert: true });
  }
  console.log("Upsert complete");
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
