import PyPDF2
import os
import sys

def read_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = f"\n{'='*50}\nFILE: {os.path.basename(pdf_path)}\n{'='*50}\n"
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        return f"Error reading {pdf_path}: {e}"

folder = r"f:\PerfectPrompt\human\login\Admin"
files = [
    "Concepto Visual_ _Nexo Admin Console_.pdf",
    "Preparación del Modelo y Schemas.pdf",
    "El Modelo de Base de Datos (models.py).pdf"
]

for f in files:
    path = os.path.join(folder, f)
    if os.path.exists(path):
        print(read_pdf(path))
    else:
        print(f"File not found: {path}")
