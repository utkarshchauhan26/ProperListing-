# ProperEase Final Verification Script
# Comprehensive End-to-End Testing - FINAL CHECK

Write-Host "=== ProperEase FINAL VERIFICATION STARTED ===" -ForegroundColor Green
Write-Host "Time: $(Get-Date)" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"
$frontendUrl = "http://localhost:3000"
$testResults = @()

# Test Results Tracking
function Add-TestResult {
    param($testName, $success, $details)
    $script:testResults += @{
        Test = $testName
        Success = $success
        Details = $details
        Time = Get-Date
    }
    if ($success) {
        Write-Host "✅ PASS: $testName" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: $testName - $details" -ForegroundColor Red
    }
}

Write-Host "`n🔍 VERIFICATION PHASE 1: Infrastructure Health Check" -ForegroundColor Yellow

# 1. Backend Health Check
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/test-db" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($data.success -and $data.database -eq "Connected") {
        Add-TestResult "Backend and Database Connection" $true "Users: $($data.userCount), Properties: $($data.propertyCount)"
    } else {
        Add-TestResult "Backend and Database Connection" $false "Database not connected properly"
    }
} catch {
    Add-TestResult "Backend and Database Connection" $false $_.Exception.Message
}

# 2. Frontend Health Check
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200 -and $response.Content -like "*ProperEase*") {
        Add-TestResult "Frontend Application" $true "Homepage loading successfully"
    } else {
        Add-TestResult "Frontend Application" $false "Homepage not loading properly"
    }
} catch {
    Add-TestResult "Frontend Application" $false $_.Exception.Message
}

Write-Host "`n🔐 VERIFICATION PHASE 2: Authentication System" -ForegroundColor Yellow

# Create unique test user for final verification
$timestamp = (Get-Date).Ticks
$testEmail = "final-test-$timestamp@test.com"

# 3. User Registration
try {
    $registerData = @{
        fullName = "Final Test User"
        email = $testEmail
        password = "FinalTest123!"
        role = "STUDENT"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($data.success -and $data.user) {
        Add-TestResult "User Registration" $true "User created with ID: $($data.user.id)"
        $userId = $data.user.id
    } else {
        Add-TestResult "User Registration" $false "Registration failed"
    }
} catch {
    Add-TestResult "User Registration" $false $_.Exception.Message
}

# 4. User Login
try {
    $loginData = @{
        email = $testEmail
        password = "FinalTest123!"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($data.success -and $data.token) {
        Add-TestResult "User Login" $true "JWT token generated successfully"
        $authToken = $data.token
    } else {
        Add-TestResult "User Login" $false "Login failed"
    }
} catch {
    Add-TestResult "User Login" $false $_.Exception.Message
}

Write-Host "`n🏠 VERIFICATION PHASE 3: Property System" -ForegroundColor Yellow

# 5. Property Search (Public Access)
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/properties" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    if ($data.success -and $data.properties) {
        Add-TestResult "Property Search (Public)" $true "Found $($data.properties.Count) properties"
    } else {
        Add-TestResult "Property Search (Public)" $false "Property search failed"
    }
} catch {
    Add-TestResult "Property Search (Public)" $false $_.Exception.Message
}

# 6. Protected Route Access Check
if ($authToken) {
    try {
        $headers = @{ Authorization = "Bearer $authToken" }
        $response = Invoke-WebRequest -Uri "$baseUrl/api/properties/my-properties" -Method GET -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        if ($data.success) {
            Add-TestResult "Protected Route Access" $true "My Properties accessible"
        } else {
            Add-TestResult "Protected Route Access" $false "Protected route failed"
        }
    } catch {
        if ($_.Exception.Message -like "*403*") {
            Add-TestResult "Protected Route Access" $true "Proper access control (403 for student role)"
        } else {
            Add-TestResult "Protected Route Access" $false $_.Exception.Message
        }
    }
}

Write-Host "`n💬 VERIFICATION PHASE 4: Communication System" -ForegroundColor Yellow

# 7. Inquiry System Check
if ($authToken) {
    try {
        $headers = @{ Authorization = "Bearer $authToken" }
        $response = Invoke-WebRequest -Uri "$baseUrl/api/inquiries/my-inquiries" -Method GET -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        if ($data.success) {
            Add-TestResult "Inquiry System" $true "My Inquiries accessible"
        } else {
            Add-TestResult "Inquiry System" $false "Inquiry system failed"
        }
    } catch {
        Add-TestResult "Inquiry System" $false $_.Exception.Message
    }
}

Write-Host "`n❤️ VERIFICATION PHASE 5: Wishlist System" -ForegroundColor Yellow

# 8. Wishlist System Check
if ($authToken) {
    try {
        $headers = @{ Authorization = "Bearer $authToken" }
        $response = Invoke-WebRequest -Uri "$baseUrl/api/wishlist" -Method GET -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        if ($data.success) {
            Add-TestResult "Wishlist System" $true "Wishlist accessible"
        } else {
            Add-TestResult "Wishlist System" $false "Wishlist system failed"
        }
    } catch {
        Add-TestResult "Wishlist System" $false $_.Exception.Message
    }
}

Write-Host "`n🌐 VERIFICATION PHASE 6: Critical Frontend Pages" -ForegroundColor Yellow

# 9. Critical Frontend Pages Check
$frontendPages = @(
    @{ name = "Login Page"; path = "/auth/login" }
    @{ name = "Signup Page"; path = "/auth/signup" }
    @{ name = "Properties Page"; path = "/properties" }
    @{ name = "Dashboard Page"; path = "/dashboard" }
)

foreach ($page in $frontendPages) {
    try {
        $response = Invoke-WebRequest -Uri "$frontendUrl$($page.path)" -Method GET -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Add-TestResult "Frontend: $($page.name)" $true "Page loads successfully"
        } else {
            Add-TestResult "Frontend: $($page.name)" $false "Page not loading (Status: $($response.StatusCode))"
        }
    } catch {
        if ($_.Exception.Message -like "*302*" -or $_.Exception.Message -like "*redirect*") {
            Add-TestResult "Frontend: $($page.name)" $true "Page accessible (redirected as expected)"
        } else {
            Add-TestResult "Frontend: $($page.name)" $false $_.Exception.Message
        }
    }
}

Write-Host "`n📊 FINAL VERIFICATION SUMMARY" -ForegroundColor Magenta

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Success }).Count
$failedTests = $totalTests - $passedTests
$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "PROPEREASE FINAL VERIFICATION REPORT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $successRate%" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`nDETAILED RESULTS:" -ForegroundColor White
foreach ($result in $testResults) {
    $status = if ($result.Success) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "$status - $($result.Test)" -ForegroundColor $color
    if ($result.Details) {
        Write-Host "  Details: $($result.Details)" -ForegroundColor Gray
    }
}

if ($successRate -ge 90) {
    Write-Host "`n🎉 VERIFICATION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "ProperEase is PRODUCTION READY!" -ForegroundColor Green
} elseif ($successRate -ge 75) {
    Write-Host "`n⚠️ VERIFICATION COMPLETED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "Some issues detected, review required" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ VERIFICATION FAILED" -ForegroundColor Red
    Write-Host "Critical issues detected, immediate attention required" -ForegroundColor Red
}

Write-Host "`nFinal verification completed at: $(Get-Date)" -ForegroundColor Cyan
