import { NextResponse } from 'next/server';
import { GoogleSheetsService } from '@/lib/utils/googleSheets';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    // Default type to "SalesReservation" if not provided
    if (!('type' in data)) {
      data.type = 'SalesReservation';
    }

    // Validate required fields
    const requiredFields = ['type', 'category', 'product', 'quantity', 'date', 'notes'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return NextResponse.json({
          success: false,
          message: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    // Validate type field
    const validTypes = ['SalesReservation', 'PurchaseOrder'];
    if (!validTypes.includes(data.type)) {
      return NextResponse.json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      }, { status: 400 });
    }

    // Load credentials from file
    const credentialsPath = resolve(process.cwd(), 'credentials.json');
    const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));

    // Initialize Google Sheets service with specific config
    const sheetsService = new GoogleSheetsService({
      spreadsheetId: '10mvc3GHoMSfJM0ch9ASSlCfowJClyfh4ZZh6k5vYG7A',
      sheetName: 'RawData',
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key
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
