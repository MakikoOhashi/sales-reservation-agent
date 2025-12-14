const axios = require('axios');

async function testExactUserScenario() {
  console.log('=== Testing Exact User Scenario ===\n');

  // Simulate the exact conversation that was going in circles
  let currentData = {};

  console.log('AI: Hello! How can I help you today?');
  console.log('User: I need help with a sales reservation.\n');

  // User provides complete reservation info
  console.log('User: I want to reserve 10 laptops for Company A on December 20th.');
  const response1 = await axios.post('http://localhost:3000/api/gemini', {
    message: 'I want to reserve 10 laptops for Company A on December 20th.',
    currentData: currentData
  });

  console.log('AI:', response1.data.message);
  currentData = response1.data.currentData || currentData;
  console.log('Current state:', currentData);
  console.log('Missing fields:', response1.data.missingFields);

  // User provides type
  console.log('\nUser: SalesReservation');
  const response2 = await axios.post('http://localhost:3000/api/gemini', {
    message: 'SalesReservation',
    currentData: currentData
  });

  console.log('AI:', response2.data.message);
  currentData = response2.data.currentData || currentData;
  console.log('Current state:', currentData);
  console.log('Missing fields:', response2.data.missingFields);

  // User provides the same info again (should not be requested again)
  console.log('\nUser: 10 laptops for Company A on December 20th.');
  const response3 = await axios.post('http://localhost:3000/api/gemini', {
    message: '10 laptops for Company A on December 20th.',
    currentData: currentData
  });

  console.log('AI:', response3.data.message);
  currentData = response3.data.currentData || currentData;
  console.log('Current state:', currentData);
  console.log('Missing fields:', response3.data.missingFields);

  // Verify the fix
  console.log('\n=== Verification ===');
  console.log('✅ Type should be SalesReservation and never asked again:', currentData.type === 'SalesReservation');
  console.log('✅ Product should be laptops and never asked again:', currentData.product === 'laptops');
  console.log('✅ Quantity should be 10 and never asked again:', currentData.quantity === 10);
  console.log('✅ Notes should contain Company A and never asked again:', currentData.notes && currentData.notes.includes('Company A'));
  console.log('✅ Date should be set and never asked again:', currentData.date);

  if (response3.data.missingFields && response3.data.missingFields.length === 0) {
    console.log('🎉 SUCCESS: No more circular conversation! All fields collected and never asked again.');
  } else {
    console.log('❌ FAILED: Still missing fields:', response3.data.missingFields);
  }
}

testExactUserScenario().catch(console.error);
