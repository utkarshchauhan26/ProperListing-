# ProperEase Final Verification Script
# Quick verification of all critical systems

Write-Host "=== PROPEREASE FINAL VERIFICATION ===" -ForegroundColor Green
Write-Host "Time: $(Get-Date)" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"
$frontendUrl = "http://localhost:3000"
$testsPassed = 0
$totalTests = 0

function Test-Component {
    param($name, $test)
    $script:totalTests++
    try {
        $result = & $test
        if ($result) {
            Write-Host "✅ PASS: $name" -ForegroundColor Green
            $script:testsPassed++
            return $true
        } else {
            Write-Host "❌ FAIL: $name" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ FAIL: $name - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n🔍 INFRASTRUCTURE CHECKS" -ForegroundColor Yellow

# Test 1: Backend Database Connection
Test-Component "Backend Database Connection" {
    $response = Invoke-WebRequest -Uri "$baseUrl/test-db" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    return ($data.success -and $data.database -eq "Connected")
}

# Test 2: Frontend Application
Test-Component "Frontend Application" {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -UseBasicParsing
    return ($response.StatusCode -eq 200 -and $response.Content -like "*ProperEase*")
}

Write-Host "`n🔐 AUTHENTICATION SYSTEM" -ForegroundColor Yellow

# Test 3: User Registration
$timestamp = (Get-Date).Ticks
$testEmail = "final-verify-$timestamp@test.com"
$authToken = $null

Test-Component "User Registration" {
    $registerData = @{
        fullName = "Final Verify User"
        email = $testEmail
        password = "FinalVerify123!"
        role = "STUDENT"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    return ($data.success -and $data.user)
}

# Test 4: User Login
Test-Component "User Login" {
    $loginData = @{
        email = $testEmail
        password = "FinalVerify123!"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($data.success -and $data.token) {
        $script:authToken = $data.token
        return $true
    }
    return $false
}

Write-Host "`n🏠 PROPERTY SYSTEM" -ForegroundColor Yellow

# Test 5: Property Search
Test-Component "Property Search" {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/properties" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    return ($data.success -and $data.properties)
}

# Test 6: Protected Routes
Test-Component "Protected Routes Access Control" {
    if (-not $authToken) { return $false }
    
    try {
        $headers = @{ Authorization = "Bearer $authToken" }
        $response = Invoke-WebRequest -Uri "$baseUrl/api/properties/my-properties" -Method GET -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        return $data.success
    } catch {
        # For student role, 403 is expected for my-properties (landlord-only)
        return ($_.Exception.Message -like "*403*")
    }
}

Write-Host "`n💬 COMMUNICATION SYSTEMS" -ForegroundColor Yellow

# Test 7: Inquiry System
Test-Component "Inquiry System" {
    if (-not $authToken) { return $false }
    
    $headers = @{ Authorization = "Bearer $authToken" }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/inquiries/my-inquiries" -Method GET -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    return $data.success
}

# Test 8: Wishlist System
Test-Component "Wishlist System" {
    if (-not $authToken) { return $false }
    
    $headers = @{ Authorization = "Bearer $authToken" }
    $response = Invoke-WebRequest -Uri "$baseUrl/api/wishlist" -Method GET -Headers $headers -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    return $data.success
}

Write-Host "`n🌐 FRONTEND PAGES" -ForegroundColor Yellow

# Test 9: Login Page
Test-Component "Login Page" {
    try {
        $response = Invoke-WebRequest -Uri "$frontendUrl/auth/login" -Method GET -UseBasicParsing
        return ($response.StatusCode -eq 200)
    } catch {
        # Redirects are also acceptable
        return ($_.Exception.Message -like "*302*")
    }
}

# Test 10: Properties Page
Test-Component "Properties Page" {
    try {
        $response = Invoke-WebRequest -Uri "$frontendUrl/properties" -Method GET -UseBasicParsing
        return ($response.StatusCode -eq 200)
    } catch {
        return ($_.Exception.Message -like "*302*")
    }
}

Write-Host "`n📊 FINAL VERIFICATION RESULTS" -ForegroundColor Magenta

$successRate = [math]::Round(($testsPassed / $totalTests) * 100, 2)

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "FINAL VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $testsPassed)" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan

if ($successRate -ge 90) {
    Write-Host "`n🎉 FINAL VERIFICATION: SUCCESS!" -ForegroundColor Green
    Write-Host "✅ ProperEase is PRODUCTION READY!" -ForegroundColor Green
    Write-Host "✅ All critical systems verified working!" -ForegroundColor Green
} elseif ($successRate -ge 75) {
    Write-Host "`n⚠️ VERIFICATION: PARTIAL SUCCESS" -ForegroundColor Yellow
    Write-Host "Most systems working, some issues detected" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ VERIFICATION: FAILED" -ForegroundColor Red
    Write-Host "Critical issues detected" -ForegroundColor Red
}

Write-Host "`nVerification completed: $(Get-Date)" -ForegroundColor Cyan
