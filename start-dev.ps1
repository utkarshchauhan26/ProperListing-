# ProperEase Quick Start Script
# This script starts both frontend and backend servers

Write-Host "🚀 Starting ProperEase Development Servers" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param($port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object OwningProcess -Unique
        foreach ($process in $processes) {
            Stop-Process -Id $process.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Write-Host "✅ Cleaned up port $port" -ForegroundColor Green
    } catch {
        # Port might not be in use, which is fine
    }
}

# Clean up any existing processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Stop-ProcessOnPort 3000
Stop-ProcessOnPort 3001
Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "`n🔧 Starting Backend Server (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; npm run dev" -WindowStyle Minimized

# Wait for backend to start
Start-Sleep -Seconds 5

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev" -WindowStyle Minimized

# Wait for services to start
Start-Sleep -Seconds 10

Write-Host "`n🎉 Development servers are starting!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🎨 Frontend App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️ Database Test: http://localhost:3001/test-db" -ForegroundColor Cyan

Write-Host "`n📊 Testing server availability..." -ForegroundColor Yellow

# Test if servers are running
$backendRunning = $false
$frontendRunning = $false

for ($i = 1; $i -le 30; $i++) {
    try {
        if (!$backendRunning) {
            $response = Invoke-RestMethod -Uri "http://localhost:3001/" -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✅ Backend server is running!" -ForegroundColor Green
            $backendRunning = $true
        }
    } catch {
        # Still starting up
    }
    
    try {
        if (!$frontendRunning) {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/" -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✅ Frontend server is running!" -ForegroundColor Green
            $frontendRunning = $true
        }
    } catch {
        # Still starting up
    }
    
    if ($backendRunning -and $frontendRunning) {
        break
    }
    
    Write-Host "⏳ Waiting for servers to start... ($i/30)" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

if ($backendRunning -and $frontendRunning) {
    Write-Host "`n🎉 Both servers are running successfully!" -ForegroundColor Green
    Write-Host "💻 Open your browser and visit: http://localhost:3000" -ForegroundColor Cyan
    
    # Test database connection
    try {
        $dbTest = Invoke-RestMethod -Uri "http://localhost:3001/test-db" -TimeoutSec 5
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
        Write-Host "📊 Users in database: $($dbTest.userCount)" -ForegroundColor Cyan
        Write-Host "🏠 Properties in database: $($dbTest.propertyCount)" -ForegroundColor Cyan
    } catch {
        Write-Host "⚠️ Database connection test failed - check your PostgreSQL setup" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "`n❌ Some servers failed to start. Please check the terminal windows for errors." -ForegroundColor Red
    if (!$backendRunning) {
        Write-Host "❌ Backend not running - check backend terminal" -ForegroundColor Red
    }
    if (!$frontendRunning) {
        Write-Host "❌ Frontend not running - check frontend terminal" -ForegroundColor Red
    }
}

Write-Host "`n📋 Quick Commands:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "• Test Project: .\test-project.ps1" -ForegroundColor White
Write-Host "• View Logs: Check the minimized terminal windows" -ForegroundColor White
Write-Host "• Stop Servers: Close the terminal windows or press Ctrl+C in each" -ForegroundColor White
Write-Host "• Database Studio: cd backend && npx prisma studio" -ForegroundColor White

Read-Host "`nPress Enter to continue..."
