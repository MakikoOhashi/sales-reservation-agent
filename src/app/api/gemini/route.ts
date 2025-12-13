import { NextResponse } from 'next/server';
import { processReservationInput, validateReservationData } from '@/lib/utils/reservationProcessor';

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json({
        success: false,
        message: 'Message is required'
      }, { status: 400 });
    }

    // Process the user input using our reservation processor
    const processingResult = await processReservationInput(message);

    // Check if we have missing fields
    if ('missingFields' in processingResult) {
      return NextResponse.json({
        success: false,
        message: processingResult.message,
        missingFields: processingResult.missingFields
      }, { status: 400 });
    }

    // Validate the processed data
    if (!validateReservationData(processingResult)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid reservation data format'
      }, { status: 400 });
    }

    // Return the structured JSON data ready for Google Sheets
    return NextResponse.json({
      success: true,
      data: processingResult,
      message: 'Reservation data processed successfully'
    });

  } catch (error) {
    console.error('Error processing reservation:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing reservation',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
