// resumeProcessor.js file

import { analyzeResumeWithML } from "./mlClient.js";

export async function runAtsAndRecommend(resumeDoc) {
  const localPath = `.${resumeDoc.fileUrl}`;

  const mlData = await analyzeResumeWithML(localPath);

  if (!mlData) return { atsScore: 0, recommendations: [] };

  return {
    atsScore: mlData.ats_score,
    keywords: mlData.skills,
    recommendations: mlData.jobs || [],
    analysis: mlData
  };
}
