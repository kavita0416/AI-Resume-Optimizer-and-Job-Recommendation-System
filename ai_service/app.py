from fastapi import FastAPI, File, UploadFile, Form, Request
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
    <html>
    <head>
        <title>AI Resume Analyzer</title>
        <style>
            body {
                font-family: Arial;
                text-align: center;
                background: #f5f7fa;
                margin: 0; padding: 40px;
            }
            .container {
                background: #fff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                width: 400px;
                margin: auto;
            }
            input, button {
                margin: 10px 0;
                padding: 10px;
                width: 90%;
                border-radius: 6px;
                border: 1px solid #ccc;
            }
            button {
                background: #007bff;
                color: white;
                cursor: pointer;
                border: none;
            }
            button:hover {
                background: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Upload Your Resume</h2>
            <form id="uploadForm" enctype="multipart/form-data" method="post" action="/upload">
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
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/upload", { method: "POST", body: formData });
            const data = await res.json();

            document.getElementById("result").innerHTML = `
                <h3>ATS Score: ${data.ats_score}%</h3>
                <p><strong>Skills:</strong> ${data.skills.join(", ")}</p>
                <p><strong>Recommended Jobs:</strong></p>
                <ul>${data.recommendations.map(r => `<li>${r.title} (${(r.score*100).toFixed(1)}%)</li>`).join("")}</ul>
            `;
        };
        </script>
    </body>
    </html>
    """


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    # read file bytes
    contents = await file.read()

    # analyze resume
    result = analyze_text_from_file(contents, file.filename)
    ats_score = result["atsScore"]
    skills = result["skills"]

    # recommend jobs
    recs = recommend_jobs_for_skills(skills, top_k=3)

    return {
        "filename": file.filename,
        "ats_score": ats_score,
        "skills": skills,
        "recommendations": recs
    }


