/**
 * Reservation processor for converting user input to structured JSON
 * with normalization layer and key alias handling
 */

import { parseNaturalLanguageDate, isValidISODate } from './dateParser';
import { DateTime } from 'luxon';

// Define the normalized reservation data structure
interface NormalizedReservationData {
  type?: string;
  category?: string;
  product?: string;
  quantity?: number;
  date?: string;
  notes?: string;
}

// Define key aliases mapping
const KEY_ALIASES: Record<string, keyof NormalizedReservationData> = {
  // Type aliases
  'reservation type': 'type',
  'order type': 'type',
  'transaction type': 'type',

  // Category aliases
  'item category': 'category',
  'product category': 'category',
  'reservation category': 'category',

  // Product aliases
  'product name': 'product',
  'item': 'product',
  'item name': 'product',
  'product type': 'product',

  // Quantity aliases
  'qty': 'quantity',
  'amount': 'quantity',
  'number': 'quantity',
  'count': 'quantity',
  'how many': 'quantity',

  // Date aliases
  'reservation date': 'date',
  'order date': 'date',
  'delivery date': 'date',
  'when': 'date',

  // Notes aliases
  'note': 'notes',
  'comment': 'notes',
  'comments': 'notes',
  'description': 'notes',
  'details': 'notes',
  'additional info': 'notes',
  'additional information': 'notes',

  // Special date values
  'today': 'date',
  'tomorrow': 'date',
  'yesterday': 'date'
};

// Required fields for validation
const REQUIRED_FIELDS: (keyof NormalizedReservationData)[] = ['type', 'product', 'quantity', 'date', 'notes'];

/**
 * Normalize raw input data into standardized structure with key alias handling
 */
function normalizeInputData(rawData: Record<string, any>): NormalizedReservationData {
  const normalized: NormalizedReservationData = {};

  // Handle key aliases and normalize to standard keys
  for (const [rawKey, value] of Object.entries(rawData)) {
    const lowerKey = rawKey.toLowerCase().trim();
    const normalizedKey = KEY_ALIASES[lowerKey] || (lowerKey as keyof NormalizedReservationData);

    // Only include recognized fields
    if (normalizedKey in normalized || normalizedKey === 'type' || normalizedKey === 'category' ||
        normalizedKey === 'product' || normalizedKey === 'quantity' || normalizedKey === 'date' || normalizedKey === 'notes') {
      normalized[normalizedKey] = value;
    }
  }

  // Apply safe defaults
  if (!normalized.notes) {
    normalized.notes = 'none';
  }

  if (!normalized.date) {
    normalized.date = DateTime.now().toISO();
  }

  return normalized;
}

/**
 * Check for missing required fields in normalized data
 */
function getMissingFields(data: NormalizedReservationData): string[] {
  const missingFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  return missingFields;
}

/**
 * Process date field to ensure ISO 8601 format
 */
async function processDateField(data: NormalizedReservationData): Promise<NormalizedReservationData> {
  if (!data.date) {
    data.date = DateTime.now().toISO();
  }

  // Handle special date values
  const lowerDate = String(data.date).toLowerCase().trim();
  if (lowerDate === 'today') {
    data.date = DateTime.now().toISO();
  } else if (lowerDate === 'tomorrow') {
    data.date = DateTime.now().plus({ days: 1 }).toISO();
  } else if (lowerDate === 'yesterday') {
    data.date = DateTime.now().minus({ days: 1 }).toISO();
  }
  // If date is already in ISO format, keep it as is
  else if (isValidISODate(data.date)) {
    // Date is already valid
  }
  // Convert natural language date to ISO format
  else {
    data.date = parseNaturalLanguageDate(data.date);
  }

  return data;
}

/**
 * Validate the final normalized data structure
 */
function validateNormalizedData(data: NormalizedReservationData): boolean {
  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      return false;
    }
  }

  return (
    (data.type === undefined || typeof data.type === 'string') &&
    (data.category === undefined || typeof data.category === 'string') &&
    typeof data.product === 'string' &&
    typeof data.quantity === 'number' &&
    typeof data.date === 'string' &&
    isValidISODate(data.date) &&
    typeof data.notes === 'string'
  );
}

/**
 * Extract fields from user input using regex patterns
 * Returns raw data that will be normalized
 */
function extractFieldsFromInput(userInput: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lowerInput = userInput.toLowerCase();

  // Extract type (reservation, order, booking, etc.)
  const typePatterns = [
    { pattern: /(reserve|reservation|order|booking|purchase|buy|need|want)/i, type: 'reservation' },
    { pattern: /(return|cancel|cancellation)/i, type: 'return' },
    { pattern: /(exchange|swap)/i, type: 'exchange' },
    { pattern: /(inquiry|question|ask)/i, type: 'inquiry' }
  ];

  for (const { pattern, type } of typePatterns) {
    if (pattern.test(userInput)) {
      result.type = type;
      break;
    }
  }

  // Extract quantity (numbers)
  const quantityMatch = userInput.match(/(\d+)/);
  if (quantityMatch) {
    result.quantity = parseInt(quantityMatch[1], 10);
  }

  // Extract product (nouns after quantity or action verbs)
  const productMatch = userInput.match(/(?:reserve|order|book|need|want)\s+(\d+)\s+([a-z]+)/i);
  if (productMatch && productMatch[2]) {
    result.product = productMatch[2].toLowerCase();
  } else {
    // Alternative pattern: look for nouns after numbers
    const altProductMatch = userInput.match(/(\d+)\s+([a-z]+)/i);
    if (altProductMatch && altProductMatch[2]) {
      result.product = altProductMatch[2].toLowerCase();
    }
    // Look for common product keywords
    else {
      const productKeywords = ['laptop', 'chair', 'license', 'desk', 'monitor', 'software', 'hardware'];
      for (const keyword of productKeywords) {
        if (lowerInput.includes(keyword)) {
          result.product = keyword;
          break;
        }
      }
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

  // Extract date (various date formats)
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

  return result;
}

/**
 * Process user input and convert to structured JSON for Google Sheets
 */
export async function processReservationInput(userInput: string): Promise<NormalizedReservationData | { missingFields: string[], normalizedData: NormalizedReservationData }> {
  try {
    // Extract fields from user input
    const extractedData = extractFieldsFromInput(userInput);

    // Normalize the extracted data with key alias handling
    const normalizedData = normalizeInputData(extractedData);

    // Check for missing fields using strict code validation
    const missingFields = getMissingFields(normalizedData);

    if (missingFields.length > 0) {
      return {
        missingFields,
        normalizedData
      };
    }

    // Process date field to ensure ISO 8601 format
    const processedData = await processDateField(normalizedData);

    return processedData;

  } catch (error) {
    console.error('Error processing reservation input:', error);
    throw new Error('Failed to process reservation input');
  }
}

/**
 * Validate the final JSON structure
 */
export function validateReservationData(data: NormalizedReservationData): boolean {
  return validateNormalizedData(data);
}
