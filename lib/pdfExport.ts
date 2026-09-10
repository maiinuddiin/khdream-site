import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportPDFOptions {
  filename?: string;
  isSadad?: boolean;
  format?: 'a4' | [number, number];
  orientation?: 'portrait' | 'landscape';
}

/**
 * Robust element to PNG data URL generator.
 * 1. Tries html-to-image with skipFonts: true and fontEmbedCSS: '' to avoid CORS stylesheet access errors.
 * 2. Falls back to html2canvas if html-to-image fails (e.g. cross-origin images or foreignObject error).
 */
export async function captureElementToPng(
  element: HTMLElement,
  options: {
    width?: string;
    padding?: string;
  } = {}
): Promise<string> {
  const transparentSvg = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"%2F%3E';

  // Strategy 1: html-to-image with fonts skipped to prevent accessing cross-origin cssRules
  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
      cacheBust: false,
      imagePlaceholder: transparentSvg,
      style: {
        transform: 'none',
        boxShadow: 'none',
        margin: '0',
        ...(options.width ? { width: options.width } : {}),
        ...(options.padding ? { padding: options.padding } : {}),
      },
    });

    if (dataUrl && dataUrl.startsWith('data:image/png')) {
      return dataUrl;
    }
  } catch (primaryError) {
    console.warn('html-to-image capture failed, falling back to html2canvas:', primaryError);
  }

  // Strategy 2: html2canvas fallback
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => {
        return el.classList && (el.classList.contains('no-print') || el.classList.contains('print-hidden'));
      },
    });
    return canvas.toDataURL('image/png');
  } catch (fallbackError) {
    console.error('html2canvas capture also failed:', fallbackError);
    throw fallbackError;
  }
}

/**
 * Downloads a DOM element as a high-quality PDF.
 */
export async function downloadElementAsPDF(
  element: HTMLElement,
  pdfOptions: ExportPDFOptions = {}
): Promise<void> {
  const {
    filename = 'Document.pdf',
    isSadad = false,
    format = isSadad ? [80, 160] : 'a4',
    orientation = 'portrait',
  } = pdfOptions;

  const imgData = await captureElementToPng(element, {
    ...(isSadad ? { width: '80mm', padding: '8mm' } : {}),
  });

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
