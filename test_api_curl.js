/**
 * Test script for API endpoint using curl
 */

const { execSync } = require('child_process');

function testAPIEndpoint() {
  console.log('Testing API endpoint with normalization using curl...\\n');

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
      shouldSucceed: false
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
      // Use curl to make the API request
      const curlCommand = `curl -s -X POST -H "Content-Type: application/json" -d '${JSON.stringify(testCase.input)}' ${baseUrl}`;
      const response = execSync(curlCommand).toString();
      const data = JSON.parse(response);

      console.log(`Response:`, JSON.stringify(data, null, 2));

      if (testCase.shouldSucceed) {
        if (data.success) {
          console.log('✅ Test passed - request processed successfully');
          console.log(`Processed data includes: ${Object.keys(data.data || {}).join(', ')}`);
        } else {
          console.log('❌ Test failed - expected success but got failure');
          if (data.missingFields) {
            console.log(`Missing fields: ${data.missingFields.join(', ')}`);
          }
        }
      } else {
        if (!data.success && data.missingFields) {
          console.log('✅ Test passed - correctly identified missing fields:', data.missingFields);
        } else {
          console.log('❌ Test failed - expected missing fields but got success or no missing fields');
        }
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
      if (error.stdout) {
        console.log('STDOUT:', error.stdout.toString());
      }
    }

    console.log('---');
  }
}

testAPIEndpoint();
