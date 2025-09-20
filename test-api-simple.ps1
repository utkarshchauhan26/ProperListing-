# Simple ProperEase API Testing Script
Write-Host "ProperEase API Testing" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

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
        Write-Host "PASS: $testName" -ForegroundColor Green
        $script:passedTests++
        return $response
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Unknown" }
        Write-Host "FAIL: $testName (Status: $statusCode)" -ForegroundColor Red
        return $null
    }
}

# 1. Test Server Availability
Write-Host "`nPhase 1: Server Testing" -ForegroundColor Cyan
$serverInfo = Test-API "Backend Server" "$API_BASE/"
$dbInfo = Test-API "Database Connection" "$API_BASE/test-db"

if ($dbInfo) {
    Write-Host "   Database Status: $($dbInfo.database)" -ForegroundColor Green
    Write-Host "   Users: $($dbInfo.userCount), Properties: $($dbInfo.propertyCount)" -ForegroundColor Gray
}

# 2. Test User Registration
Write-Host "`nPhase 2: User Registration" -ForegroundColor Cyan

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
Write-Host "`nPhase 3: User Authentication" -ForegroundColor Cyan

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
$propertyId = ""

if ($landlordAuth -and $landlordAuth.token) {
    $landlordToken = $landlordAuth.token
    Write-Host "   Landlord Token: $($landlordToken.Substring(0,20))..." -ForegroundColor Gray
}

if ($studentAuth -and $studentAuth.token) {
    $studentToken = $studentAuth.token
    Write-Host "   Student Token: $($studentToken.Substring(0,20))..." -ForegroundColor Gray
}

# 4. Test Property Creation (Landlord Only)
Write-Host "`nPhase 4: Property Management" -ForegroundColor Cyan

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

# 5. Test Student Functionality
Write-Host "`nPhase 5: Student Features" -ForegroundColor Cyan

if ($studentToken -and $propertyId) {
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    
    # Test Inquiry Creation
    $inquiryData = @{
        propertyId = $propertyId
        message = "I am interested in this property"
        contactPreference = "EMAIL"
    }
    
    $inquiry = Test-API "Inquiry Creation" "$API_BASE/api/inquiries" "POST" $inquiryData $studentHeaders
    
    # Test Wishlist Operations
    $wishlistAdd = Test-API "Add to Wishlist" "$API_BASE/api/wishlist/$propertyId" "POST" $null $studentHeaders
    $wishlist = Test-API "Get Wishlist" "$API_BASE/api/wishlist" "GET" $null $studentHeaders
    $wishlistRemove = Test-API "Remove from Wishlist" "$API_BASE/api/wishlist/$propertyId" "DELETE" $null $studentHeaders
}

# 6. Test Property Search (Public)
Write-Host "`nPhase 6: Property Search" -ForegroundColor Cyan
$allProperties = Test-API "Public Property Search" "$API_BASE/api/properties"

if ($allProperties) {
    Write-Host "   Found Properties: $($allProperties.data.properties.Count)" -ForegroundColor Gray
}

# 7. Test Role-Based Access
Write-Host "`nPhase 7: Access Control" -ForegroundColor Cyan

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
        Write-Host "FAIL: Student Property Creation Block (Should have been blocked)" -ForegroundColor Red
        $script:totalTests++
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 403) {
            Write-Host "PASS: Student Property Creation Block (Correctly blocked)" -ForegroundColor Green
            $script:passedTests++
        } else {
            Write-Host "FAIL: Student Property Creation Block (Wrong error code: $statusCode)" -ForegroundColor Red
        }
        $script:totalTests++
    }
}

# 8. Test Property Deletion
Write-Host "`nPhase 8: Property Deletion" -ForegroundColor Cyan

if ($landlordToken -and $propertyId) {
    $landlordHeaders = @{ "Authorization" = "Bearer $landlordToken" }
    $deleteResult = Test-API "Property Deletion" "$API_BASE/api/properties/$propertyId" "DELETE" $null $landlordHeaders
}

# Summary
Write-Host "`nTESTING SUMMARY" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red

$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($successRate -ge 90) {
    Write-Host "`nEXCELLENT! All major functionality working!" -ForegroundColor Green
} elseif ($successRate -ge 70) {
    Write-Host "`nGOOD! Minor issues need attention." -ForegroundColor Yellow
} else {
    Write-Host "`nISSUES FOUND! Needs debugging." -ForegroundColor Red
}

Write-Host "`nAPI Testing Complete!" -ForegroundColor Cyan
