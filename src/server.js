// server.js file => 

import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
await connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = process.env.PORT || 5000;
const frontendPath = path.resolve(__dirname, "..", "frontend");

app.listen(PORT, () => {
  console.log(`✅ MongoDB Connected`); // okay if your app logs it too
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Serving frontend from: ${frontendPath}`);
});






