import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const ML_BASE = process.env.ML_BASE_URL || "http://localhost:8000";

export async function analyzeResumeWithML(localFilePath, jdText = "") {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(localFilePath));
    form.append("jd_text", jdText || "");

    const res = await axios.post(`${ML_BASE}/upload`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    return res.data;

  } catch (err) {
    console.error("❌ ML Analysis Error:", err.response?.data || err.message);
    return null;
  }
}
