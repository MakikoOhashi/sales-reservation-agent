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

    // Process the user input using our reservation processor with normalization
    const processingResult = await processReservationInput(message);

    // Check if we have missing fields
    if ('missingFields' in processingResult) {
      // Generate a precise message for the LLM about which fields are missing
      const missingFieldsList = processingResult.missingFields.join(', ');
      const userPrompt = `Please provide the following missing information: ${missingFieldsList}. ` +
                       `Do not ask for fields already provided. Current data: ${JSON.stringify(processingResult.normalizedData)}`;

      return NextResponse.json({
        success: false,
        message: userPrompt,
        missingFields: processingResult.missingFields,
        normalizedData: processingResult.normalizedData,
        instruction: 'Ask only for the missing fields listed above. Do not ask for fields already present.'
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
