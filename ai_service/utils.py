# ai_service/utils.py
from PyPDF2 import PdfReader
import io
import docx

def extract_text_from_bytes(file_bytes, filename):
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_pdf(file_bytes)
    if lower.endswith(".docx") or lower.endswith(".doc"):
        return extract_text_docx(file_bytes)
    # fallback: try decode
    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except:
        return ""

def extract_text_pdf(file_bytes):
    reader = PdfReader(io.BytesIO(file_bytes))
    text = []
    for p in reader.pages:
        txt = p.extract_text()
        if txt:
            text.append(txt)
    return "\n".join(text)

def extract_text_docx(file_bytes):
    doc = docx.Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text]
    return "\n".join(paragraphs)
