@echo off
REM Megapark Hotel - Phase 1 Testing Script (Windows)
REM This script helps verify all Phase 1 features are working

echo.
echo ================================
echo MEGAPARK HOTEL - PHASE 1 TEST
echo ================================
echo.

REM Test 1: Backend Running
echo Test 1: Checking Backend Server...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -UseBasicParsing -ErrorAction SilentlyContinue; if ($response.StatusCode -eq 200) { Write-Host '✓ Backend is running on port 3000' -ForegroundColor Green } else { Write-Host '✗ Backend is NOT running on port 3000' -ForegroundColor Red } } catch { Write-Host '✗ Backend is NOT running on port 3000' -ForegroundColor Red }"

REM Test 2: Frontend Running
echo.
echo Test 2: Checking Frontend Server...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5174/megapark-hotel/' -UseBasicParsing -ErrorAction SilentlyContinue; if ($response.StatusCode -eq 200) { Write-Host '✓ Frontend is running on port 5174' -ForegroundColor Green } else { Write-Host '✗ Frontend is NOT running on port 5174' -ForegroundColor Red } } catch { Write-Host '✗ Frontend is NOT running on port 5174' -ForegroundColor Red }"

REM Test 3: Database Check
echo.
echo Test 3: Database Status...
if exist "backend\data\menu.json" (
    echo ✓ JSON database exists
) else (
    echo ✗ JSON database not found
)

REM Test 4: Configuration
echo.
echo Test 4: Configuration Check...
if exist "backend\.env" (
    echo ✓ Backend .env configured
) else (
    echo ✗ Backend .env not found
)

if exist ".env" (
    echo ✓ Frontend .env configured
) else (
    if exist ".env.local" (
        echo ✓ Frontend .env.local configured
    ) else (
        echo ⚠ Frontend .env not found - using defaults
    )
)

REM Test 5: Admin Credentials
echo.
echo Test 5: Admin Login Credentials
echo Email: admin@megapark.com
echo Password: admin123
echo.

REM Summary
echo ================================
echo QUICK START COMMANDS
echo ================================
echo.
echo 1. IN TERMINAL 1 - Start Backend:
echo    cd backend
echo    npm start
echo.
echo 2. IN TERMINAL 2 - Start Frontend:
echo    npm run dev
echo.
echo 3. Access Admin Dashboard:
echo    http://localhost:5174/megapark-hotel/admin/login
echo.
echo 4. Test Order Flow:
echo    - Add items to cart
echo    - Go to Checkout
echo    - Place order
echo.
echo 5. View Order History:
echo    http://localhost:5174/megapark-hotel/orders
echo.
echo ================================
echo For detailed setup, see: PHASE_1_COMPLETE.md
echo ================================
echo.
