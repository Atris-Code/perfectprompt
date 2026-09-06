import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configuración única del worker de PDF.js (bundled por Vite en vez de CDN).
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extrae el texto plano de un PDF a partir de su ArrayBuffer.
 * Reemplaza el uso del global `window.pdfjsLib` (antes cargado vía CDN).
 */
export async function pdfToText(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n\n';
  }
  return fullText.trim();
}
