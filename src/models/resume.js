import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true }, // local path or S3 URL
    status: { type: String, enum: ["uploaded", "processing", "completed"], default: "uploaded" },
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
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
