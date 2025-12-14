const axios = require('axios');

async function testConversationState() {
  console.log('Testing conversation state handling...');

  // Test case 1: User provides type and product
  console.log('\n1. User provides type and product:');
  const response1 = await axios.post('http://localhost:3000/api/gemini', {
    message: 'I want to make a sales reservation for a laptop',
    currentData: {}
  });

  console.log('Response 1:', response1.data);
  console.log('currentData after message 1:', response1.data.currentData);
  console.log('missingFields after message 1:', response1.data.missingFields);

  // Test case 2: User provides quantity (should not overwrite existing fields)
  console.log('\n2. User provides quantity:');
  const response2 = await axios.post('http://localhost:3000/api/gemini', {
    message: 'I need 5 laptops',
    currentData: response1.data.currentData
  });

  console.log('Response 2:', response2.data);
  console.log('currentData after message 2:', response2.data.currentData);
  console.log('missingFields after message 2:', response2.data.missingFields);

  // Test case 3: User provides date (should not overwrite existing fields)
  console.log('\n3. User provides date:');
  const response3 = await axios.post('http://localhost:3000/api/gemini', {
    message: 'for tomorrow',
    currentData: response2.data.currentData
  });

  console.log('Response 3:', response3.data);
  console.log('currentData after message 3:', response3.data.currentData);
  console.log('missingFields after message 3:', response3.data.missingFields);

  // Test case 4: User provides notes (should complete all required fields)
  console.log('\n4. User provides notes:');
  const response4 = await axios.post('http://localhost:3000/api/gemini', {
    message: 'for Acme Inc',
    currentData: response3.data.currentData
  });

  console.log('Response 4:', response4.data);
  console.log('currentData after message 4:', response4.data.currentData);
  console.log('missingFields after message 4:', response4.data.missingFields);

  // Verify that fields are not overwritten
  console.log('\nVerification:');
  console.log('Type should remain SalesReservation:', response4.data.currentData?.type === 'SalesReservation');
  console.log('Product should remain laptop:', response4.data.currentData?.product === 'laptop');
  console.log('Quantity should remain 5:', response4.data.currentData?.quantity === 5);
  console.log('Should have no missing fields:', response4.data.missingFields?.length === 0);
}

testConversationState().catch(console.error);
