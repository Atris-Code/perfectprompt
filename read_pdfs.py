import PyPDF2
import sys
import os

def read_pdf(pdf_path):
    """Lee un PDF y devuelve su contenido como texto."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            text = f"\n{'='*80}\n"
            text += f"ARCHIVO: {os.path.basename(pdf_path)}\n"
            text += f"Páginas: {num_pages}\n"
            text += f"{'='*80}\n\n"
            
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                text += f"\n--- Página {page_num + 1} ---\n"
                text += page_text + "\n"
            
            return text
    except Exception as e:
        return f"Error leyendo {pdf_path}: {str(e)}"

if __name__ == "__main__":
    # Lista de PDFs a leer
    pdfs_to_read = [
        r"f:\PerfectPrompt\human\Estrategia de Despliegue Editorial Multimedia.pdf",
        r"f:\PerfectPrompt\human\PROMPT MAESTRO DE SISTEMA_ VISUAL CORE PYROLYSIS HUB.pdf"
    ]
    
    all_content = ""
    for pdf_path in pdfs_to_read:
        if os.path.exists(pdf_path):
            content = read_pdf(pdf_path)
            all_content += content + "\n\n"
        else:
            all_content += f"No se encontró: {pdf_path}\n\n"
    
    print(all_content)
