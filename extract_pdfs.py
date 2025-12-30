import PyPDF2
import os

# Rutas de los PDFs
pdf_files = [
    "Arquitectura del Flujo de Datos.pdf",
    "El Script_ economic_auditor.py.pdf",
    "JSON de Configuración Global.pdf",
    "Módulo Académico .pdf"
]

human_folder = r"f:\PerfectPrompt\human"

for pdf_file in pdf_files:
    pdf_path = os.path.join(human_folder, pdf_file)
    output_path = os.path.join(human_folder, pdf_file.replace('.pdf', '_extracted.txt'))
    
    print(f"\n{'='*60}")
    print(f"Extrayendo: {pdf_file}")
    print(f"{'='*60}")
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            print(f"Páginas encontradas: {num_pages}")
            
            full_text = ""
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                full_text += f"\n\n--- Page {page_num + 1} ---\n\n{text}"
            
            # Guardar a archivo
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(full_text)
            
            print(f"✓ Extracción completada")
            print(f"Caracteres extraídos: {len(full_text)}")
            print(f"Guardado en: {output_path}")
            
            # Mostrar primeros 500 caracteres
            print(f"\n--- PREVIEW (primeros 500 chars) ---")
            print(full_text[:500])
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")

print(f"\n{'='*60}")
print("Extracción completada para todos los PDFs")
print(f"{'='*60}")
