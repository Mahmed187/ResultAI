import { parsePathologyReport } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    // Validate that a file was uploaded
    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF using pdf2json
    const pdfParser = new PDFParser();

    // Create a promise to handle the async parsing
    const parsePDF = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          reject(new Error(`PDF parsing error: ${errData.parserError}`));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            // Extract text from all pages
            let extractedText = '';
            
            if (pdfData.Pages) {
              pdfData.Pages.forEach((page: any) => {
                if (page.Texts) {
                  page.Texts.forEach((textItem: any) => {
                    if (textItem.R) {
                      textItem.R.forEach((textRun: any) => {
                        if (textRun.T) {
                          // Decode URI component to handle special characters
                          extractedText += decodeURIComponent(textRun.T) + ' ';
                        }
                      });
                    }
                  });
                  extractedText += '\n'; // Add line break between pages
                }
              });
            }

            resolve(extractedText.trim());
          } catch (error) {
            reject(new Error('Failed to extract text from PDF'));
          }
        });

        // Parse the PDF buffer
        pdfParser.parseBuffer(buffer);
      });
    };

    // Execute the PDF parsing
    const extractedText = await parsePDF();
 
    const parsedReport = parsePathologyReport(extractedText);
 
    // Return the extracted text
    return NextResponse.json({
      success: true,
      text: extractedText, 
      parsedData: parsedReport,
      filename: file.name,
      fileSize: file.size,
    });

  } catch (error) {
    console.error('PDF parsing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to parse PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

 