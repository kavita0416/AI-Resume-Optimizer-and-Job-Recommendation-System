
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Job from "../models/job.js"; // path relative to src/scripts
import { getEmbedding } from "../services/embeddingService.js";

const MONGO_URI = process.env.MONGO_URI;

const SAMPLE_FILE = process.env.JOB_SOURCE_FILE || "data/jobs_sample.json"; // path relative to project root

import fs from "fs/promises";
import path from "path";

async function loadJobsFromJson(filePath) {
  const raw = await fs.readFile(path.resolve(filePath), "utf8");
  return JSON.parse(raw);
}

async function run() {
  if (!MONGO_URI) throw new Error("MONGO_URI missing in .env");
  await mongoose.connect(MONGO_URI);
  console.log("Mongo connected");

  // load from JSON
  const jobsData = await loadJobsFromJson(SAMPLE_FILE);
  console.log(`Loaded ${jobsData.length} jobs from ${SAMPLE_FILE}`);

  // insert jobs without embeddings first
  // we'll upsert to avoid duplicates (by title+company or url)
  for (const j of jobsData) {
    const filter = j.url ? { url: j.url } : { title: j.title, company: j.company };
    await Job.findOneAndUpdate(filter, { $set: j }, { upsert: true });
  }
  console.log("Jobs upserted");

  // fetch all jobs without embeddings or empty embeddings
  const jobsToEmbed = await Job.find({ $or: [{ embedding: { $exists: false } }, { embedding: [] }] }).lean();
  console.log(`Need to compute embeddings for ${jobsToEmbed.length} jobs`);

  const BATCH = 16; // pick a safe batch size considering rate limits
  for (let i = 0; i < jobsToEmbed.length; i += BATCH) {
    const batch = jobsToEmbed.slice(i, i + BATCH);
    console.log(`Processing batch ${i} -> ${i + batch.length}`);

    // compute embeddings one-by-one (or you can call API in parallel if provider supports batch)
    for (const jb of batch) {
      const text = `${jb.title}\n${jb.company}\n${jb.location}\n${jb.description}\nSkills: ${ (jb.skills || []).join(", ") }`;
      try {
        const vector = await getEmbedding(text);
        if (vector && vector.length) {
          await Job.findByIdAndUpdate(jb._id, { $set: { embedding: vector } });
          console.log(`Embedded job ${jb._id} (${jb.title})`);
        } else {
          console.warn("Empty vector for job", jb._id);
        }
      } catch (err) {
        console.error("Embedding error for job", jb._id, err.message);
      }
      // small pause to be polite (optional)
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log("Embedding complete");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
