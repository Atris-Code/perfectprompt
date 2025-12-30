import os
from pypdf import PdfReader

pdf_dir = r"f:\PerfectPrompt\human\Login"
output_file = r"f:\PerfectPrompt\login_specs.txt"

pdf_files = [
    "1. El Esquema SQL (PostgreSQL Dialect).pdf",
    "2. Requisitos Previos.pdf",
    "3. Diagrama de Flujo de Verificación.pdf",
    "4. El Payload JSON.pdf",
    "5. El System Prompt Maestro.pdf",
    "6. El Puente de Datos – De la Simulación a la Narrativa.pdf"
]

with open(output_file, "w", encoding="utf-8") as out:
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        if os.path.exists(pdf_path):
            out.write(f"--- START OF {pdf_file} ---\n")
            try:
                reader = PdfReader(pdf_path)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        out.write(text)
                        out.write("\n")
            except Exception as e:
                out.write(f"Error reading {pdf_file}: {e}\n")
            out.write(f"--- END OF {pdf_file} ---\n\n")
        else:
            out.write(f"File not found: {pdf_path}\n")

print(f"Finished extracting text to {output_file}")
