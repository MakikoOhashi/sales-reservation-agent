#!/bin/bash

echo "Testing conversation state handling..."

# Test case 1: User provides type and product
echo -e "\n1. User provides type and product:"
curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "I want to make a sales reservation for a laptop",
  "currentData": {}
}' http://localhost:3000/api/gemini

echo -e "\n\n"

# Test case 2: User provides quantity (should not overwrite existing fields)
echo -e "2. User provides quantity:"
curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "I need 5 laptops",
  "currentData": {
    "type": "SalesReservation",
    "product": "laptop"
  }
}' http://localhost:3000/api/gemini

echo -e "\n\n"

# Test case 3: User provides date (should not overwrite existing fields)
echo -e "3. User provides date:"
curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "for tomorrow",
  "currentData": {
    "type": "SalesReservation",
    "product": "laptop",
    "quantity": 5
  }
}' http://localhost:3000/api/gemini

echo -e "\n\n"

# Test case 4: User provides notes (should complete all required fields)
echo -e "4. User provides notes:"
curl -s -X POST -H "Content-Type: application/json" -d '{
  "message": "for Acme Inc",
  "currentData": {
    "type": "SalesReservation",
    "product": "laptop",
    "quantity": 5,
    "date": "tomorrow"
  }
}' http://localhost:3000/api/gemini

echo -e "\n\nTest completed!"
