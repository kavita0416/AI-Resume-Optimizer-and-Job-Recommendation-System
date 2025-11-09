# ai_service/app.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from analyzer import analyze_text_from_file
from recommender import recommend_jobs_for_skills
import uvicorn

app = FastAPI()

# Serve static folder (for CSS/JS if needed)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def upload_page():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AI Resume Analyzer</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                background: #f5f7fa;
                margin: 0;
                padding: 40px;
            }
            .container {
                background: #fff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                width: 420px;
                margin: auto;
            }
            input, button {
                margin: 10px 0;
                padding: 10px;
                width: 90%;
                border-radius: 6px;
                border: 1px solid #ccc;
                font-size: 15px;
            }
            button {
                background: #007bff;
                color: white;
                cursor: pointer;
                border: none;
                transition: 0.3s;
            }
            button:hover {
                background: #0056b3;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                margin-bottom: 10px;
                font-size: 15px;
                line-height: 1.5;
            }
            a {
                color: #007bff;
                text-decoration: underline;
            }
            a:hover {
                text-decoration: none;
            }
            .missing {
                color: red;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>AI Resume Analyzer</h2>
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" name="file" required />
                <button type="submit">Analyze Resume</button>
            </form>
            <div id="result"></div>
        </div>

        <script>
        const form = document.getElementById("uploadForm");
        form.onsubmit = async (e) => {
            e.preventDefault();
            const file = e.target.file.files[0];
            if (!file) return alert("Please select a file!");

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/upload", { method: "POST", body: formData });
            const data = await res.json();

            const resultDiv = document.getElementById("result");

            if (!data || !data.skills) {
                resultDiv.innerHTML = "<p style='color:red;'>❌ Error analyzing resume.</p>";
                return;
            }

            // 🧠 Job Recommendations List
            let jobsHTML = "<p>No matching jobs found.</p>";
            if (data.recommendations && data.recommendations.length > 0) {
                jobsHTML = `
                    <ul>
                        ${data.recommendations.map(job => `
                            <li>
                                <b>${job.title}</b> — ${job.company || "N/A"} (${job.score}%)
                                <br>
                                <a href="${job.apply_link}" target="_blank">
                                    Apply Now (${job.via || "Link"})
                                </a>
                            </li>
                        `).join("")}
                    </ul>
                `;
            }

            // 🧩 Missing Skills Section
            const missingSkills = data.missing_skills && data.missing_skills.length > 0
                ? `<p class="missing"><strong>Missing Skills:</strong> ${data.missing_skills.join(", ")}</p>`
                : "<p><strong>Missing Skills:</strong> None ✅</p>";

            // 🧾 Final Render
            resultDiv.innerHTML = `
                <h3>ATS Score: ${data.ats_score}%</h3>
                <p><strong>Skills:</strong> ${data.skills.join(", ")}</p>
                ${missingSkills}
                <h4>Recommended Jobs:</h4>
                ${jobsHTML}
            `;
        };
        </script>
    </body>
    </html>
    """


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """Handle uploaded resume and return analysis + recommendations."""
    contents = await file.read()

    # 🧠 Analyze resume text
    result = analyze_text_from_file(contents, file.filename)
    ats_score = result.get("atsScore", 0)
    skills = result.get("skills", [])
    missing_skills = result.get("missingSkills", [])

    # 💼 Recommend jobs based on skills
    recommendations = recommend_jobs_for_skills(skills, top_k=3)

    return {
        "filename": file.filename,
        "ats_score": ats_score,
        "skills": skills,
        "missing_skills": missing_skills,
        "recommendations": recommendations
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9100, reload=True)
