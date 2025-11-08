
// import OpenAI from "openai";
// import dotenv from "dotenv";
// dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // default model — override in .env if needed
// const MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-large";

// export async function getEmbedding(text) {
//   if (!text) return [];

//   // ensure string length limit for provider; truncate sensibly
//   const MAX_CHARS = 20000;
//   const input = typeof text === "string" ? text.slice(0, MAX_CHARS) : String(text);

//   const resp = await client.embeddings.create({
//     model: MODEL,
//     input,
//   });

//   // resp.data[0].embedding is the vector
//   return resp.data?.[0]?.embedding ?? [];
// }
