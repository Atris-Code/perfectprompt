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

if not os.path.exists(folder):
    print(f"Folder not found: {folder}")
    sys.exit(1)

files = os.listdir(folder)
print(f"Files in {folder}: {files}")

for f in files:
    if f.endswith(".pdf"):
        path = os.path.join(folder, f)
        print(f"Reading {path}...")
        print(read_pdf(path))
