import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

export interface PrintOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
}

/**
 * PrintService - Handles printing and PDF generation
 * Supports both direct printing and sharing PDF files
 */
class PrintService {
  /**
   * Print HTML content directly or share as PDF
   * @param html - HTML content to print
   * @param options - Print options including title and orientation
   */
  async print(html: string, options: PrintOptions = {}): Promise<void> {
    try {
      const { title = 'TrackVault Report', orientation = 'portrait' } = options;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        // Share the PDF file (allows user to print, save, or share)
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: title,
          UTI: 'com.adobe.pdf',
        });
      } else {
        // Fallback: Try direct printing
        await Print.printAsync({
          html,
          printerUrl: uri,
        });
      }
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert(
        'Print Error',
        'Unable to print or generate PDF. Please try again.',
      );
      throw error;
    }
  }

  /**
   * Generate print-ready HTML with standard styling
   * @param content - HTML content
   * @param title - Document title
   */
  generateHTML(content: string, title: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 15px;
          }
          
          .header h1 {
            font-size: 24px;
            color: #007AFF;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 14px;
            color: #666;
          }
          
          .section {
            margin-bottom: 25px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11px;
          }
          
          th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          
          th {
            background-color: #007AFF;
            color: white;
            font-weight: bold;
            font-size: 12px;
          }
          
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          tr:hover {
            background-color: #f0f0f0;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          
          .info-label {
            font-weight: bold;
            color: #555;
            min-width: 150px;
          }
          
          .info-value {
            color: #333;
            flex: 1;
            text-align: right;
          }
          
          .summary-box {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-top: 15px;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #ddd;
          }
          
          .summary-item:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 14px;
            margin-top: 5px;
            padding-top: 10px;
            border-top: 2px solid #007AFF;
          }
          
          .positive {
            color: #4CAF50;
            font-weight: bold;
          }
          
          .negative {
            color: #f44336;
            font-weight: bold;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #999;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          @media print {
            body {
              padding: 10px;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
  }
}

export const printService = new PrintService();
