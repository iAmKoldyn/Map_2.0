#!/bin/bash

# Test Place endpoints
echo "Testing Place endpoints..."
echo "1. Get all places:"
curl -X POST http://localhost:3000/trpc/place.getAll \
  -H "Content-Type: application/json"

echo -e "\n2. Get place by ID:"
curl -X POST http://localhost:3000/trpc/place.getById \
  -H "Content-Type: application/json" \
  -d '{"input": {"id": 1}}'

echo -e "\n3. Create new place:"
curl -X POST http://localhost:3000/trpc/place.create \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "name": "Notre-Dame Cathedral",
      "description": "Medieval Catholic cathedral",
      "latitude": 48.8530,
      "longitude": 2.3499,
      "address": "6 Parvis Notre-Dame - Pl. Jean-Paul II",
      "city": "Paris",
      "country": "France",
      "category": "attraction",
      "imageUrl": "https://example.com/notredame.jpg",
      "website": "https://www.notredamedeparis.fr",
      "phone": "+33142345678",
      "email": "info@notredamedeparis.fr"
    }
  }'

# Test Taxi endpoints
echo -e "\n\nTesting Taxi endpoints..."
echo "1. Get all taxis:"
curl -X POST http://localhost:3000/trpc/taxi.getAll \
  -H "Content-Type: application/json"

echo -e "\n2. Get taxi by ID:"
curl -X POST http://localhost:3000/trpc/taxi.getById \
  -H "Content-Type: application/json" \
  -d '{"input": {"id": 1}}'

echo -e "\n3. Create new taxi:"
curl -X POST http://localhost:3000/trpc/taxi.create \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "name": "Luxury Taxi",
      "phone": "+33155555555",
      "company": "Luxury Transport",
      "rating": 4.8,
      "isAvailable": true,
      "placeIds": [1, 2]
    }
  }'

# Test Review endpoints
echo -e "\n\nTesting Review endpoints..."
echo "1. Get all reviews:"
curl -X POST http://localhost:3000/trpc/review.getAll \
  -H "Content-Type: application/json"

echo -e "\n2. Get review by ID:"
curl -X POST http://localhost:3000/trpc/review.getById \
  -H "Content-Type: application/json" \
  -d '{"input": {"id": 1}}'

echo -e "\n3. Create new review:"
curl -X POST http://localhost:3000/trpc/review.create \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "content": "Great experience!",
      "rating": 5,
      "author": "Alice Johnson",
      "placeId": 1
    }
  }' 