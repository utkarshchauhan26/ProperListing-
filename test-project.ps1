# ProperEase Project Test Script
# This script tests the entire project functionality

Write-Host "🏠 ProperEase Project Testing Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Colors for output
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"
$infoColor = "Cyan"

function Test-Command {
    param($command, $description)
    Write-Host "Testing: $description" -ForegroundColor $infoColor
    try {
        $result = Invoke-Expression $command
        Write-Host "✅ $description - SUCCESS" -ForegroundColor $successColor
        return $true
    } catch {
        Write-Host "❌ $description - FAILED: $($_.Exception.Message)" -ForegroundColor $errorColor
        return $false
    }
}

function Test-Port {
    param($port, $service)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet
        if ($connection) {
            Write-Host "✅ $service (Port $port) - RUNNING" -ForegroundColor $successColor
            return $true
        } else {
            Write-Host "❌ $service (Port $port) - NOT RUNNING" -ForegroundColor $errorColor
            return $false
        }
    } catch {
        Write-Host "❌ $service (Port $port) - NOT ACCESSIBLE" -ForegroundColor $errorColor
        return $false
    }
}

function Test-URL {
    param($url, $description)
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
        Write-Host "✅ $description - ACCESSIBLE" -ForegroundColor $successColor
        return $true
    } catch {
        Write-Host "❌ $description - NOT ACCESSIBLE: $($_.Exception.Message)" -ForegroundColor $errorColor
        return $false
    }
}

# Step 1: Check Prerequisites
Write-Host "`n🔍 Step 1: Checking Prerequisites" -ForegroundColor $infoColor
Write-Host "=================================" -ForegroundColor $infoColor

$prereqTests = @()
$prereqTests += Test-Command "node --version" "Node.js Installation"
$prereqTests += Test-Command "npm --version" "NPM Installation"
$prereqTests += Test-Command "npx --version" "NPX Installation"

# Check PostgreSQL
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService -and $pgService.Status -eq "Running") {
        Write-Host "✅ PostgreSQL Service - RUNNING" -ForegroundColor $successColor
        $prereqTests += $true
    } else {
        Write-Host "❌ PostgreSQL Service - NOT RUNNING" -ForegroundColor $errorColor
        $prereqTests += $false
    }
} catch {
    Write-Host "❌ PostgreSQL Service - NOT FOUND" -ForegroundColor $errorColor
    $prereqTests += $false
}

# Step 2: Check Environment Files
Write-Host "`n📋 Step 2: Checking Environment Configuration" -ForegroundColor $infoColor
Write-Host "=============================================" -ForegroundColor $infoColor

$envTests = @()

# Backend .env.local
if (Test-Path "backend\.env.local") {
    Write-Host "✅ Backend .env.local - EXISTS" -ForegroundColor $successColor
    $envTests += $true
    
    $backendEnv = Get-Content "backend\.env.local" -Raw
    $requiredBackendVars = @("DATABASE_URL", "JWT_SECRET", "PORT", "FRONTEND_URL")
    foreach ($var in $requiredBackendVars) {
        if ($backendEnv -match "$var=") {
            Write-Host "✅ Backend $var - SET" -ForegroundColor $successColor
        } else {
            Write-Host "❌ Backend $var - MISSING" -ForegroundColor $errorColor
            $envTests += $false
        }
    }
} else {
    Write-Host "❌ Backend .env.local - MISSING" -ForegroundColor $errorColor
    $envTests += $false
}

# Frontend .env.local
if (Test-Path "frontend\.env.local") {
    Write-Host "✅ Frontend .env.local - EXISTS" -ForegroundColor $successColor
    $envTests += $true
    
    $frontendEnv = Get-Content "frontend\.env.local" -Raw
    $requiredFrontendVars = @("NEXT_PUBLIC_API_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET")
    foreach ($var in $requiredFrontendVars) {
        if ($frontendEnv -match "$var=") {
            Write-Host "✅ Frontend $var - SET" -ForegroundColor $successColor
        } else {
            Write-Host "❌ Frontend $var - MISSING" -ForegroundColor $errorColor
            $envTests += $false
        }
    }
} else {
    Write-Host "❌ Frontend .env.local - MISSING" -ForegroundColor $errorColor
    $envTests += $false
}

# Step 3: Check Dependencies
Write-Host "`n📦 Step 3: Checking Dependencies" -ForegroundColor $infoColor
Write-Host "================================" -ForegroundColor $infoColor

$depTests = @()

# Backend dependencies
Set-Location "backend"
if (Test-Path "node_modules") {
    Write-Host "✅ Backend node_modules - EXISTS" -ForegroundColor $successColor
    $depTests += $true
} else {
    Write-Host "❌ Backend node_modules - MISSING (Run: npm install)" -ForegroundColor $errorColor
    $depTests += $false
}

# Check Prisma client
if (Test-Path "generated\prisma") {
    Write-Host "✅ Prisma Client - GENERATED" -ForegroundColor $successColor
    $depTests += $true
} else {
    Write-Host "❌ Prisma Client - NOT GENERATED (Run: npx prisma generate)" -ForegroundColor $errorColor
    $depTests += $false
}

Set-Location ".."

# Frontend dependencies
Set-Location "frontend"
if (Test-Path "node_modules") {
    Write-Host "✅ Frontend node_modules - EXISTS" -ForegroundColor $successColor
    $depTests += $true
} else {
    Write-Host "❌ Frontend node_modules - MISSING (Run: npm install)" -ForegroundColor $errorColor
    $depTests += $false
}

Set-Location ".."

# Step 4: Database Tests
Write-Host "`n🗄️ Step 4: Database Connection Tests" -ForegroundColor $infoColor
Write-Host "====================================" -ForegroundColor $infoColor

$dbTests = @()

# Test PostgreSQL connection
$dbTests += Test-Port 5432 "PostgreSQL Database"

# Step 5: Start Services and Test
Write-Host "`n🚀 Step 5: Starting Services (Background)" -ForegroundColor $infoColor
Write-Host "=========================================" -ForegroundColor $infoColor

# Kill any existing processes on ports 3000 and 3001
Write-Host "Cleaning up existing processes..." -ForegroundColor $warningColor
Get-Process | Where-Object {$_.Name -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend
Write-Host "Starting backend server..." -ForegroundColor $infoColor
Set-Location "backend"
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "backend"
    npm run dev
}
Set-Location ".."

# Wait a bit for backend to start
Start-Sleep -Seconds 8

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor $infoColor
Set-Location "frontend"
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location "frontend"
    npm run dev
}
Set-Location ".."

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor $infoColor
Start-Sleep -Seconds 15

# Step 6: Service Tests
Write-Host "`n🌐 Step 6: Service Availability Tests" -ForegroundColor $infoColor
Write-Host "=====================================" -ForegroundColor $infoColor

$serviceTests = @()
$serviceTests += Test-Port 3001 "Backend API Server"
$serviceTests += Test-Port 3000 "Frontend Next.js Server"

# Step 7: API Endpoint Tests
Write-Host "`n🔗 Step 7: API Endpoint Tests" -ForegroundColor $infoColor
Write-Host "=============================" -ForegroundColor $infoColor

$apiTests = @()
$apiTests += Test-URL "http://localhost:3001/" "Backend Root Endpoint"
$apiTests += Test-URL "http://localhost:3001/test-db" "Database Connection Test"
$apiTests += Test-URL "http://localhost:3000/" "Frontend Root Page"

# Additional API endpoint tests
$endpoints = @(
    @{url="http://localhost:3001/api/auth"; desc="Auth Endpoint"},
    @{url="http://localhost:3001/api/properties"; desc="Properties Endpoint"},
    @{url="http://localhost:3001/api/inquiries"; desc="Inquiries Endpoint"},
    @{url="http://localhost:3001/api/wishlist"; desc="Wishlist Endpoint"}
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri $endpoint.url -Method GET -TimeoutSec 5
        Write-Host "✅ $($endpoint.desc) - ACCESSIBLE" -ForegroundColor $successColor
        $apiTests += $true
    } catch {
        # Some endpoints might return 401/403 which is expected without auth
        if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ $($endpoint.desc) - ACCESSIBLE (Auth Required)" -ForegroundColor $successColor
            $apiTests += $true
        } else {
            Write-Host "❌ $($endpoint.desc) - ERROR: $($_.Exception.Message)" -ForegroundColor $errorColor
            $apiTests += $false
        }
    }
}

# Step 8: Frontend Page Tests
Write-Host "`n📱 Step 8: Frontend Page Tests" -ForegroundColor $infoColor
Write-Host "==============================" -ForegroundColor $infoColor

$pageTests = @()
$pages = @(
    @{url="http://localhost:3000/"; desc="Home Page"},
    @{url="http://localhost:3000/auth/login"; desc="Login Page"},
    @{url="http://localhost:3000/auth/signup"; desc="Signup Page"},
    @{url="http://localhost:3000/properties"; desc="Properties Page"},
    @{url="http://localhost:3000/dashboard"; desc="Dashboard Page"},
    @{url="http://localhost:3000/list-property"; desc="List Property Page"},
    @{url="http://localhost:3000/wishlist"; desc="Wishlist Page"}
)

foreach ($page in $pages) {
    $pageTests += Test-URL $page.url $page.desc
}

# Step 9: File Structure Tests
Write-Host "`n📁 Step 9: Critical File Structure Tests" -ForegroundColor $infoColor
Write-Host "=========================================" -ForegroundColor $infoColor

$fileTests = @()
$criticalFiles = @(
    "backend\src\server.ts",
    "backend\src\routes\auth.ts",
    "backend\src\routes\properties.ts",
    "backend\src\routes\inquiries.ts",
    "backend\src\routes\wishlist.ts",
    "backend\src\lib\prisma.ts",
    "backend\src\lib\auth.ts",
    "backend\prisma\schema.prisma",
    "frontend\src\app\page.tsx",
    "frontend\src\app\layout.tsx",
    "frontend\src\app\auth\login\page.tsx",
    "frontend\src\app\properties\page.tsx",
    "frontend\src\app\dashboard\page.tsx",
    "frontend\src\app\wishlist\page.tsx",
    "frontend\src\lib\api.tsx",
    "frontend\src\lib\auth.ts"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - EXISTS" -ForegroundColor $successColor
        $fileTests += $true
    } else {
        Write-Host "❌ $file - MISSING" -ForegroundColor $errorColor
        $fileTests += $false
    }
}

# Step 10: Generate Test Report
Write-Host "`n📊 Final Test Report" -ForegroundColor $infoColor
Write-Host "===================" -ForegroundColor $infoColor

$totalTests = $prereqTests.Count + $envTests.Count + $depTests.Count + $dbTests.Count + $serviceTests.Count + $apiTests.Count + $pageTests.Count + $fileTests.Count
$passedTests = ($prereqTests + $envTests + $depTests + $dbTests + $serviceTests + $apiTests + $pageTests + $fileTests | Where-Object { $_ -eq $true }).Count

$passPercentage = [math]::Round(($passedTests / $totalTests) * 100, 2)

Write-Host "`nTest Summary:" -ForegroundColor $infoColor
Write-Host "=============" -ForegroundColor $infoColor
Write-Host "Prerequisites: $($prereqTests.Where({$_}).Count)/$($prereqTests.Count) passed" -ForegroundColor $(if ($prereqTests.Where({$_}).Count -eq $prereqTests.Count) { $successColor } else { $warningColor })
Write-Host "Environment: $($envTests.Where({$_}).Count)/$($envTests.Count) passed" -ForegroundColor $(if ($envTests.Where({$_}).Count -eq $envTests.Count) { $successColor } else { $warningColor })
Write-Host "Dependencies: $($depTests.Where({$_}).Count)/$($depTests.Count) passed" -ForegroundColor $(if ($depTests.Where({$_}).Count -eq $depTests.Count) { $successColor } else { $warningColor })
Write-Host "Database: $($dbTests.Where({$_}).Count)/$($dbTests.Count) passed" -ForegroundColor $(if ($dbTests.Where({$_}).Count -eq $dbTests.Count) { $successColor } else { $warningColor })
Write-Host "Services: $($serviceTests.Where({$_}).Count)/$($serviceTests.Count) passed" -ForegroundColor $(if ($serviceTests.Where({$_}).Count -eq $serviceTests.Count) { $successColor } else { $warningColor })
Write-Host "API Endpoints: $($apiTests.Where({$_}).Count)/$($apiTests.Count) passed" -ForegroundColor $(if ($apiTests.Where({$_}).Count -eq $apiTests.Count) { $successColor } else { $warningColor })
Write-Host "Frontend Pages: $($pageTests.Where({$_}).Count)/$($pageTests.Count) passed" -ForegroundColor $(if ($pageTests.Where({$_}).Count -eq $pageTests.Count) { $successColor } else { $warningColor })
Write-Host "File Structure: $($fileTests.Where({$_}).Count)/$($fileTests.Count) passed" -ForegroundColor $(if ($fileTests.Where({$_}).Count -eq $fileTests.Count) { $successColor } else { $warningColor })

Write-Host "`nOverall Result:" -ForegroundColor $infoColor
Write-Host "===============" -ForegroundColor $infoColor
Write-Host "Total Tests: $totalTests" -ForegroundColor $infoColor
Write-Host "Passed: $passedTests" -ForegroundColor $successColor
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor $errorColor
Write-Host "Success Rate: $passPercentage%" -ForegroundColor $(if ($passPercentage -ge 80) { $successColor } elseif ($passPercentage -ge 60) { $warningColor } else { $errorColor })

if ($passPercentage -ge 90) {
    Write-Host "`n🎉 Excellent! Project is ready for production!" -ForegroundColor $successColor
} elseif ($passPercentage -ge 80) {
    Write-Host "`n👍 Good! Minor issues need attention." -ForegroundColor $warningColor
} elseif ($passPercentage -ge 60) {
    Write-Host "`n⚠️ Warning! Several issues need to be fixed." -ForegroundColor $warningColor
} else {
    Write-Host "`n🚨 Critical! Major issues need immediate attention." -ForegroundColor $errorColor
}

# Cleanup - Stop background jobs
Write-Host "`n🧹 Cleaning up background processes..." -ForegroundColor $infoColor
Stop-Job $backendJob -ErrorAction SilentlyContinue
Stop-Job $frontendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob -ErrorAction SilentlyContinue
Remove-Job $frontendJob -ErrorAction SilentlyContinue

Write-Host "`n✅ Test completed! Check the results above." -ForegroundColor $infoColor
Write-Host "💡 To run services manually:" -ForegroundColor $infoColor
Write-Host "   Backend: cd backend && npm run dev" -ForegroundColor $warningColor
Write-Host "   Frontend: cd frontend && npm run dev" -ForegroundColor $warningColor
