import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

/**
 * Parses the given file and determines if it should be considered a "large" file
 * based on its page/slide/sheet count.
 * 
 * @param file The file to check
 * @param threshold The number of pages/slides/sheets above which a file is considered large
 * @returns true if the file is large, false otherwise
 */
export async function isLargeDocument(file: File, threshold: number = 10): Promise<boolean> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  try {
    if (extension === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      return pageCount > threshold;
    } 
    
    if (extension === 'xlsx' || extension === 'xls') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetCount = workbook.SheetNames.length;
      return sheetCount > threshold;
    }
    
    if (extension === 'pptx' || extension === 'ppt' || extension === 'docx' || extension === 'doc') {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const appXmlFile = zip.file("docProps/app.xml");
      
      if (appXmlFile) {
        const appXml = await appXmlFile.async("string");
        const match = appXml.match(/<Slides>(\d+)<\/Slides>/i) || appXml.match(/<Pages>(\d+)<\/Pages>/i);
        if (match && match[1]) {
          const count = parseInt(match[1], 10);
          return count > threshold;
        }
      }
      // Fallback for zip-based office files if we couldn't parse the XML
      return file.size > 10 * 1024 * 1024;
    }
    
    // Fallback for other file types like .txt, .csv, images, etc.
    return file.size > 10 * 1024 * 1024;
  } catch (error) {
    console.error("Error parsing file to determine size:", error);
    // Fallback to size if parsing fails
    return file.size > 10 * 1024 * 1024;
  }
}
