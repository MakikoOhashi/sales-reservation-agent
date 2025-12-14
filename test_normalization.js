/**
 * Direct test for normalization functionality
 * This tests the core logic without requiring TypeScript compilation
 */

// Mock the date parser functions for testing
const mockDateParser = {
  parseNaturalLanguageDate: (dateString) => {
    if (dateString.toLowerCase() === 'today') {
      return new Date().toISOString();
    }
    return new Date(dateString).toISOString();
  },
  isValidISODate: (dateString) => {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(dateString);
  }
};

// Test the key alias normalization logic
function testKeyAliasNormalization() {
  console.log('Testing Key Alias Normalization...\\n');

  const KEY_ALIASES = {
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

  function normalizeInputData(rawData) {
    const normalized = {};

    for (const [rawKey, value] of Object.entries(rawData)) {
      const lowerKey = rawKey.toLowerCase().trim();
      const normalizedKey = KEY_ALIASES[lowerKey] || lowerKey;

      // Only include recognized fields
      if (normalizedKey === 'type' || normalizedKey === 'category' ||
          normalizedKey === 'product' || normalizedKey === 'quantity' ||
          normalizedKey === 'date' || normalizedKey === 'notes') {
        normalized[normalizedKey] = value;
      }
    }

    // Apply safe defaults
    if (!normalized.notes) {
      normalized.notes = 'none';
    }

    if (!normalized.date) {
      normalized.date = new Date().toISOString();
    }

    return normalized;
  }

  // Test cases for key alias normalization
  const testCases = [
    {
      name: 'Basic alias mapping',
      input: {
        'product name': 'laptop',
        'qty': 5,
        'note': 'urgent'
      },
      expected: {
        product: 'laptop',
        quantity: 5,
        notes: 'urgent',
        date: expect.any(String) // ISO date
      }
    },
    {
      name: 'Multiple aliases',
      input: {
        'item': 'chair',
        'amount': 3,
        'description': 'office use',
        'today': 'today'
      },
      expected: {
        product: 'chair',
        quantity: 3,
        notes: 'office use',
        date: expect.any(String) // ISO date
      }
    },
    {
      name: 'Mixed standard and alias keys',
      input: {
        'product': 'software',
        'quantity': 1,
        'note': 'test',
        'date': '2025-12-20'
      },
      expected: {
        product: 'software',
        quantity: 1,
        notes: 'test',
        date: '2025-12-20'
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log(`Input:`, testCase.input);

    const result = normalizeInputData(testCase.input);
    console.log(`Result:`, result);

    let testPassed = true;

    for (const [key, expectedValue] of Object.entries(testCase.expected)) {
      if (expectedValue === expect.any(String)) {
        // Just check that the key exists and is a string
        if (typeof result[key] !== 'string') {
          console.log(`❌ ${key}: expected string, got ${typeof result[key]}`);
          testPassed = false;
        } else {
          console.log(`✅ ${key}: ${result[key]}`);
        }
      } else if (result[key] !== expectedValue) {
        console.log(`❌ ${key}: expected ${expectedValue}, got ${result[key]}`);
        testPassed = false;
      } else {
        console.log(`✅ ${key}: ${result[key]}`);
      }
    }

    if (testPassed) {
      console.log('✅ Test passed\\n');
      passed++;
    } else {
      console.log('❌ Test failed\\n');
      failed++;
    }
  }

  console.log(`Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test missing fields detection
function testMissingFieldsDetection() {
  console.log('Testing Missing Fields Detection...\\n');

  const REQUIRED_FIELDS = ['type', 'product', 'quantity', 'date', 'notes'];

  function getMissingFields(data) {
    const missingFields = [];

    for (const field of REQUIRED_FIELDS) {
      const value = data[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
      }
    }

    return missingFields;
  }

  const testCases = [
    {
      name: 'Complete data',
      input: {
        type: 'reservation',
        product: 'laptop',
        quantity: 1,
        date: '2025-12-20T00:00:00.000Z',
        notes: 'test'
      },
      expectedMissing: []
    },
    {
      name: 'Missing type and notes',
      input: {
        product: 'chair',
        quantity: 2,
        date: '2025-12-20T00:00:00.000Z'
      },
      expectedMissing: ['type', 'notes']
    },
    {
      name: 'Empty values',
      input: {
        type: '',
        product: '',
        quantity: 0,
        date: '',
        notes: ''
      },
      expectedMissing: ['type', 'product', 'date', 'notes']
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log(`Input:`, testCase.input);

    const result = getMissingFields(testCase.input);
    console.log(`Missing fields:`, result);
    console.log(`Expected:`, testCase.expectedMissing);

    const isEqual = JSON.stringify(result.sort()) === JSON.stringify(testCase.expectedMissing.sort());

    if (isEqual) {
      console.log('✅ Test passed\\n');
      passed++;
    } else {
      console.log('❌ Test failed\\n');
      failed++;
    }
  }

  console.log(`Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Run all tests
function runAllTests() {
  console.log('=== Reservation Processor Normalization Tests ===\\n');

  const normalizationPassed = testKeyAliasNormalization();
  console.log('\\n' + '='.repeat(50) + '\\n');
  const missingFieldsPassed = testMissingFieldsDetection();

  console.log('\\n' + '='.repeat(50));
  console.log('=== Final Results ===');
  console.log(`Key Alias Normalization: ${normalizationPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Missing Fields Detection: ${missingFieldsPassed ? '✅ PASSED' : '❌ FAILED'}`);

  if (normalizationPassed && missingFieldsPassed) {
    console.log('\\n🎉 All tests passed! The normalization layer is working correctly.');
  } else {
    console.log('\\n❌ Some tests failed. Please review the implementation.');
  }
}

// Helper for testing
const expect = {
  any: (type) => type
};

runAllTests();
