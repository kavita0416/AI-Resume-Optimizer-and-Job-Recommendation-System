// geminiClient.js file
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🧠 Generate embeddings for job/resume text
export const getEmbeddings = async (texts) => {
  try {
    // Ensure texts is always an array
    const inputArray = Array.isArray(texts) ? texts : [texts];
    const embeddings = [];

    for (const text of inputArray) {
      const result = await genAI.embedContent({
        model: "text-embedding-004", // latest embedding model for Gemini
        content: text,
      });
      embeddings.push(result.embedding.values);
    }

    return embeddings;
  } catch (err) {
    console.error("❌ Gemini embedding error:", err.message);
    throw new Error("Gemini embedding failed");
  }
};
