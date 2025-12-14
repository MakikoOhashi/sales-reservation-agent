#!/bin/bash

echo "=== Testing Notes Extraction ==="

# Test 1: Priority shipment
echo -e "\nTest 1: 'priority shipment' extraction"
RESPONSE1=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "I need 5 laptops with priority shipment",
  "currentData": {}
}' http://localhost:3000/api/gemini)

echo "Input: I need 5 laptops with priority shipment"
echo "Extracted notes: $(echo "$RESPONSE1" | grep -o '\"notes\":\"[^\"]*\"' | cut -d'"' -f4)"
echo "Full response: $RESPONSE1"

# Test 2: Urgent delivery
echo -e "\nTest 2: 'urgent delivery' extraction"
RESPONSE2=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "10 monitors for urgent delivery tomorrow",
  "currentData": {}
}' http://localhost:3000/api/gemini)

echo "Input: 10 monitors for urgent delivery tomorrow"
echo "Extracted notes: $(echo "$RESPONSE2" | grep -o '\"notes\":\"[^\"]*\"' | cut -d'"' -f4)"
echo "Full response: $RESPONSE2"

# Test 3: Express shipping
echo -e "\nTest 3: 'express shipping' extraction"
RESPONSE3=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "Please reserve 3 chairs with express shipping",
  "currentData": {}
}' http://localhost:3000/api/gemini)

echo "Input: Please reserve 3 chairs with express shipping"
echo "Extracted notes: $(echo "$RESPONSE3" | grep -o '\"notes\":\"[^\"]*\"' | cut -d'"' -f4)"
echo "Full response: $RESPONSE3"

# Test 4: Special requirements
echo -e "\nTest 4: 'special requirements' extraction"
RESPONSE4=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "20 licenses have special requirements for installation",
  "currentData": {}
}' http://localhost:3000/api/gemini)

echo "Input: 20 licenses have special requirements for installation"
echo "Extracted notes: $(echo "$RESPONSE4" | grep -o '\"notes\":\"[^\"]*\"' | cut -d'"' -f4)"
echo "Full response: $RESPONSE4"

echo -e "\n=== Test Summary ==="
echo "✅ Notes extraction should now handle 'priority shipment' and similar patterns"
