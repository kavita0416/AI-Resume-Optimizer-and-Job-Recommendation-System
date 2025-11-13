// resumeQueue.js file
import { Queue } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";


dotenv.config();


const useTLS = process.env.REDIS_TLS === "true"; 


// console.log("Redis Config =>", process.env.REDIS_HOST, process.env.REDIS_PORT, process.env.REDIS_TLS);

const connection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  ...(useTLS ? { tls: { rejectUnauthorized: false } } : {}),
};


console.log("Redis Config =>", process.env.REDIS_HOST, process.env.REDIS_PORT, useTLS ? "TLS enabled" : "TLS disabled");


const resumeQueue = new Queue("resumeQueue", { connection });

resumeQueue.on("error", (err) => {
  console.error("❌ Queue error:", err);
});


export default resumeQueue;
