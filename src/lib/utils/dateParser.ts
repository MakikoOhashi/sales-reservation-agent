/**
 * Date parsing utility for converting natural language dates to ISO 8601 format
 */

import { DateTime } from 'luxon';

/**
 * Parse natural language date to ISO 8601 format
 * @param dateString Natural language date string
 * @returns ISO 8601 formatted date string
 */
export function parseNaturalLanguageDate(dateString: string): string {
  try {
    // Try to parse with Luxon first
    const parsedDate = DateTime.fromFormat(dateString, {
      // Try multiple formats
      formats: [
        'yyyy-MM-dd',           // 2025-12-20
        'MMMM d, yyyy',         // December 20, 2025
        'MMMM dd, yyyy',        // December 20, 2025
        'MMM d, yyyy',          // Dec 20, 2025
        'MMM dd, yyyy',         // Dec 20, 2025
        'MM/dd/yyyy',           // 12/20/2025
        'MM-dd-yyyy',           // 12-20-2025
        'd MMMM yyyy',          // 20 December 2025
        'dd MMMM yyyy',         // 20 December 2025
        'd MMM yyyy',           // 20 Dec 2025
        'dd MMM yyyy',          // 20 Dec 2025
      ],
      setZone: true
    });

    if (parsedDate.isValid) {
      return parsedDate.toISO();
    }

    // Try relative dates (next Friday, tomorrow, etc.)
    const relativeDate = parseRelativeDate(dateString);
    if (relativeDate) {
      return relativeDate.toISO();
    }

    // Try to parse as general date string
    const generalDate = DateTime.fromJSDate(new Date(dateString));
    if (generalDate.isValid) {
      return generalDate.toISO();
    }

    // If all parsing fails, return current date as fallback
    return DateTime.now().toISO();

  } catch (error) {
    console.error('Error parsing date:', error);
    // Return current date as fallback
    return DateTime.now().toISO();
  }
}

/**
 * Parse relative dates like "next Friday", "tomorrow", etc.
 */
function parseRelativeDate(dateString: string): DateTime | null {
  const now = DateTime.now();
  const lowerCase = dateString.toLowerCase().trim();

  // Handle "today"
  if (lowerCase === 'today') {
    return now;
  }

  // Handle "tomorrow"
  if (lowerCase === 'tomorrow') {
    return now.plus({ days: 1 });
  }

  // Handle "yesterday"
  if (lowerCase === 'yesterday') {
    return now.minus({ days: 1 });
  }

  // Handle "next [weekday]"
  const weekdayMatch = lowerCase.match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i);
  if (weekdayMatch) {
    const targetWeekday = weekdayMatch[1].toLowerCase();
    const currentWeekday = now.weekday; // 1=Monday, 7=Sunday

    // Map weekday names to numbers
    const weekdayMap: Record<string, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7
    };

    const targetWeekdayNum = weekdayMap[targetWeekday];
    let daysToAdd = targetWeekdayNum - currentWeekday;

    if (daysToAdd <= 0) {
      daysToAdd += 7; // Move to next week
    }

    return now.plus({ days: daysToAdd });
  }

  // Handle "this [weekday]"
  const thisWeekdayMatch = lowerCase.match(/^this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i);
  if (thisWeekdayMatch) {
    const targetWeekday = thisWeekdayMatch[1].toLowerCase();
    const currentWeekday = now.weekday; // 1=Monday, 7=Sunday

    // Map weekday names to numbers
    const weekdayMap: Record<string, number> = {
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
      sunday: 7
    };

    const targetWeekdayNum = weekdayMap[targetWeekday];
    let daysToAdd = targetWeekdayNum - currentWeekday;

    if (daysToAdd < 0) {
      daysToAdd += 7; // Move to next week
    } else if (daysToAdd === 0) {
      // Same day, keep as is
      return now;
    }

    return now.plus({ days: daysToAdd });
  }

  return null;
}

/**
 * Validate if a string is a valid ISO 8601 date
 */
export function isValidISODate(dateString: string): boolean {
  return DateTime.fromISO(dateString).isValid;
}
