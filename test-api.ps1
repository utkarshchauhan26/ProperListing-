# Simple ProperEase API Testing Script
Write-Host "🧪 ProperEase API Testing" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

$API_BASE = "http://localhost:3001"
$FRONTEND_BASE = "http://localhost:3000"

# Test counters
$totalTests = 0
$passedTests = 0

function Test-API {
    param($testName, $url, $method = "GET", $body = $null, $headers = @{})
    
    $script:totalTests++
    Write-Host "`nTesting: $testName" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $url
            Method = $method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($body) {
            $params.Body = $body | ConvertTo-Json -Depth 10
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ $testName - SUCCESS" -ForegroundColor Green
        $script:passedTests++
        return $response
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Unknown" }
        Write-Host "❌ $testName - FAILED (Status: $statusCode)" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Test Server Availability
Write-Host "`n🔍 Phase 1: Server Testing" -ForegroundColor Cyan
$serverInfo = Test-API "Backend Server" "$API_BASE/"
$dbInfo = Test-API "Database Connection" "$API_BASE/test-db"

if ($dbInfo) {
    Write-Host "   Database Status: $($dbInfo.database)" -ForegroundColor Green
    Write-Host "   Users: $($dbInfo.userCount), Properties: $($dbInfo.propertyCount)" -ForegroundColor Gray
}

# 2. Test User Registration
Write-Host "`n👤 Phase 2: User Registration" -ForegroundColor Cyan

$landlordData = @{
    name = "Test Landlord"
    email = "landlord@test.com"
    password = "Test123!"
    userType = "LANDLORD"
    whatsapp = "+91-9876543210"
}

$studentData = @{
    name = "Test Student"
    email = "student@test.com"
    password = "Test123!"
    userType = "STUDENT"
}

$landlordReg = Test-API "Landlord Registration" "$API_BASE/api/auth/signup" "POST" $landlordData
$studentReg = Test-API "Student Registration" "$API_BASE/api/auth/signup" "POST" $studentData

# 3. Test User Login
Write-Host "`n🔐 Phase 3: User Authentication" -ForegroundColor Cyan

$landlordLogin = @{
    email = "landlord@test.com"
    password = "Test123!"
}

$studentLogin = @{
    email = "student@test.com"
    password = "Test123!"
}

$landlordAuth = Test-API "Landlord Login" "$API_BASE/api/auth/signin" "POST" $landlordLogin
$studentAuth = Test-API "Student Login" "$API_BASE/api/auth/signin" "POST" $studentLogin

$landlordToken = ""
$studentToken = ""

if ($landlordAuth -and $landlordAuth.token) {
    $landlordToken = $landlordAuth.token
    Write-Host "   Landlord Token: $($landlordToken.Substring(0,20))..." -ForegroundColor Gray
}

if ($studentAuth -and $studentAuth.token) {
    $studentToken = $studentAuth.token
    Write-Host "   Student Token: $($studentToken.Substring(0,20))..." -ForegroundColor Gray
}

# 4. Test Token Validation
Write-Host "`n🎫 Phase 4: Token Validation" -ForegroundColor Cyan

if ($landlordToken) {
    $landlordHeaders = @{ "Authorization" = "Bearer $landlordToken" }
    $landlordProfile = Test-API "Landlord Profile Access" "$API_BASE/api/auth/me" "GET" $null $landlordHeaders
}

if ($studentToken) {
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    $studentProfile = Test-API "Student Profile Access" "$API_BASE/api/auth/me" "GET" $null $studentHeaders
}

# 5. Test Property Creation (Landlord Only)
Write-Host "`n🏠 Phase 5: Property Management" -ForegroundColor Cyan

if ($landlordToken) {
    $propertyData = @{
        title = "Test Property"
        description = "A beautiful test property"
        rent = 25000
        location = "Mumbai"
        propertyType = "APARTMENT"
        roomType = "2BHK"
        address = "123 Test Street"
        amenities = @("WIFI", "PARKING")
        rules = @{
            smoking = $false
            drinking = $false
            pets = $true
            visitors = $true
        }
        contactInfo = @{
            phone = "+91-9876543210"
            whatsapp = "+91-9876543210"
            email = "landlord@test.com"
        }
    }
    
    $landlordHeaders = @{ "Authorization" = "Bearer $landlordToken" }
    $newProperty = Test-API "Property Creation" "$API_BASE/api/properties" "POST" $propertyData $landlordHeaders
    
    if ($newProperty -and $newProperty.property) {
        $propertyId = $newProperty.property.id
        Write-Host "   Property ID: $propertyId" -ForegroundColor Gray
        
        # Test Property Retrieval
        $property = Test-API "Property Retrieval" "$API_BASE/api/properties/$propertyId"
        
        # Test Landlord Properties List
        $myProperties = Test-API "Landlord Properties List" "$API_BASE/api/properties/my-properties" "GET" $null $landlordHeaders
    }
}

# 6. Test Property Search (Public)
Write-Host "`n🔍 Phase 6: Property Search" -ForegroundColor Cyan
$allProperties = Test-API "Public Property Search" "$API_BASE/api/properties"

if ($allProperties) {
    Write-Host "   Found Properties: $($allProperties.data.properties.Count)" -ForegroundColor Gray
}

# 7. Test Student Functionality
Write-Host "`n🎓 Phase 7: Student Features" -ForegroundColor Cyan

if ($studentToken -and $propertyId) {
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    
    # Test Inquiry Creation
    $inquiryData = @{
        propertyId = $propertyId
        message = "I'm interested in this property"
        contactPreference = "EMAIL"
    }
    
    $inquiry = Test-API "Inquiry Creation" "$API_BASE/api/inquiries" "POST" $inquiryData $studentHeaders
    
    # Test Wishlist Operations
    $wishlistAdd = Test-API "Add to Wishlist" "$API_BASE/api/wishlist/$propertyId" "POST" $null $studentHeaders
    $wishlist = Test-API "Get Wishlist" "$API_BASE/api/wishlist" "GET" $null $studentHeaders
    $wishlistRemove = Test-API "Remove from Wishlist" "$API_BASE/api/wishlist/$propertyId" "DELETE" $null $studentHeaders
}

# 8. Test Frontend Pages
Write-Host "`n🌐 Phase 8: Frontend Testing" -ForegroundColor Cyan

$frontendPages = @(
    "$FRONTEND_BASE/",
    "$FRONTEND_BASE/auth/login",
    "$FRONTEND_BASE/auth/signup",
    "$FRONTEND_BASE/properties",
    "$FRONTEND_BASE/dashboard"
)

foreach ($page in $frontendPages) {
    try {
        $response = Invoke-WebRequest $page -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend Page: $page - SUCCESS" -ForegroundColor Green
            $script:totalTests++
            $script:passedTests++
        }
    }
    catch {
        Write-Host "❌ Frontend Page: $page - FAILED" -ForegroundColor Red
        $script:totalTests++
    }
}

# 9. Test Role-Based Access
Write-Host "`n🔒 Phase 9: Access Control" -ForegroundColor Cyan

if ($studentToken) {
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    
    # Student should NOT be able to create properties
    $unauthorizedProperty = @{
        title = "Unauthorized Property"
        description = "This should fail"
        rent = 10000
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/properties" -Method "POST" -Body ($unauthorizedProperty | ConvertTo-Json) -ContentType "application/json" -Headers $studentHeaders -TimeoutSec 10
        Write-Host "❌ Student Property Creation Block - FAILED (Should have been blocked)" -ForegroundColor Red
        $script:totalTests++
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 403) {
            Write-Host "✅ Student Property Creation Block - SUCCESS (Correctly blocked)" -ForegroundColor Green
            $script:passedTests++
        } else {
            Write-Host "❌ Student Property Creation Block - FAILED (Wrong error code: $statusCode)" -ForegroundColor Red
        }
        $script:totalTests++
    }
}

# Summary
Write-Host "`n📊 TESTING SUMMARY" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red

$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($successRate -ge 90) {
    Write-Host "`n🎉 EXCELLENT! All major functionality working!" -ForegroundColor Green
} elseif ($successRate -ge 70) {
    Write-Host "`n👍 GOOD! Minor issues need attention." -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️ ISSUES FOUND! Needs debugging." -ForegroundColor Red
}

Write-Host "`n✅ API Testing Complete!" -ForegroundColor Cyan
