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
      const currentData = processingResult.normalizedData;
      const missingFields = processingResult.missingFields;

      // NEW PROMPT LOGIC
      let userPrompt = '';

      if (missingFields.length === 0) {
        userPrompt = "All required information has been collected.";
      } else {
        // Generate ONE concise, natural-language question asking only for missing fields
        if (missingFields.length === 1) {
          const field = missingFields[0];
          if (field === 'type') {
            userPrompt = "What type of reservation is this?";
          } else if (field === 'category') {
            userPrompt = "What category do these items belong to?";
          } else if (field === 'product') {
            userPrompt = "What product are you reserving?";
          } else if (field === 'quantity') {
            userPrompt = "How many items do you need?";
          } else if (field === 'date') {
            userPrompt = "When do you need this reservation?";
          } else if (field === 'notes') {
            userPrompt = "Any additional notes or details?";
          } else {
            userPrompt = `What is the ${field}?`;
          }
        } else {
          // For multiple missing fields, create a combined question
          const fieldQuestions = missingFields.map(field => {
            if (field === 'type') return "reservation type";
            if (field === 'category') return "item category";
            if (field === 'product') return "product name";
            if (field === 'quantity') return "quantity needed";
            if (field === 'date') return "reservation date";
            if (field === 'notes') return "additional notes";
            return field;
          });

          userPrompt = `Please provide the ${fieldQuestions.join(', ')}.`;
        }
      }

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
