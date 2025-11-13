import express from "express";
import { ingestJobs } from "../controllers/jobController.js";
import { pushEmbeddings } from "../controllers/embeddingController.js";
import { protect } from "../middleware/auth.js"; // if using auth

const router = express.Router();

router.post("/ingest",/* protect, */ ingestJobs);

router.post("/push-embeddings", /* protect, */ pushEmbeddings);

export default router;
