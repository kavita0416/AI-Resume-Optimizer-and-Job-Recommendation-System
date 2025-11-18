
//resumeController.js file 
import Resume from "../models/resume.js";
import resumeQueue from "../queues/resumeQueue.js";
import { runAtsAndRecommend } from '../services/resumeProcessor.js';

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



// paste this into src/controllers/resumeController.js (replace existing createResumeFromText)
export const createResumeFromText = async (req, res) => {
  // debug log - helps verify what client sent
  // console.log('--- /api/resumes/create request body ---');
  // console.log(JSON.stringify(req.body, null, 2));
  // console.log('--- end request body ---');

  try {
    const { text, metadata, fileUrl: incomingFileUrl, parsedText } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Empty resume text' });
    }

    // ensure we have a user id from auth middleware
    const userId = (req.user && (req.user._id || req.user.id)) || undefined;

    // Provide a placeholder fileUrl if none provided (satisfies schema)
    // NOTE: you can change the path format to match your uploads routing if required
    const fileUrl = incomingFileUrl && typeof incomingFileUrl === 'string' && incomingFileUrl.trim().length > 0
      ? incomingFileUrl
      : `/generated/resumes/${userId || 'anon'}-${Date.now()}.pdf`;

    const resumeDoc = new Resume({
      user: userId,
      title: (metadata && (metadata.name || metadata.title)) || 'Generated Resume',
      text,
      parsedText: parsedText || text,
      metadata: metadata || {},
      fileUrl,                     // <--- required field now populated
      status: 'pending',
      createdAt: new Date()
    });

    await resumeDoc.save();

    // call your ATS/recommendation pipeline (keep the function you already have)
    let processingResult = {};
    try {
      processingResult = await runAtsAndRecommend(resumeDoc);
    } catch (pipelineErr) {
      console.warn('runAtsAndRecommend failed (continuing):', pipelineErr?.message || pipelineErr);
      // You can still return saved resume even if pipeline fails
    }

    return res.json({
      resume: resumeDoc,
      atsScore: processingResult.atsScore,
      recommendations: processingResult.recommendations
    });

  } catch (err) {
    console.error('createResumeFromText', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};




// export const createResumeFromText = async (req, res) => {
//   try {
//     const { text, metadata } = req.body;
//     if (!text || text.trim().length === 0) return res.status(400).json({ message: 'Empty resume text' });

//     // Save to DB
//     const resumeDoc = new Resume({
//       user: req.user._id,             // from auth middleware
//       title: metadata?.name || 'Generated Resume',
//       text,
//       metadata,
//       createdAt: new Date()
//     });
//     await resumeDoc.save();

//     // Reuse pipeline: compute ATS score, embeddings, recommendations (implement in runAtsAndRecommend)
//     // it should return { atsScore, recommendations } and save embeddings if you need to query later
//     const processingResult = await runAtsAndRecommend(resumeDoc); 

//     return res.json({
//       resume: resumeDoc,
//       atsScore: processingResult.atsScore,
//       recommendations: processingResult.recommendations
//     });

//   } catch (err) {
//     console.error('createResumeFromText', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get All Resumes of Logged-in User
// export const getResumes = async (req, res) => {
//   try {
//     const resumes = await Resume.find({ user: req.user.id });
//     res.json(resumes);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Get resume by id (protected)
export const getResumeById = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await Resume.findById(resumeId).lean();
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    // Optionally verify ownership here: if (String(resume.user) !== String(req.user.id)) return res.status(403)...
    res.json(resume);
  } catch (err) {
    console.error("getResumeById error:", err);
    res.status(500).json({ error: err.message });
  }
};




// Upload Resume 
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Ensure we have a user id from auth middleware
    const userId = (req.user && (req.user._id || req.user.id)) || undefined;

    console.log('Uploaded file:', req.file);

    const newResume = await Resume.create({
      user: userId,
      title: req.file.originalname || "Untitled Resume",
      fileUrl: `/uploads/${req.file.filename}`,
      status: 'pending',
      createdAt: new Date()
    });

    // Add job to queue to process this resume asynchronously
    // await resumeQueue.add("processResume", { resumeId: String(newResume._id) });
    await resumeQueue.add("processResume", { resumeId: String(newResume._id) });




    res.status(200).json({
      message: 'Upload successful',
      resume: newResume,
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