
import os
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading {pdf_path}: {e}"

folder_path = r"f:\PerfectPrompt\human\Docker"
pdf_files = [f for f in os.listdir(folder_path) if f.endswith('.pdf')]

print(f"Found {len(pdf_files)} PDF files in {folder_path}")

for pdf_file in pdf_files:
    full_path = os.path.join(folder_path, pdf_file)
    print(f"\n--- Reading: {pdf_file} ---")
    content = extract_text_from_pdf(full_path)
    print(content) # Print full content
    print("\n--- End of File ---\n")
