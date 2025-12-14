/**
 * Test script for API endpoint with normalization
 */

const axios = require('axios');

async function testAPIEndpoint() {
  console.log('Testing API endpoint with normalization...\\n');

  const baseUrl = 'http://localhost:3000/api/gemini';

  const testCases = [
    {
      name: 'Complete reservation request',
      input: {
        message: "I want to reserve 10 laptops for Company A on December 20th."
      },
      shouldSucceed: true
    },
    {
      name: 'Request with missing fields',
      input: {
        message: "I need some products"
      },
      shouldSucceed: false,
      expectedMissingFields: ['type', 'product', 'quantity', 'date', 'notes']
    },
    {
      name: 'Request with key aliases (note -> notes)',
      input: {
        message: "Reserve 5 chairs with note: urgent order for tomorrow"
      },
      shouldSucceed: true
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: ${testCase.name}`);
    console.log(`Input:`, testCase.input);

    try {
      const response = await axios.post(baseUrl, testCase.input);
      const data = response.data;

      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(data, null, 2));

      if (testCase.shouldSucceed) {
        if (data.success) {
          console.log('✅ Test passed - request processed successfully');
        } else {
          console.log('❌ Test failed - expected success but got failure');
        }
      } else {
        if (!data.success && data.missingFields) {
          console.log('✅ Test passed - correctly identified missing fields:', data.missingFields);

          // Check if expected missing fields match
          if (testCase.expectedMissingFields) {
            const missingFieldsMatch = JSON.stringify(data.missingFields.sort()) ===
                                     JSON.stringify(testCase.expectedMissingFields.sort());
            console.log(`Missing fields match expected: ${missingFieldsMatch ? '✅' : '❌'}`);
          }
        } else {
          console.log('❌ Test failed - expected missing fields but got success or no missing fields');
        }
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    console.log('---');
  }
}

testAPIEndpoint().catch(console.error);
