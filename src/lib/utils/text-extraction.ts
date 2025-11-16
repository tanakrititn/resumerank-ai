import mammoth from 'mammoth'

// Use require for pdf-parse to get CommonJS module
const getPdfParseModule = async () => {
  try {
    // Strategy 1: Use require (works for CJS modules)
    const module = require('pdf-parse')
    return module
  } catch (e1) {
    console.log('require failed, trying ESM import:', e1)
    try {
      // Strategy 2: Dynamic import
      const module = await import('pdf-parse')
      return module
    } catch (e2) {
      console.log('ESM import failed, trying /node:', e2)
      // Strategy 3: Node-specific import
      const module = await import('pdf-parse/node')
      return module
    }
  }
}

export async function extractTextFromPDF(
  buffer: ArrayBuffer
): Promise<{ text?: string; error?: string }> {
  try {
    const pdfModule = await getPdfParseModule()

    // pdf-parse v2.4.5 exports a PDFParse class
    const PDFParse = pdfModule.PDFParse || (pdfModule as any).default?.PDFParse
    const VerbosityLevel = pdfModule.VerbosityLevel || (pdfModule as any).default?.VerbosityLevel

    if (!PDFParse) {
      console.error('Available exports:', Object.keys(pdfModule))
      throw new Error('Could not find PDFParse class in pdf-parse module')
    }

    const pdfBuffer = Buffer.from(buffer)

    // Create instance with options - disable workers to avoid Next.js issues
    const options = {
      verbosity: VerbosityLevel?.ERRORS || 0,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: false,
      disableFontFace: true,
      standardFontDataUrl: '',
      cMapUrl: '',
      cMapPacked: false,
    }

    const parser = new PDFParse(options)

    try {
      // Load the PDF buffer - this might throw worker error but we can still proceed
      await parser.load(pdfBuffer)
    } catch (loadError: any) {
      // If it's a worker error, we might still have a loaded document
      if (loadError.message?.includes('worker')) {
        console.log('Worker error occurred but attempting to continue')
        // Continue to getText anyway
      } else {
        throw loadError
      }
    }

    // Extract text from all pages
    const text = await parser.getText()

    if (!text || text.trim().length === 0) {
      throw new Error('No text extracted from PDF')
    }

    return { text }
  } catch (error) {
    console.error('PDF extraction error:', error)
    return { error: 'Failed to extract text from PDF' }
  }
}

export async function extractTextFromDOCX(
  buffer: ArrayBuffer
): Promise<{ text?: string; error?: string }> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return { text: result.value }
  } catch (error) {
    console.error('DOCX extraction error:', error)
    return { error: 'Failed to extract text from DOCX' }
  }
}

export async function extractTextFromFile(
  file: File
): Promise<{ text?: string; error?: string }> {
  const buffer = await file.arrayBuffer()

  if (file.type === 'application/pdf') {
    return extractTextFromPDF(buffer)
  } else if (
    file.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromDOCX(buffer)
  } else {
    return { error: 'Unsupported file type' }
  }
}
