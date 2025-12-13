/**
 * Test script for reservation processing
 */

const { processReservationInput, validateReservationData } = require('./src/lib/utils/reservationProcessor');

async function runTests() {
  console.log('Running reservation processing tests...\\n');

  // Test cases
  const testCases = [
    {
      input: "I want to reserve 10 laptops for Company A on December 20th.",
      expected: {
        category: "Electronics",
        product: "laptops",
        quantity: 10,
        notes: "for Company A"
      }
    },
    {
      input: "Book 5 office chairs for next Friday",
      expected: {
        category: "Furniture",
        product: "chairs",
        quantity: 5,
        notes: "for next Friday"
      }
    },
    {
      input: "Need 3 software licenses tomorrow",
      expected: {
        product: "licenses",
        quantity: 3,
        notes: "tomorrow"
      }
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: "${testCase.input}"`);

    try {
      const result = await processReservationInput(testCase.input);

      if ('missingFields' in result) {
        console.log('❌ Missing fields:', result.missingFields);
        console.log('📝 Message:', result.message);
      } else {
        console.log('✅ Success! Processed data:');
        console.log(JSON.stringify(result, null, 2));

        // Validate the result
        const isValid = validateReservationData(result);
        console.log('🔍 Validation:', isValid ? '✅ Valid' : '❌ Invalid');

        // Check if date is in ISO format
        const isISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(result.date);
        console.log('📅 Date format:', isISODate ? '✅ ISO 8601' : '❌ Not ISO 8601');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }

    console.log('---');
  }

  // Test missing fields
  console.log('Testing missing fields...');
  const incompleteInput = "I need some products";
  const incompleteResult = await processReservationInput(incompleteInput);

  if ('missingFields' in incompleteResult) {
    console.log('✅ Correctly identified missing fields:', incompleteResult.missingFields);
    console.log('📝 User prompt:', incompleteResult.message);
  } else {
    console.log('❌ Should have identified missing fields');
  }
}

runTests().catch(console.error);
