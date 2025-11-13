//resume.js file
import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true }, // local path or S3 URL
     status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    analysis: { type: Object }, // store AI results
    title: { type: String, required: true },
    summary: { type: String },
    skills: [{ type: String }],
    experience: [
      {
        company: String,
        role: String,
        duration: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        year: String,
      },
    ],
    content: {
      type: String,
      default: "",
    },
    atsScore: {
      type: Number,
      default: null,
    },
    keywords: {
      type: [String],
      default: [],
    },
    recommendations: [
      {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
        title: String,
        company: String,
        location: String,
        url: String,
        skills: [String],
        score: Number
      }
    ],
    aiSuggestions: {
    type: [String], // for text suggestions like "Improve your backend skills"
    default: [],
    },

  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
