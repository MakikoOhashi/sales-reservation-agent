#!/bin/bash

echo "Testing conversation state handling..."

# Test case 1: User provides type and product
echo -e "\n1. User provides type and product:"
RESPONSE1=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "I want to make a sales reservation for a laptop",
  "currentData": {}
}' http://localhost:3001/api/gemini)

echo "Response 1: $RESPONSE1"

# Test case 2: User provides quantity (should not overwrite existing fields)
echo -e "\n2. User provides quantity:"
CURRENT_DATA=$(echo "$RESPONSE1" | jq -r '.currentData // {}')
RESPONSE2=$(curl -s -X POST -H "Content-Type: application/json" -d "{
  \"message\": \"I need 5 laptops\",
  \"currentData\": $CURRENT_DATA
}" http://localhost:3001/api/gemini)

echo "Response 2: $RESPONSE2"

# Test case 3: User provides date (should not overwrite existing fields)
echo -e "\n3. User provides date:"
CURRENT_DATA=$(echo "$RESPONSE2" | jq -r '.currentData // {}')
RESPONSE3=$(curl -s -X POST -H "Content-Type: application/json" -d "{
  \"message\": \"for tomorrow\",
  \"currentData\": $CURRENT_DATA
}" http://localhost:3001/api/gemini)

echo "Response 3: $RESPONSE3"

# Test case 4: User provides notes (should complete all required fields)
echo -e "\n4. User provides notes:"
CURRENT_DATA=$(echo "$RESPONSE3" | jq -r '.currentData // {}')
RESPONSE4=$(curl -s -X POST -H "Content-Type: application/json" -d "{
  \"message\": \"for Acme Inc\",
  \"currentData\": $CURRENT_DATA
}" http://localhost:3001/api/gemini)

echo "Response 4: $RESPONSE4"

# Verification
echo -e "\nVerification:"
TYPE=$(echo "$RESPONSE4" | jq -r '.currentData.type')
PRODUCT=$(echo "$RESPONSE4" | jq -r '.currentData.product')
QUANTITY=$(echo "$RESPONSE4" | jq -r '.currentData.quantity')
MISSING_FIELDS=$(echo "$RESPONSE4" | jq -r '.missingFields | length')

echo "Type should remain SalesReservation: $TYPE"
echo "Product should remain laptop: $PRODUCT"
echo "Quantity should remain 5: $QUANTITY"
echo "Should have no missing fields: $MISSING_FIELDS"
