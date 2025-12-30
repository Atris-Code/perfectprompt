import PyPDF2
import os
import glob

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            num_pages = len(pdf_reader.pages)
            
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text += f"\n--- Página {page_num + 1} ---\n"
                text += page.extract_text()
                
    except Exception as e:
        text = f"Error al procesar {pdf_path}: {str(e)}"
    
    return text

def main():
    # Get all PDF files in the current directory
    pdf_files = glob.glob("*.pdf")
    
    print(f"Encontrados {len(pdf_files)} archivos PDF")
    
    # Create output directory
    output_dir = "extracted_texts"
    os.makedirs(output_dir, exist_ok=True)
    
    for pdf_file in sorted(pdf_files):
        print(f"\nProcesando: {pdf_file}")
        
        # Extract text
        text = extract_text_from_pdf(pdf_file)
        
        # Create output filename
        base_name = os.path.splitext(pdf_file)[0]
        output_file = os.path.join(output_dir, f"{base_name}_extracted.txt")
        
        # Save extracted text
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"Documento: {pdf_file}\n")
            f.write(f"{'=' * 80}\n\n")
            f.write(text)
        
        print(f"  ✓ Texto extraído a: {output_file}")
        print(f"  ✓ Longitud del texto: {len(text)} caracteres")

if __name__ == "__main__":
    main()
