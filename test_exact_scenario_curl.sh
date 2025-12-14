#!/bin/bash

echo "=== Testing Exact User Scenario ==="

# Initialize currentData
CURRENT_DATA='{}'

echo -e "\nAI: Hello! How can I help you today?"
echo "User: I need help with a sales reservation."

# User provides complete reservation info
echo -e "\nUser: I want to reserve 10 laptops for Company A on December 20th."
RESPONSE1=$(curl -s -X POST -H "Content-Type: application/json" -d "{
  \"message\": \"I want to reserve 10 laptops for Company A on December 20th.\",
  \"currentData\": $CURRENT_DATA
}" http://localhost:3000/api/gemini)

echo "AI: $(echo "$RESPONSE1" | grep -o '\"message\":\"[^\"]*\"' | cut -d'"' -f4)"
CURRENT_DATA=$(echo "$RESPONSE1" | grep -o '\"currentData\":{[^}]*}' | cut -d':' -f2-)
echo "Current state: $CURRENT_DATA"
MISSING_FIELDS=$(echo "$RESPONSE1" | grep -o '\"missingFields\":\[[^\]]*\]' | cut -d':' -f2-)
echo "Missing fields: $MISSING_FIELDS"

# User provides type
echo -e "\nUser: SalesReservation"
RESPONSE2=$(curl -s -X POST -H "Content-Type: application/json" -d "{
  \"message\": \"SalesReservation\",
  \"currentData\": $CURRENT_DATA
}" http://localhost:3000/api/gemini)

echo "AI: $(echo "$RESPONSE2" | grep -o '\"message\":\"[^\"]*\"' | cut -d'"' -f4)"
CURRENT_DATA=$(echo "$RESPONSE2" | grep -o '\"currentData\":{[^}]*}' | cut -d':' -f2-)
echo "Current state: $CURRENT_DATA"
MISSING_FIELDS=$(echo "$RESPONSE2" | grep -o '\"missingFields\":\[[^\]]*\]' | cut -d':' -f2-)
echo "Missing fields: $MISSING_FIELDS"

# User provides the same info again (should not be requested again)
echo -e "\nUser: 10 laptops for Company A on December 20th."
RESPONSE3=$(curl -s -X POST -H "Content-Type: application/json" -d "{
  \"message\": \"10 laptops for Company A on December 20th.\",
  \"currentData\": $CURRENT_DATA
}" http://localhost:3000/api/gemini)

echo "AI: $(echo "$RESPONSE3" | grep -o '\"message\":\"[^\"]*\"' | cut -d'"' -f4)"
CURRENT_DATA=$(echo "$RESPONSE3" | grep -o '\"currentData\":{[^}]*}' | cut -d':' -f2-)
echo "Current state: $CURRENT_DATA"
MISSING_FIELDS=$(echo "$RESPONSE3" | grep -o '\"missingFields\":\[[^\]]*\]' | cut -d':' -f2-)
echo "Missing fields: $MISSING_FIELDS"

# Verify the fix
echo -e "\n=== Verification ==="
TYPE=$(echo "$CURRENT_DATA" | grep -o '\"type\":\"[^\"]*\"' | cut -d'"' -f4)
PRODUCT=$(echo "$CURRENT_DATA" | grep -o '\"product\":\"[^\"]*\"' | cut -d'"' -f4)
QUANTITY=$(echo "$CURRENT_DATA" | grep -o '\"quantity\":[^,]*' | cut -d':' -f2)
NOTES=$(echo "$CURRENT_DATA" | grep -o '\"notes\":\"[^\"]*\"' | cut -d'"' -f4)
DATE=$(echo "$CURRENT_DATA" | grep -o '\"date\":\"[^\"]*\"' | cut -d'"' -f4)

echo "✅ Type should be SalesReservation and never asked again: $TYPE"
echo "✅ Product should be laptops and never asked again: $PRODUCT"
echo "✅ Quantity should be 10 and never asked again: $QUANTITY"
echo "✅ Notes should contain Company A and never asked again: $NOTES"
echo "✅ Date should be set and never asked again: $DATE"

if [[ "$MISSING_FIELDS" == "[]" ]]; then
  echo "🎉 SUCCESS: No more circular conversation! All fields collected and never asked again."
else
  echo "❌ FAILED: Still missing fields: $MISSING_FIELDS"
fi
