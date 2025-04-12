#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API base URL
API_URL="http://localhost:3000/trpc"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# Function to make tRPC request
make_trpc_request() {
    local endpoint=$1
    local data=$2
    local headers=$3
    
    curl -s -w "\n%{http_code}" -X POST "$API_URL/$endpoint" \
        -H "Content-Type: application/json" \
        $headers \
        -d "$data"
}

# Test authentication
echo -e "\n${YELLOW}Testing Authentication${NC}"

# Test unauthenticated access to protected routes
echo "Testing unauthenticated access..."
result=$(make_trpc_request "place.create" '{"name":"Test Place","description":"Test","latitude":0,"longitude":0}')
http_code=$(echo "$result" | tail -n1)
response=$(echo "$result" | sed '$d')
error=$(echo "$response" | jq -r '.error.message // empty')
[ "$http_code" -eq 401 ] || [ "$error" == "Authentication required" ] && print_result 0 "Unauthorized access blocked" || print_result 1 "Unauthorized access not blocked"

# Test user registration
echo "Testing user registration..."
result=$(make_trpc_request "auth.register" '{"email":"test@example.com","password":"password123","role":"USER"}')
http_code=$(echo "$result" | tail -n1)
response=$(echo "$result" | sed '$d')
error=$(echo "$response" | jq -r '.error.message // empty')
[ "$http_code" -eq 200 ] && [ -z "$error" ] && print_result 0 "User registration successful" || print_result 1 "User registration failed"

# Test router performance
echo -e "\n${YELLOW}Testing Router Performance${NC}"

# Test Places router
echo "Testing Places router..."
result=$(make_trpc_request "place.getAll" '{}')
http_code=$(echo "$result" | tail -n1)
response=$(echo "$result" | sed '$d')
error=$(echo "$response" | jq -r '.error.message // empty')
[ "$http_code" -eq 200 ] && [ -z "$error" ] && print_result 0 "Places router working" || print_result 1 "Places router failed"

# Test Taxis router
echo "Testing Taxis router..."
result=$(make_trpc_request "taxi.getAll" '{}')
http_code=$(echo "$result" | tail -n1)
response=$(echo "$result" | sed '$d')
error=$(echo "$response" | jq -r '.error.message // empty')
[ "$http_code" -eq 200 ] && [ -z "$error" ] && print_result 0 "Taxis router working" || print_result 1 "Taxis router failed"

# Test Reviews router
echo "Testing Reviews router..."
result=$(make_trpc_request "review.getAll" '{}')
http_code=$(echo "$result" | tail -n1)
response=$(echo "$result" | sed '$d')
error=$(echo "$response" | jq -r '.error.message // empty')
[ "$http_code" -eq 200 ] && [ -z "$error" ] && print_result 0 "Reviews router working" || print_result 1 "Reviews router failed"

# Test rate limiting
echo -e "\n${YELLOW}Testing Rate Limiting${NC}"
echo "Sending multiple requests in quick succession..."
for i in {1..5}; do
    result=$(make_trpc_request "place.getAll" '{}')
    http_code=$(echo "$result" | tail -n1)
    response=$(echo "$result" | sed '$d')
    error=$(echo "$response" | jq -r '.error.message // empty')
    echo "Request $i: HTTP $http_code"
done

# Test role-based access
echo -e "\n${YELLOW}Testing Role-Based Access${NC}"

# Get user token from registration
echo "Getting user token..."
result=$(make_trpc_request "auth.register" '{"email":"test2@example.com","password":"password123","role":"USER"}')
response=$(echo "$result" | sed '$d')
user_token=$(echo "$response" | jq -r '.result.data.token // empty')

if [ -n "$user_token" ]; then
    # Test admin-only routes with user token
    echo "Testing admin route with user token..."
    result=$(make_trpc_request "place.delete" '{"id":1}' "-H \"Authorization: Bearer $user_token\"")
    http_code=$(echo "$result" | tail -n1)
    response=$(echo "$result" | sed '$d')
    error=$(echo "$response" | jq -r '.error.message // empty')
    [ "$http_code" -eq 403 ] || [ "$error" == "Insufficient permissions" ] && print_result 0 "User access to admin route blocked" || print_result 1 "User access to admin route not blocked"
else
    print_result 1 "Failed to get user token"
fi

# Test error handling
echo -e "\n${YELLOW}Testing Error Handling${NC}"

# Test invalid input
echo "Testing invalid input handling..."
result=$(make_trpc_request "place.create" '{"name":"","description":"Test","latitude":0,"longitude":0}')
http_code=$(echo "$result" | tail -n1)
response=$(echo "$result" | sed '$d')
error=$(echo "$response" | jq -r '.error.message // empty')
[ "$http_code" -eq 400 ] || [ -n "$error" ] && print_result 0 "Invalid input handled correctly" || print_result 1 "Invalid input not handled correctly"

# Test non-existent resource
echo "Testing non-existent resource handling..."
result=$(make_trpc_request "place.getById" '{"id":999999}')
http_code=$(echo "$result" | tail -n1)
response=$(echo "$result" | sed '$d')
error=$(echo "$response" | jq -r '.error.message // empty')
[ "$http_code" -eq 404 ] || [ "$error" == "Place not found" ] && print_result 0 "Non-existent resource handled correctly" || print_result 1 "Non-existent resource not handled correctly"

echo -e "\nTest Summary"
echo "All tests completed. Check above for results." 