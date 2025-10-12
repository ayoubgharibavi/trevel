#!/bin/bash

# Test script to check bookings API

echo "=== Testing Bookings API ==="
echo ""

# First, login to get a valid token
echo "1. Logging in as user..."
LOGIN_RESPONSE=$(curl -s -X POST http://89.42.199.60/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"123456"}')

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token"
  exit 1
fi

echo "✅ Got access token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Now test getUserBookings
echo "2. Fetching user bookings..."
BOOKINGS_RESPONSE=$(curl -s -X GET http://89.42.199.60/api/v1/bookings \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Bookings response: $BOOKINGS_RESPONSE"
echo ""

# Check if response contains data
if echo "$BOOKINGS_RESPONSE" | grep -q "id"; then
  echo "✅ Bookings API is working!"
  echo "Found bookings in response"
else
  echo "⚠️ No bookings found or API issue"
fi




