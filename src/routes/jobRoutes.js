// jobRoutes.js file
import express from "express";
import { ingestJobs } from "../controllers/jobController.js";
import { pushEmbeddings } from "../controllers/embeddingController.js";


const router = express.Router();

router.post("/ingest",/* protect, */ ingestJobs);

router.post("/push-embeddings", /* protect, */ pushEmbeddings);

export default router;
