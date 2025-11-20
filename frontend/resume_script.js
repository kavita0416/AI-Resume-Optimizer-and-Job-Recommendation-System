// resume_script.js
  
const qs = s => document.querySelector(s);

// Form elements (left form)
const fullName = qs('#fullName');
const titleEl = qs('#title');
const contact = qs('#contact');
const summary = qs('#summary');

// Skill add-one UI (left)
const skillInput = qs('#skillInput');
const addSkillBtn = qs('#addSkillBtn');
const skillList = qs('#skillList');

const experienceList = qs('#experienceList');
const educationList = qs('#educationList');
const addExperience = qs('#addExperience');
const addEducation = qs('#addEducation');

const internshipList = qs('#internshipList');
const projectList = qs('#projectList');
const certificateList = qs('#certificateList');
const extraList = qs('#extraList');
const softSkillsInput = qs('#softSkills');

const addInternship = qs('#addInternship');
const addProject = qs('#addProject');
const addCertificate = qs('#addCertificate');
const addExtra = qs('#addExtra');

const saveAnalyzeBtn = qs('#saveAnalyzeBtn');
const downloadPngBtn = qs('#downloadPNG');
const clearDataBtn = qs('#clearData');

// Preview containers (right)
const pvName = qs('#pv-name');
const pvTitle = qs('#pv-title');
const pvContact = qs('#pv-contact');
const pvSummary = qs('#pv-summary');
const pvSkills = qs('#pv-skills');
const pvExperience = qs('#pv-experience');
const pvEducation = qs('#pv-education');

const pvInternships = qs('#pv-internships');
const pvProjects = qs('#pv-projects');
const pvCertificates = qs('#pv-certificates');
const pvSoftskills = qs('#pv-softskills');
const pvExtras = qs('#pv-extras');

const analysisContainer = qs('#analysis');
const analysisList = qs('#analysisList');

const resumePreview = qs('#resumePreview');
const previewWrapper = qs('#previewWrapper');

const STORAGE_KEY = 'pro_resume_a4_v1';


const API_BASE = location.origin;

// small helper
function esc(s){ return (s||'').toString().replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

/* ---------- dynamic list helpers (unchanged) ---------- */

function addSkillToList(skill) {
  if(!skill) return;
  const existing = Array.from(skillList.children).some(x => x.dataset.skill.toLowerCase() === skill.toLowerCase());
  if(existing) return;
  const el = document.createElement('div');
  el.className = 'skill-tag';
  el.dataset.skill = skill;
  el.innerHTML = `<span>${esc(skill)}</span><button aria-label="Remove skill">×</button>`;
  el.querySelector('button').addEventListener('click', () => { el.remove(); renderPreview(); });
  skillList.appendChild(el);
  renderPreview();
}
function collectSkillsFromList(){ return Array.from(skillList.children).map(n => n.dataset.skill).filter(Boolean); }

function createExperienceBlock(data={}) {
  const w = document.createElement('div'); w.className='exp-block';
  w.innerHTML = `
    <label>Company
      <input class="exp-company" type="text" placeholder="Company Inc." value="${esc(data.company||'')}"/>
    </label>
    <label>Role & dates
      <input class="exp-role" type="text" placeholder="Senior Product Designer — 2020–Present" value="${esc(data.role||'')}"/>
    </label>
    <label>Description
      <textarea class="exp-desc" rows="2" placeholder="A short list of achievements">${esc(data.description||'')}</textarea>
    </label>
    <div style="display:flex;gap:8px;margin-top:6px">
      <button class="btn small removeExp">Remove</button>
    </div>
    <hr style="margin:10px 0;opacity:.06" />`;
  w.querySelector('.removeExp').addEventListener('click', ()=>{ w.remove(); renderPreview(); });
  experienceList.appendChild(w);
  return w;
}
function createEducationBlock(data={}) {
  const w = document.createElement('div'); w.className='edu-block';
  w.innerHTML = `
    <label>Institution
      <input class="edu-school" type="text" placeholder="University X" value="${esc(data.school||'')}"/>
    </label>
    <label>Degree & year
      <input class="edu-degree" type="text" placeholder="B.Sc. Computer Science — 2018" value="${esc(data.degree||'')}"/>
    </label>
    <div style="display:flex;gap:8px;margin-top:6px">
      <button class="btn small removeEdu">Remove</button>
    </div>
    <hr style="margin:10px 0;opacity:.06" />`;
  w.querySelector('.removeEdu').addEventListener('click', ()=>{ w.remove(); renderPreview(); });
  educationList.appendChild(w);
  return w;
}
function createInternshipBlock(data={}) {
  const w = document.createElement('div'); w.className='intern-block';
  w.innerHTML = `
    <label>Company / Org
      <input class="intern-company" type="text" placeholder="Company / Org" value="${esc(data.company||'')}" />
    </label>
    <label>Role & dates
      <input class="intern-role" type="text" placeholder="Role — 2021 (Intern)" value="${esc(data.role||'')}" />
    </label>
    <label>Highlights
      <textarea class="intern-desc" rows="2" placeholder="Highlights">${esc(data.description||'')}</textarea>
    </label>
    <div style="display:flex;gap:8px;margin-top:6px">
      <button class="btn small removeIntern">Remove</button>
    </div><hr style="margin:10px 0;opacity:.06" />`;
  w.querySelector('.removeIntern').addEventListener('click', ()=>{ w.remove(); renderPreview(); });
  internshipList.appendChild(w);
  return w;
}
function createProjectBlock(data={}) {
  const w = document.createElement('div'); w.className='project-block';
  w.innerHTML = `
    <label>Project title
      <input class="project-title" type="text" placeholder="Project title" value="${esc(data.title||'')}" />
    </label>
    <label>Role / Tools
      <input class="project-meta" type="text" placeholder="Role / tools used" value="${esc(data.meta||'')}" />
    </label>
    <label>Description
      <textarea class="project-desc" rows="2" placeholder="Describe the project">${esc(data.description||'')}</textarea>
    </label>
    <div style="display:flex;gap:8px;margin-top:6px">
      <button class="btn small removeProject">Remove</button>
    </div><hr style="margin:10px 0;opacity:.06" />`;
  w.querySelector('.removeProject').addEventListener('click', ()=>{ w.remove(); renderPreview(); });
  projectList.appendChild(w);
  return w;
}
function createCertificateBlock(data={}) {
  const w = document.createElement('div'); w.className='cert-block';
  w.innerHTML = `
    <label>Certificate title
      <input class="cert-title" type="text" placeholder="Certificate name" value="${esc(data.title||'')}" />
    </label>
    <label>Issuer / Year
      <input class="cert-meta" type="text" placeholder="Issuer — Year" value="${esc(data.meta||'')}" />
    </label>
    <div style="display:flex;gap:8px;margin-top:6px">
      <button class="btn small removeCert">Remove</button>
    </div><hr style="margin:10px 0;opacity:.06" />`;
  w.querySelector('.removeCert').addEventListener('click', ()=>{ w.remove(); renderPreview(); });
  certificateList.appendChild(w);
  return w;
}
function createExtraBlock(data={}) {
  const w = document.createElement('div'); w.className='extra-block';
  w.innerHTML = `
    <label>Activity / Role
      <input class="extra-title" type="text" placeholder="Activity — Role" value="${esc(data.title||'')}" />
    </label>
    <label>Notes
      <textarea class="extra-desc" rows="2" placeholder="Details">${esc(data.description||'')}</textarea>
    </label>
    <div style="display:flex;gap:8px;margin-top:6px">
      <button class="btn small removeExtra">Remove</button>
    </div><hr style="margin:10px 0;opacity:.06" />`;
  w.querySelector('.removeExtra').addEventListener('click', ()=>{ w.remove(); renderPreview(); });
  extraList.appendChild(w);
  return w;
}

/* ---------- gather & render ---------- */

function gatherData(){
  const exps = Array.from(experienceList.querySelectorAll('.exp-block')).map(n=>({
    company: n.querySelector('.exp-company').value.trim(),
    role: n.querySelector('.exp-role').value.trim(),
    description: n.querySelector('.exp-desc').value.trim()
  })).filter(e => e.company || e.role || e.description);

  const eds = Array.from(educationList.querySelectorAll('.edu-block')).map(n=>({
    school: n.querySelector('.edu-school').value.trim(),
    degree: n.querySelector('.edu-degree').value.trim()
  })).filter(e => e.school || e.degree);

  const internships = Array.from(internshipList.querySelectorAll('.intern-block')).map(n=>({
    company: n.querySelector('.intern-company').value.trim(),
    role: n.querySelector('.intern-role').value.trim(),
    description: n.querySelector('.intern-desc').value.trim()
  })).filter(i => i.company || i.role || i.description);

  const projects = Array.from(projectList.querySelectorAll('.project-block')).map(n=>({
    title: n.querySelector('.project-title').value.trim(),
    meta: n.querySelector('.project-meta').value.trim(),
    description: n.querySelector('.project-desc').value.trim()
  })).filter(p => p.title || p.meta || p.description);

  const certificates = Array.from(certificateList.querySelectorAll('.cert-block')).map(n=>({
    title: n.querySelector('.cert-title').value.trim(),
    meta: n.querySelector('.cert-meta').value.trim()
  })).filter(c => c.title || c.meta);

  const extras = Array.from(extraList.querySelectorAll('.extra-block')).map(n=>({
    title: n.querySelector('.extra-title').value.trim(),
    description: n.querySelector('.extra-desc').value.trim()
  })).filter(x => x.title || x.description);

  const skillsArr = collectSkillsFromList();

  const softSkillsArr = (softSkillsInput.value || '').split(',').map(s=>s.trim()).filter(Boolean);

  return {
    fullName: fullName.value.trim(),
    title: titleEl.value.trim(),
    contact: contact.value.trim(),
    summary: summary.value.trim(),
    experience: exps,
    education: eds,
    skills: skillsArr,
    internships: internships,
    projects: projects,
    certificates: certificates,
    extras: extras,
    softSkills: softSkillsArr
  };
}

function renderPreview(){
  const d = gatherData();

  pvName.textContent = d.fullName || 'Your Name';
  pvTitle.textContent = d.title || 'Job Title';
  pvContact.textContent = d.contact || 'City · email@example.com';
  pvSummary.textContent = d.summary || 'A concise summary describing strengths and focus areas.';

  pvExperience.innerHTML = '';
  if(d.experience.length === 0){
    pvExperience.innerHTML = `<div class="muted small">No experience added.</div>`;
  } else {
    d.experience.forEach(e=>{
      const el = document.createElement('div');
      el.className = 'exp-item';
      el.innerHTML = `<div class="role">${esc(e.role||'')}</div>
                      <div class="meta">${esc(e.company||'')}</div>
                      <div class="desc">${esc(e.description||'')}</div>`;
      pvExperience.appendChild(el);
    });
  }

  pvInternships.innerHTML = '';
  if (d.internships && d.internships.length) {
    d.internships.forEach(i => {
      const n = document.createElement('div'); n.className = 'intern-item';
      n.innerHTML = `<div class="role">${esc(i.role||'')}</div>
                     <div class="meta">${esc(i.company||'')}</div>
                     <div class="desc">${esc(i.description||'')}</div>`;
      pvInternships.appendChild(n);
    });
  } else pvInternships.innerHTML = '';

  pvProjects.innerHTML = '';
  if (d.projects && d.projects.length) {
    d.projects.forEach(p => {
      const n = document.createElement('div'); n.className = 'project-item';
      n.innerHTML = `<div class="title">${esc(p.title||'')}</div>
                     <div class="meta">${esc(p.meta||'')}</div>
                     <div class="desc">${esc(p.description||'')}</div>`;
      pvProjects.appendChild(n);
    });
  } else pvProjects.innerHTML = '';

  pvCertificates.innerHTML = '';
  if (d.certificates && d.certificates.length) {
    d.certificates.forEach(c => {
      const n = document.createElement('div'); n.className = 'cert-item';
      n.innerHTML = `<div class="title">${esc(c.title||'')}</div>
                     <div class="meta">${esc(c.meta||'')}</div>`;
      pvCertificates.appendChild(n);
    });
  } else pvCertificates.innerHTML = '';

  pvSoftskills.innerHTML = '';
  if (d.softSkills && d.softSkills.length) {
    d.softSkills.forEach(s => {
      const sp = document.createElement('span'); sp.className = 'soft-skill-pill'; sp.textContent = s;
      pvSoftskills.appendChild(sp);
    });
  } else pvSoftskills.innerHTML = '';

  pvExtras.innerHTML = '';
  if (d.extras && d.extras.length) {
    d.extras.forEach(x => {
      const n = document.createElement('div'); n.className = 'extra-item';
      n.innerHTML = `<div class="title">${esc(x.title||'')}</div>
                     <div class="desc">${esc(x.description||'')}</div>`;
      pvExtras.appendChild(n);
    });
  } else pvExtras.innerHTML = '';

  pvEducation.innerHTML = '';
  if(d.education.length === 0){
    pvEducation.innerHTML = `<div class="muted small">No education added.</div>`;
  } else {
    d.education.forEach(ed=>{
      const el = document.createElement('div');
      el.className = 'exp-item';
      el.innerHTML = `<div class="role">${esc(ed.degree||'')}</div>
                      <div class="meta">${esc(ed.school||'')}</div>`;
      pvEducation.appendChild(el);
    });
  }

  pvSkills.innerHTML = '';
  (d.skills || []).forEach(s=>{
    const sp = document.createElement('span');
    sp.className = 'skill-pill';
    sp.textContent = s;
    pvSkills.appendChild(sp);
  });
}

/* ---------- analysis ---------- */

function runAnalysis(data){
  analysisContainer.hidden = false;
  const text = (data.summary + ' ' + data.experience.map(e=>e.description).join(' ')).trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const items = [
    `Name: ${data.fullName || '(not provided)'}`,
    `Title: ${data.title || '(not provided)'}`,
    `Words (summary & experience): ${words}`,
    `Experience entries: ${data.experience.length}`,
    `Education entries: ${data.education.length}`,
    `Internships: ${data.internships.length}`,
    `Projects: ${data.projects.length}`,
    `Certificates: ${data.certificates.length}`,
    `Soft skills: ${data.softSkills.length}`,
    `Estimated reading time: ${Math.max(1, Math.ceil(words / 200))} min`
  ];
  analysisList.innerHTML = items.map(i=>`<li>${i}</li>`).join('');
}




// domToPdfBlob implementation — returns a Blob of an A4 PDF
async function domToPdfBlob(element) {
    if (typeof html2canvas === 'undefined') {
    throw new Error('html2canvas not loaded. Ensure you included html2canvas CDN before resume_script.js');
  }
  if (!element) {
    element = document.getElementById('resumePreview') ||
              document.getElementById('previewWrapper') ||
              document.querySelector('.preview.a4');
  }
  if (!element) throw new Error('preview element not found (domToPdfBlob)');

  // render at higher scale for crispness
  const canvas = await html2canvas(element, { 
  scale: window.devicePixelRatio * 2,   // uses real display DPI
  useCORS: true,
  backgroundColor: "#ffffff"
});

  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

  // convert px -> mm
  const pxToMm = 25.4 / 96;
  const imgWidthMm = canvas.width * pxToMm;
  const imgHeightMm = canvas.height * pxToMm;

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;

  const usableW = pageWidth - margin * 2;
  const usableH = pageHeight - margin * 2;

  const scale = Math.min(usableW / imgWidthMm, usableH / imgHeightMm, 1);
  const finalWidth = imgWidthMm * scale;
  const finalHeight = imgHeightMm * scale;

  const x = (pageWidth - finalWidth) / 2;
  const y = (pageHeight - finalHeight) / 2;

  // Add the image to the PDF
  pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');

  // return PDF as Blob
  return pdf.output('blob');
}



/* ---------- show preview iframe helper ---------- */

function showIframeFromBlob(blob) {
  const preview = document.getElementById('previewContainer') || document.createElement('div');
  preview.id = 'previewContainer';
  const url = URL.createObjectURL(blob);
  preview.innerHTML = `<h3>Preview:</h3><iframe src="${url}" width="100%" height="600" style="border:1px solid #ccc;border-radius:6px"></iframe>`;
  document.querySelector('main')?.appendChild(preview);
}



async function saveAndAnalyzeTemplate() {
  const token = localStorage.getItem('er_token') || localStorage.getItem("token");
  if (!token) { 
      alert('Please login first'); 
      return; 
  }

  const saveBtn = saveAnalyzeBtn || document.getElementById('saveAnalyzeBtn');
  if (saveBtn) { 
      saveBtn.disabled = true; 
      saveBtn.textContent = 'Saving...'; 
  }

  try {
      // 1️⃣ Convert resume preview → PDF Blob
      const element = document.getElementById('resumePreview') 
                    || document.getElementById('previewWrapper');

      if (!element) {
          alert('Preview not found!');
          throw new Error('Preview DOM missing');
      }

      const pdfBlob = await domToPdfBlob(element);

      // Optional local preview
      showIframeFromBlob(pdfBlob);

      // 2️⃣ Build FormData for Node backend
      const fd = new FormData();
      fd.append(
          "resume",
          new File([pdfBlob], `resume-${Date.now()}.pdf`, { type: "application/pdf" })
      );

      // 3️⃣ Upload PDF to Node backend
      const API = window.ER_API || "http://localhost:5000";

      const uploadRes = await fetch(`${API}/api/resumes/upload`, {
          method: "POST",
          headers: { 
              Authorization: `Bearer ${token}` 
          },
          body: fd
      });

      const uploadJson = await uploadRes.json();

      if (!uploadRes.ok) {
          console.error("Upload error:", uploadJson);
          throw new Error(uploadJson.error || uploadJson.message || "Upload failed");
      }

      const resume = uploadJson.resume || uploadJson;
      const resumeId = resume._id;

      if (!resumeId) throw new Error("resumeId missing from server response");

      // 4️⃣ Save for frontend reference
      localStorage.setItem("uploaded_resume_id", resumeId);

      // 5️⃣ Trigger ML analysis
      await fetch(`${API}/api/resumes/${resumeId}/analyze`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
      });

      // 6️⃣ Redirect to results page
     
        window.location.href = "result.html";
  } catch (err) {
      console.error("saveAndAnalyzeTemplate error:", err);
      alert("Error: " + (err.message || err));
  } finally {
      if (saveBtn) { 
          saveBtn.disabled = false; 
          saveBtn.textContent = "Save & Analyze → PDF (A4)";
      }
  }
}


/* ---------- Generate PDF download (local) ---------- */

async function generateA4PDF(){
  const element = document.getElementById('resumePreview') || document.getElementById('previewWrapper') || document.querySelector('.preview.a4');
  if (!element) { alert('Preview not found'); return; }

  saveAnalyzeBtn.disabled = true;
  saveAnalyzeBtn.textContent = 'Generating...';

  const prevShadow = previewWrapper.style.boxShadow;
  const prevPadding = previewWrapper.style.padding;
  previewWrapper.style.boxShadow = 'none';
  previewWrapper.style.padding = '0';

  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });

    const pxToMm = 25.4 / 96;
    const imgWidthMm = canvas.width * pxToMm;
    const imgHeightMm = canvas.height * pxToMm;

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    const usableW = pageWidth - margin*2;
    const usableH = pageHeight - margin*2;

    const scale = Math.min(usableW / imgWidthMm, usableH / imgHeightMm, 1);
    const finalWidth = imgWidthMm * scale;
    const finalHeight = imgHeightMm * scale;

    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');

    const data = gatherData();
    const fileName = ((data && data.fullName) || 'resume').replace(/\s+/g,'_').toLowerCase() + '_A4.pdf';
    pdf.save(fileName);
  } catch (err) {
    console.error('PDF error', err);
    alert('Failed to generate PDF — see console.');
  } finally {
    previewWrapper.style.boxShadow = prevShadow || '';
    previewWrapper.style.padding = prevPadding || '22px';
    saveAnalyzeBtn.disabled = false;
    saveAnalyzeBtn.textContent = 'Save & Analyze → PDF (A4)';
  }
}

/* ---------- PNG download ---------- */

async function downloadPNG(){
  downloadPngBtn.disabled = true;
  downloadPngBtn.textContent = 'Rendering...';
  try {
    const canvas = await html2canvas(resumePreview, {scale: 2, useCORS: true, backgroundColor: '#ffffff'});
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = ((fullName.value || 'resume').replace(/\s+/g,'_').toLowerCase() || 'resume') + '_A4.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch(e){
    console.error(e);
    alert('Failed to render PNG.');
  } finally {
    downloadPngBtn.disabled = false;
    downloadPngBtn.textContent = 'Download PNG';
  }
}

/* ---------- local storage load/save helpers ---------- */

function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return;
  try {
    const data = JSON.parse(raw);
    fullName.value = data.fullName || '';
    titleEl.value = data.title || '';
    contact.value = data.contact || '';
    summary.value = data.summary || '';
    skillList.innerHTML = '';
    (data.skills || []).forEach(s => addSkillToList(s));
    softSkillsInput.value = (data.softSkills || []).join(', ');

    experienceList.innerHTML = '';
    (data.experience || []).forEach(e => createExperienceBlock(e));

    educationList.innerHTML = '';
    (data.education || []).forEach(ed => createEducationBlock(ed));

    internshipList.innerHTML = '';
    (data.internships || []).forEach(i => createInternshipBlock(i));

    projectList.innerHTML = '';
    (data.projects || []).forEach(p => createProjectBlock(p));

    certificateList.innerHTML = '';
    (data.certificates || []).forEach(c => createCertificateBlock(c));

    extraList.innerHTML = '';
    (data.extras || []).forEach(x => createExtraBlock(x));
  } catch(e){
    console.warn('Bad saved data', e);
  }
}

function ensureStarter(){
  if(experienceList.querySelectorAll('.exp-block').length === 0){
    createExperienceBlock({company:'Company Inc.', role:'Product Designer — 2020–Present', description:'Led product roadmap and shipped key features.'});
  }
  if(educationList.querySelectorAll('.edu-block').length === 0){
    createEducationBlock({school:'University of Somewhere', degree:'B.Sc. in Design — 2018'});
  }
  if (skillList.children.length === 0) {
    ['Communication','Teamwork','Problem solving'].forEach(s => addSkillToList(s));
  }

  if (internshipList.querySelectorAll('.intern-block').length === 0) createInternshipBlock({company:'Startup XYZ', role:'Software Intern — 2019', description:'Implemented feature X.'});
  if (projectList.querySelectorAll('.project-block').length === 0) createProjectBlock({title:'Portfolio Site', meta:'React', description:'Built responsive site.'});
  if (certificateList.querySelectorAll('.cert-block').length === 0) createCertificateBlock({title:'AWS Certified', meta:'Amazon — 2021'});
  if (extraList.querySelectorAll('.extra-block').length === 0) createExtraBlock({title:'Volunteer — Animal Shelter', description:'Organized adoption events.'});
  if (!softSkillsInput.value) softSkillsInput.value = 'Communication, Teamwork, Problem solving';
}

/* ---------- events wiring ---------- */

if (addSkillBtn) addSkillBtn.addEventListener('click', e => { e.preventDefault(); const val = (skillInput.value || '').trim(); if (!val) return; addSkillToList(val); skillInput.value = ''; skillInput.focus(); });
if (skillInput) skillInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkillBtn.click(); } });

addExperience.addEventListener('click', e => { e.preventDefault(); createExperienceBlock(); });
addEducation.addEventListener('click', e => { e.preventDefault(); createEducationBlock(); });

addInternship.addEventListener('click', e => { e.preventDefault(); createInternshipBlock(); });
addProject.addEventListener('click', e => { e.preventDefault(); createProjectBlock(); });
addCertificate.addEventListener('click', e => { e.preventDefault(); createCertificateBlock(); });
addExtra.addEventListener('click', e => { e.preventDefault(); createExtraBlock(); });

[fullName,titleEl,contact,summary,softSkillsInput].forEach(i => { if(i) i.addEventListener('input', renderPreview); });
experienceList.addEventListener('input', renderPreview);
educationList.addEventListener('input', renderPreview);
internshipList.addEventListener('input', renderPreview);
projectList.addEventListener('input', renderPreview);
certificateList.addEventListener('input', renderPreview);
extraList.addEventListener('input', renderPreview);

if (saveAnalyzeBtn) {
    saveAnalyzeBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log("Save & Analyze clicked"); // Debug
      
        await saveAndAnalyzeTemplate();  // 🚀 PDF upload + ML trigger

        console.log("Redirect step running"); // Debug
    });
}

if (downloadPngBtn) downloadPngBtn.addEventListener('click', e => { e.preventDefault(); downloadPNG(); });
if (clearDataBtn) clearDataBtn.addEventListener('click', e => { e.preventDefault(); if(confirm('Clear saved data?')){ localStorage.removeItem(STORAGE_KEY); location.reload(); } });

/* ---------- init ---------- */

function goToResults() {
    const resumeText = document.getElementById("resumeOutput").innerText;

    // Save text for result.html
    localStorage.setItem("generatedResumeText", resumeText);

    window.location.href = "result.html";
    

}




ensureStarter();
loadData();
renderPreview();
