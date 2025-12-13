/**
 * Reservation processor for converting user input to structured JSON
 */

import { parseNaturalLanguageDate, isValidISODate } from './dateParser';

interface ReservationData {
  category: string;
  product: string;
  quantity: number;
  date: string;
  notes: string;
}

interface MissingFields {
  missingFields: string[];
  message: string;
}

/**
 * Process user input and convert to structured JSON for Google Sheets
 */
export async function processReservationInput(userInput: string): Promise<ReservationData | MissingFields> {
  try {
    // Extract fields from user input
    const extractedData = extractFieldsFromInput(userInput);

    // Check for missing fields
    const missingFields = checkMissingFields(extractedData);

    if (missingFields.missingFields.length > 0) {
      return {
        missingFields: missingFields.missingFields,
        message: missingFields.message
      };
    }

    // Convert date to ISO 8601 format if needed
    const processedData = await processDateField(extractedData);

    return processedData;

  } catch (error) {
    console.error('Error processing reservation input:', error);
    throw new Error('Failed to process reservation input');
  }
}

/**
 * Extract fields from user input using regex patterns
 */
function extractFieldsFromInput(userInput: string): Partial<ReservationData> {
  const result: Partial<ReservationData> = {};
  const lowerInput = userInput.toLowerCase();

  // Extract quantity (numbers followed by any product-related words)
  const quantityMatch = userInput.match(/(\d+)\s*(?:laptops?|units?|items?|products?|pieces?|pcs?|reservations?|orders?|chairs?|licenses?|desks?|monitors?|[a-z]+)/i);
  if (quantityMatch) {
    result.quantity = parseInt(quantityMatch[1], 10);
  }

  // Extract product (nouns after quantity)
  const productMatch = userInput.match(/(?:reserve|order|book|need|want)\s+(\d+)\s+([a-z]+)/i);
  if (productMatch && productMatch[2]) {
    result.product = productMatch[2].toLowerCase();
  } else {
    // Alternative pattern: look for nouns after numbers
    const altProductMatch = userInput.match(/(\d+)\s+([a-z]+)/i);
    if (altProductMatch && altProductMatch[2]) {
      result.product = altProductMatch[2].toLowerCase();
    }
  }

  // Extract category (common categories)
  const categoryKeywords = [
    { keyword: 'electronics', categories: ['Electronics', 'Tech'] },
    { keyword: 'office', categories: ['Office', 'Supplies'] },
    { keyword: 'furniture', categories: ['Furniture'] },
    { keyword: 'software', categories: ['Software', 'Tech'] },
    { keyword: 'hardware', categories: ['Hardware', 'Tech'] },
    { keyword: 'services', categories: ['Services'] },
    { keyword: 'laptops', categories: ['Electronics'] },
    { keyword: 'chairs', categories: ['Furniture'] },
    { keyword: 'licenses', categories: ['Software'] }
  ];

  for (const { keyword, categories } of categoryKeywords) {
    if (lowerInput.includes(keyword)) {
      result.category = categories[0];
      break;
    }
  }

  // Extract date (various date formats) - more comprehensive patterns
  const datePatterns = [
    /(?:on|for)\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)/i,
    /(?:on|for)\s+(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(?:on|for)\s+(\d{4}-\d{2}-\d{2})/,
    /(?:on|for)\s+(next\s+\w+|tomorrow|today|yesterday)/i,
    /(?:on|for)\s+(\w+\s+\d{1,2}(?:st|nd|rd|th)?)/i,
    /(december|january|february|march|april|may|june|july|august|september|october|november)\s+\d{1,2}(?:st|nd|rd|th)?/i,
    /(next\s+\w+|tomorrow|today|yesterday)/i,
    /([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)/i,
    /([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?)/i,
    /(?:on|for)\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)\w*)/i,
    /([a-z]+\s+\d{1,2}(?:st|nd|rd|th)\w*)/i,
    /(?:on|for)\s+([a-z]+\s+\d{1,2}(?:st|nd|rd|th)[,.]?\s*.*)/i,
    /([a-z]+\s+\d{1,2}(?:st|nd|rd|th)[,.]?\s*.*)/i,
    /(?:on|for)\s+(December\s+\d{1,2}(?:st|nd|rd|th)?)/i,
    /(December\s+\d{1,2}(?:st|nd|rd|th)?)/i
  ];

  for (const pattern of datePatterns) {
    const dateMatch = userInput.match(pattern);
    if (dateMatch && dateMatch[1]) {
      result.date = dateMatch[1];
      break;
    }
  }

  // Extract notes (everything after "for" but before date)
  const forMatch = userInput.match(/for\s+([^.]+?)(?:\s+on\s+|\s+for\s+|$)/i);
  if (forMatch) {
    result.notes = forMatch[1].trim();
  } else {
    // Extract company/client names or additional context
    const companyMatch = userInput.match(/for\s+([a-z]+\s*(?:inc|llc|corp|company|co)\.?)/i);
    if (companyMatch) {
      result.notes = companyMatch[1].trim();
    } else {
      // Use remaining text after product but before date as notes
      const parts = userInput.split(/on\s+|for\s+/i);
      if (parts.length > 1) {
        // Remove date information from notes
        const notesPart = parts[parts.length - 1].replace(/([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?)/i, '').trim();
        result.notes = notesPart || parts[parts.length - 1].trim();
      }
    }
  }

  // Default category if not found
  if (!result.category) {
    result.category = 'General';
  }

  return result;
}

/**
 * Check for missing required fields
 */
function checkMissingFields(data: Partial<ReservationData>): MissingFields {
  const requiredFields: (keyof ReservationData)[] = ['category', 'product', 'quantity', 'date', 'notes'];
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
    }
  }

  let message = 'Please provide the following missing information: ';
  if (missingFields.includes('category')) message += 'category, ';
  if (missingFields.includes('product')) message += 'product name, ';
  if (missingFields.includes('quantity')) message += 'quantity, ';
  if (missingFields.includes('date')) message += 'date, ';
  if (missingFields.includes('notes')) message += 'notes, ';

  // Remove trailing comma and space
  message = message.replace(/,\s*$/, '.');

  return {
    missingFields,
    message
  };
}

/**
 * Process date field to ensure ISO 8601 format
 */
async function processDateField(data: Partial<ReservationData>): Promise<ReservationData> {
  if (!data.date) {
    throw new Error('Date field is missing');
  }

  // If date is already in ISO format, use it as is
  if (isValidISODate(data.date)) {
    return {
      category: data.category || 'General',
      product: data.product || '',
      quantity: data.quantity || 1,
      date: data.date,
      notes: data.notes || ''
    };
  }

  // Convert natural language date to ISO format
  const isoDate = parseNaturalLanguageDate(data.date);

  return {
    category: data.category || 'General',
    product: data.product || '',
    quantity: data.quantity || 1,
    date: isoDate,
    notes: data.notes || ''
  };
}

/**
 * Validate the final JSON structure
 */
export function validateReservationData(data: ReservationData): boolean {
  const requiredFields: (keyof ReservationData)[] = ['category', 'product', 'quantity', 'date', 'notes'];

  for (const field of requiredFields) {
    if (!data[field]) {
      return false;
    }
  }

  return (
    typeof data.category === 'string' &&
    typeof data.product === 'string' &&
    typeof data.quantity === 'number' &&
    typeof data.date === 'string' &&
    isValidISODate(data.date) &&
    typeof data.notes === 'string'
  );
}
