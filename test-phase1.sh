#!/bin/bash

# Megapark Hotel - Phase 1 Testing Script
# This script helps verify all Phase 1 features are working

echo "================================"
echo "🧪 MEGAPARK HOTEL - PHASE 1 TEST"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend Running
echo "Test 1: Checking Backend Server..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is running on port 3000"
else
    echo -e "${RED}✗${NC} Backend is NOT running on port 3000"
    echo "  Run: cd backend && npm start"
fi

# Test 2: Frontend Running
echo ""
echo "Test 2: Checking Frontend Server..."
if curl -s http://localhost:5174/megapark-hotel/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running on port 5174"
else
    echo -e "${RED}✗${NC} Frontend is NOT running on port 5174"
    echo "  Run: npm run dev"
fi

# Test 3: API Endpoints
echo ""
echo "Test 3: Testing API Endpoints..."

# Login endpoint
if curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@megapark.com","password":"admin123"}' | grep -q "accessToken"; then
    echo -e "${GREEN}✓${NC} Auth endpoint working"
else
    echo -e "${YELLOW}⚠${NC} Auth endpoint not responding as expected"
fi

# Menu endpoint
if curl -s http://localhost:3000/api/menu > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Menu endpoint working"
else
    echo -e "${YELLOW}⚠${NC} Menu endpoint not responding"
fi

# Test 4: Database
echo ""
echo "Test 4: Database Status..."
if [ -f "backend/data/menu.json" ]; then
    COUNT=$(grep -c '"id"' backend/data/menu.json 2>/dev/null || echo 0)
    echo -e "${GREEN}✓${NC} JSON database exists with $COUNT menu items"
else
    echo -e "${YELLOW}⚠${NC} JSON database not found in backend/data/"
fi

# Test 5: Environment Configuration
echo ""
echo "Test 5: Configuration Check..."

if grep -q "STRIPE_SECRET_KEY" backend/.env 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Backend .env configured"
else
    echo -e "${RED}✗${NC} Backend .env not found"
fi

if [ -f ".env" ] || [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env configured"
else
    echo -e "${YELLOW}⚠${NC} Frontend .env not found (using defaults)"
fi

# Test 6: Admin Login
echo ""
echo "Test 6: Admin Credentials..."
echo -e "  Email: ${YELLOW}admin@megapark.com${NC}"
echo -e "  Password: ${YELLOW}admin123${NC}"
echo "  URL: http://localhost:5174/megapark-hotel/admin/login"

# Test 7: Email Service
echo ""
echo "Test 7: Email Service..."
if grep -q "EMAIL_USER" backend/.env 2>/dev/null; then
    EMAIL=$(grep "EMAIL_USER" backend/.env | cut -d'=' -f2)
    echo -e "${GREEN}✓${NC} Email configured: $EMAIL"
else
    echo -e "${YELLOW}⚠${NC} Email not configured - using Ethereal for testing"
    echo "  Check logs for preview URLs"
fi

# Summary
echo ""
echo "================================"
echo "📋 QUICK START CHECKLIST"
echo "================================"
echo "✓ Backend setup: cd backend && npm start"
echo "✓ Frontend setup: npm run dev"
echo "✓ Access Admin: http://localhost:5174/megapark-hotel/admin/login"
echo "✓ Test Order: Add items to cart → Checkout → Place Order"
echo "✓ Track Order: http://localhost:5174/megapark-hotel/orders"
echo ""
echo "================================"
echo "For detailed setup, see: PHASE_1_COMPLETE.md"
echo "================================"
