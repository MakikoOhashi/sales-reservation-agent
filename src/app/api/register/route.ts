import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/utils/googleSheets';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    // Initialize Google Sheets service (would need proper config in production)
    const sheetsService = new GoogleSheetsService({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
      sheetName: process.env.GOOGLE_SHEETS_NAME || 'Sheet1',
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
        private_key: process.env.GOOGLE_PRIVATE_KEY || ''
      }
    });

    // Write data to Google Sheets
    const sheetsResult = await sheetsService.appendData(data);

    if (!sheetsResult.success) {
      console.error('Google Sheets error:', sheetsResult.error);
      return NextResponse.json({
        success: false,
        message: 'Failed to write to Google Sheets',
        error: sheetsResult.error,
        data: data
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Data received and stored successfully',
      data: data,
      sheetsResponse: sheetsResult.data
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
