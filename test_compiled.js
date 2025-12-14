/**
 * Test script for compiled reservation processing
 */

const { processReservationInput, validateReservationData } = require('./.next/server/chunks/src_lib_utils_reservationProcessor.js');

async function runTests() {
  console.log('Running compiled reservation processing tests...\\n');

  // Test cases
  const testCases = [
    {
      name: 'Complete reservation with all fields',
      input: "I want to reserve 10 laptops for Company A on December 20th.",
      expectedFields: {
        type: 'reservation',
        product: 'laptops',
        quantity: 10
      }
    },
    {
      name: 'Reservation with date alias (tomorrow)',
      input: "Book 5 office chairs for tomorrow",
      expectedFields: {
        type: 'reservation',
        product: 'chairs',
        quantity: 5
      }
    },
    {
      name: 'Test missing fields detection',
      input: "I need some products",
      shouldHaveMissingFields: true
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: ${testCase.name}`);
    console.log(`Input: "${testCase.input}"`);

    try {
      const result = await processReservationInput(testCase.input);

      if ('missingFields' in result) {
        if (testCase.shouldHaveMissingFields) {
          console.log('✅ Correctly identified missing fields:', result.missingFields);
          console.log('📝 Normalized data:', JSON.stringify(result.normalizedData, null, 2));
        } else {
          console.log('❌ Unexpected missing fields:', result.missingFields);
          console.log('📝 Normalized data:', JSON.stringify(result.normalizedData, null, 2));
        }
      } else {
        if (testCase.shouldHaveMissingFields) {
          console.log('❌ Should have identified missing fields');
        } else {
          console.log('✅ Success! Processed data:');
          console.log(JSON.stringify(result, null, 2));

          // Validate the result
          const isValid = validateReservationData(result);
          console.log('🔍 Validation:', isValid ? '✅ Valid' : '❌ Invalid');

          // Check if date is in ISO format
          const isISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(result.date);
          console.log('📅 Date format:', isISODate ? '✅ ISO 8601' : '❌ Not ISO 8601');

          // Check expected fields
          for (const [field, expectedValue] of Object.entries(testCase.expectedFields || {})) {
            if (result[field] === expectedValue) {
              console.log(`✅ ${field}: ${result[field]}`);
            } else {
              console.log(`❌ ${field}: expected ${expectedValue}, got ${result[field]}`);
            }
          }
        }
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    console.log('---');
  }
}

runTests().catch(console.error);
