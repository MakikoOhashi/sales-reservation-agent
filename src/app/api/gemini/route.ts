import { NextResponse } from 'next/server';
import { validateReservationData } from '@/lib/utils/reservationProcessor';

// Define the normalized reservation data structure
interface NormalizedReservationData {
  type?: string;
  category?: string;
  product?: string;
  quantity?: number;
  date?: string;
  notes?: string;
}

// Valid fields that can be extracted from user messages
const VALID_FIELDS = ['type', 'category', 'product', 'quantity', 'date', 'notes'];

// Required fields for a complete reservation
const REQUIRED_FIELDS = ['type', 'product', 'quantity', 'date', 'notes'];

export async function POST(request: Request) {
  try {
    const { message, history = [], currentData = {} } = await request.json();

    if (!message) {
      return NextResponse.json({
        success: false,
        message: 'Message is required'
      }, { status: 400 });
    }

    // Initialize currentData if not provided
    let conversationState: NormalizedReservationData = currentData;

    // Extract ONLY the fields explicitly present in the user's latest message
    const extractedFields = extractFieldsFromMessage(message);

    // Merge extracted fields into currentData using non-overwrite rule
    conversationState = mergeFields(conversationState, extractedFields);

    // Log currentData after merge
    console.log('currentData after merge:', JSON.stringify(conversationState, null, 2));

    // Compute missingFields on the server side
    const missingFields = computeMissingFields(conversationState);

    // Log missingFields after computation
    console.log('missingFields after computation:', missingFields);

    // If we have missing fields, return them to the client
    if (missingFields.length > 0) {
      // Generate a precise message for the LLM about which fields are missing
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
        missingFields: missingFields,
        normalizedData: conversationState,
        currentData: conversationState,
        instruction: 'Ask only for the missing fields listed above. Do not ask for fields already present.'
      }, { status: 400 });
    }

    // Validate the processed data
    if (!validateReservationData(conversationState)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid reservation data format'
      }, { status: 400 });
    }

    // Return the structured JSON data ready for Google Sheets
    return NextResponse.json({
      success: true,
      data: conversationState,
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

/**
 * Extract ONLY the fields explicitly present in the user's latest message
 */
function extractFieldsFromMessage(message: string): Partial<NormalizedReservationData> {
  const result: Partial<NormalizedReservationData> = {};
  const lowerMessage = message.toLowerCase();

  // Extract type (SalesReservation | PurchaseOrder)
  if (lowerMessage.includes('sales reservation') || lowerMessage.includes('sales')) {
    result.type = 'SalesReservation';
  } else if (lowerMessage.includes('purchase order') || lowerMessage.includes('purchase')) {
    result.type = 'PurchaseOrder';
  }

  // Extract category
  const categoryKeywords = ['electronics', 'office', 'furniture', 'software', 'hardware', 'services'];
  for (const keyword of categoryKeywords) {
    if (lowerMessage.includes(keyword)) {
      result.category = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      break;
    }
  }

  // Extract product
  const productKeywords = ['laptop', 'chair', 'license', 'desk', 'monitor', 'software', 'hardware'];
  for (const keyword of productKeywords) {
    if (lowerMessage.includes(keyword)) {
      result.product = keyword;
      break;
    }
  }

  // Extract quantity (numbers)
  const quantityMatch = message.match(/(\d+)/);
  if (quantityMatch) {
    result.quantity = parseInt(quantityMatch[1], 10);
  }

  // Extract date
  const datePatterns = [
    /(?:on|for)\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)/i,
    /(?:on|for)\s+(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(?:on|for)\s+(\d{4}-\d{2}-\d{2})/,
    /(?:on|for)\s+(next\s+\w+|tomorrow|today|yesterday)/i,
    /(?:on|for)\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i,
    /(december|january|february|march|april|may|june|july|august|september|october|november)\s+\d{1,2}(?:st|nd|rd|th)?/i,
    /(next\s+\w+|tomorrow|today|yesterday)/i,
    /([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)/i,
    /([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?)/i
  ];

  for (const pattern of datePatterns) {
    const dateMatch = message.match(pattern);
    if (dateMatch && dateMatch[1]) {
      result.date = dateMatch[1];
      break;
    }
  }

  // Extract notes (everything after "for" but before date)
  const forMatch = message.match(/for\s+([^.]+?)(?:\s+on\s+|\s+for\s+|$)/i);
  if (forMatch) {
    result.notes = forMatch[1].trim();
  } else {
    // Extract company/client names or additional context
    const companyMatch = message.match(/for\s+([a-z]+\s*(?:inc|llc|corp|company|co)\.?)/i);
    if (companyMatch) {
      result.notes = companyMatch[1].trim();
    }
  }

  return result;
}

/**
 * Merge extracted fields into currentData using non-overwrite rule
 */
function mergeFields(currentData: NormalizedReservationData, extractedFields: Partial<NormalizedReservationData>): NormalizedReservationData {
  const mergedData = { ...currentData };

  // Only merge fields that are not already present in currentData
  for (const field of VALID_FIELDS) {
    const fieldKey = field as keyof NormalizedReservationData;
    if (extractedFields[fieldKey] !== undefined &&
        currentData[fieldKey] === undefined) {
      mergedData[fieldKey] = extractedFields[fieldKey] as any;
    }
  }

  return mergedData;
}

/**
 * Compute missingFields by checking required fields against currentData
 */
function computeMissingFields(data: NormalizedReservationData): string[] {
  const missingFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const fieldKey = field as keyof NormalizedReservationData;
    const value = data[fieldKey];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  return missingFields;
}
