import Resume from "../models/resume.js";

// Create Resume
export const createResume = async (req, res) => {
  try {
    const resume = new Resume({ ...req.body, user: req.user.id });
    const saved = await resume.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Resumes of Logged-in User
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Resume
export const updateResume = async (req, res) => {
  try {
    const updated = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Resume
export const deleteResume = async (req, res) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Resume deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
