import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    skills: { type: [String], default: [] }, // lowercase recommended
    url: { type: String, default: "" },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
