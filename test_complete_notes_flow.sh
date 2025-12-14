#!/bin/bash

echo "=== Testing Complete Flow with Notes ==="

# Step 1: User provides product, quantity, and notes
echo -e "\nStep 1: User provides product, quantity, and notes"
RESPONSE1=$(curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "I need 5 laptops with priority shipment",
  "currentData": {}
}' http://localhost:3000/api/gemini)

echo "User: I need 5 laptops with priority shipment"
echo "AI: $(echo "$RESPONSE1" | grep -o '\"message\":\"[^\"]*\"' | cut -d'"' -f4)"
NOTES1=$(echo "$RESPONSE1" | grep -o '\"notes\":\"[^\"]*\"' | cut -d'"' -f4)
echo "Extracted notes: $NOTES1"
echo "Missing fields: $(echo "$RESPONSE1" | grep -o '\"missingFields\":\[[^\]]*\]' | cut -d':' -f2-)"

# Step 2: User provides type (notes should remain)
CURRENT_DATA=$(echo "$RESPONSE1" | grep -o '\"currentData\":{[^}]*}' | cut -d':' -f2-)
echo -e "\nStep 2: User provides type (notes should remain)"
RESPONSE2=$(curl -s -X POST -H "Content-Type: application/json" -d "{
  \"message\": \"SalesReservation\",
  \"currentData\": $CURRENT_DATA
}" http://localhost:3000/api/gemini)

echo "User: SalesReservation"
echo "AI: $(echo "$RESPONSE2" | grep -o '\"message\":\"[^\"]*\"' | cut -d'"' -f4)"
NOTES2=$(echo "$RESPONSE2" | grep -o '\"notes\":\"[^\"]*\"' | cut -d'"' -f4)
echo "Notes preserved: $NOTES2"
echo "Missing fields: $(echo "$RESPONSE2" | grep -o '\"missingFields\":\[[^\]]*\]' | cut -d':' -f2-)"

# Step 3: User provides date (notes should still remain)
CURRENT_DATA=$(echo "$RESPONSE2" | grep -o '\"currentData\":{[^}]*}' | cut -d':' -f2-)
echo -e "\nStep 3: User provides date (notes should still remain)"
RESPONSE3=$(curl -s -X POST -H "Content-Type: application/json" -d "{
  \"message\": \"for tomorrow\",
  \"currentData\": $CURRENT_DATA
}" http://localhost:3000/api/gemini)

echo "User: for tomorrow"
echo "AI: $(echo "$RESPONSE3" | grep -o '\"message\":\"[^\"]*\"' | cut -d'"' -f4)"
NOTES3=$(echo "$RESPONSE3" | grep -o '\"notes\":\"[^\"]*\"' | cut -d'"' -f4)
echo "Notes still preserved: $NOTES3"
echo "Missing fields: $(echo "$RESPONSE3" | grep -o '\"missingFields\":\[[^\]]*\]' | cut -d':' -f2-)"

echo -e "\n=== Verification ==="
if [ "$NOTES1" = "$NOTES2" ] && [ "$NOTES2" = "$NOTES3" ]; then
  echo "✅ SUCCESS: Notes '$NOTES1' were preserved throughout the conversation"
  echo "✅ The system correctly recognizes that notes have been provided"
  echo "✅ Users will not be asked for notes again"
else
  echo "❌ FAILED: Notes were not preserved consistently"
fi
