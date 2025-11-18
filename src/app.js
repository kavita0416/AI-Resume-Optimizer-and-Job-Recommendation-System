// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    // allow typical dev origins + same origin; adjust if deploying
    origin: ["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:5000", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 requests / 15min

// -----------------------------
// Static / frontend serving
// -----------------------------
const frontendPath = path.resolve(__dirname, "..", "frontend");
const frontendPathStr = String(frontendPath);

console.log("Serving frontend from:", frontendPathStr);

// Only register static middleware if folder actually exists
if (fs.existsSync(frontendPathStr)) {
  app.use(express.static(frontendPathStr));
} else {
  console.warn("WARNING: frontend folder not found at:", frontendPathStr);
  // don't exit; server will still run for API routes
}
// Serve frontend files at root (no /frontend prefix) so URLs like /results.html work
app.use(express.static(frontendPathStr));

// // Serve uploaded files (so /uploads/xxx.pdf works)
// const uploadsPath = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadsPath)) {
//   // create uploads folder if missing (optional)
//   try { fs.mkdirSync(uploadsPath, { recursive: true }); } catch (e) { /* ignore */ }
// }
// app.use("/uploads", express.static(uploadsPath));


// Serve uploads (if you use uploads)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));



app.use((req, res, next) => {
  try {
    // Let API and uploads continue to their routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    // If frontend exists, serve index.html so client-side routing works
    if (fs.existsSync(frontendPathStr)) {
      return res.sendFile(path.join(frontendPathStr, 'index.html'));
    }

    // Frontend missing -> 404 for non-API routes
    res.status(404).send('Frontend not found on server. Check frontend folder.');
  } catch (err) {
    // fallback to next middleware/error handler if anything goes wrong
    next(err);
  }
});

// -----------------------------
// API routes
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);

export default app;
