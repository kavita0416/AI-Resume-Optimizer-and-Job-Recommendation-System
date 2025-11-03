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


//Upload Resume 
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploaded file:', req.file);

    const newResume = new Resume({
      title: req.file.originalname || "Untitled Resume",
      fileUrl: `uploads/${req.file.filename}`,
      status: 'pending', // make sure this value exists in your schema enum
    });

    await newResume.save();


    // Example save to DB (if needed)
    // const resume = new ResumeModel({ filePath: req.file.path });
    // await resume.save();

    res.status(200).json({
      message: 'Upload successful',
      resume: newResume,
      //file: req.file.filename
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Upload failed',  details: error.message, });
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

export const saveAIResults = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { atsScore, keywords, recommendations } = req.body;

    // Find resume by ID
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
     // Update ATS score
    if (atsScore !== undefined) resume.atsScore = atsScore;

    // Update keywords
    if (keywords) {
      resume.keywords = Array.isArray(keywords) ? keywords : [keywords];
    }


    // Handle recommendations properly
    if (recommendations !== undefined) {
      if (Array.isArray(recommendations)) {
        // If array of objects (job recommendations)
        if (recommendations.length && typeof recommendations[0] === "object") {
          resume.recommendations = recommendations;
        } 
        // If array of strings (AI feedback)
        else if (typeof recommendations[0] === "string") {
          resume.aiSuggestions.push(...recommendations);
        }
      } else if (typeof recommendations === "string") {
        // Single text feedback string
        resume.aiSuggestions.push(recommendations);
      }
    }


    // // Update fields
    // if (atsScore !== undefined) resume.atsScore = atsScore;
    // if (keywords) resume.keywords = Array.isArray(keywords) ? keywords : [keywords];
    // if (recommendations !== undefined) {
    //   resume.recommendations = Array.isArray(recommendations)
    //     ? recommendations
    //     : [recommendations];
    // }

    
    await resume.save();

    res.json({
      message: "AI results saved successfully",
      resume,
    });
  } catch (err) {
    console.error("❌ Error saving AI results:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};