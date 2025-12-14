const { execSync } = require('child_process');
const path = require('path');

// Test the updated register API
console.log('Testing updated register API...');

// Test 1: Missing type field
console.log('\nTest 1: Missing type field');
try {
  const result = execSync('curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d \'{"category": "test", "product": "test", "quantity": 1, "date": "2023-01-01", "notes": "test"}\'', {
    encoding: 'utf-8'
  });
  console.log('Result:', result);
} catch (error) {
  console.log('Expected error:', error.stdout);
}

// Test 2: Invalid type field
console.log('\nTest 2: Invalid type field');
try {
  const result = execSync('curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d \'{"type": "InvalidType", "category": "test", "product": "test", "quantity": 1, "date": "2023-01-01", "notes": "test"}\'', {
    encoding: 'utf-8'
  });
  console.log('Result:', result);
} catch (error) {
  console.log('Expected error:', error.stdout);
}

// Test 3: Valid SalesReservation
console.log('\nTest 3: Valid SalesReservation');
try {
  const result = execSync('curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d \'{"type": "SalesReservation", "category": "test", "product": "test", "quantity": 1, "date": "2023-01-01", "notes": "test"}\'', {
    encoding: 'utf-8'
  });
  console.log('Result:', result);
} catch (error) {
  console.log('Error:', error.stdout);
}

// Test 4: Valid PurchaseOrder
console.log('\nTest 4: Valid PurchaseOrder');
try {
  const result = execSync('curl -X POST http://localhost:3000/api/register -H "Content-Type: application/json" -d \'{"type": "PurchaseOrder", "category": "test", "product": "test", "quantity": 1, "date": "2023-01-01", "notes": "test"}\'', {
    encoding: 'utf-8'
  });
  console.log('Result:', result);
} catch (error) {
  console.log('Error:', error.stdout);
}

console.log('\nTesting complete!');
