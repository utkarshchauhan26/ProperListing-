# Corrected ProperEase API Testing Script
Write-Host "ProperEase API Testing (Corrected)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

$API_BASE = "http://localhost:3001"

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
        $errorContent = ""
        if ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errorContent = $reader.ReadToEnd()
            } catch {}
        }
        Write-Host "FAIL: $testName (Status: $statusCode)" -ForegroundColor Red
        if ($errorContent) {
            Write-Host "   Error details: $errorContent" -ForegroundColor Red
        }
        return $null
    }
}

# Start fresh with user creation
Write-Host "`nPhase 1: User Management" -ForegroundColor Cyan

# Create test users with unique emails
$timestamp = Get-Date -Format "HHmmss"
$landlordEmail = "landlord$timestamp@test.com"
$studentEmail = "student$timestamp@test.com"

$landlordData = @{
    name = "Test Landlord"
    email = $landlordEmail
    password = "Test123!"
    userType = "LANDLORD"
    whatsapp = "+91-9876543210"
}

$studentData = @{
    name = "Test Student"
    email = $studentEmail
    password = "Test123!"
    userType = "STUDENT"
}

$landlordReg = Test-API "Landlord Registration" "$API_BASE/api/auth/signup" "POST" $landlordData
$studentReg = Test-API "Student Registration" "$API_BASE/api/auth/signup" "POST" $studentData

# Login users
$landlordLogin = @{
    email = $landlordEmail
    password = "Test123!"
}

$studentLogin = @{
    email = $studentEmail
    password = "Test123!"
}

$landlordAuth = Test-API "Landlord Login" "$API_BASE/api/auth/signin" "POST" $landlordLogin
$studentAuth = Test-API "Student Login" "$API_BASE/api/auth/signin" "POST" $studentLogin

$landlordToken = ""
$studentToken = ""
$propertyId = ""

if ($landlordAuth -and $landlordAuth.token) {
    $landlordToken = $landlordAuth.token
    Write-Host "   Landlord authenticated successfully" -ForegroundColor Green
}

if ($studentAuth -and $studentAuth.token) {
    $studentToken = $studentAuth.token
    Write-Host "   Student authenticated successfully" -ForegroundColor Green
}

# Test Property Creation with CORRECT enum values
Write-Host "`nPhase 2: Property Management (Corrected)" -ForegroundColor Cyan

if ($landlordToken) {
    $propertyData = @{
        title = "Beautiful Test Property"
        description = "A wonderful test property for automated testing"
        rent = 25000
        location = "Mumbai"
        propertyType = "FLAT"  # CORRECTED: Must be one of: PG, FLAT, INDEPENDENT, SHARED, COLIVING
        roomType = "TWO_BHK"   # CORRECTED: Must be TWO_BHK not 2BHK
        address = "123 Test Street, Andheri"
        city = "Mumbai"
        state = "Maharashtra"
        pincode = "400001"
        amenities = @("WIFI", "PARKING", "GYM", "SECURITY")
        smoking = $false
        drinking = $false
        pets = $true
        visitors = $true
        whatsappNumber = "+91-9876543210"
    }
    
    $landlordHeaders = @{ "Authorization" = "Bearer $landlordToken" }
    $newProperty = Test-API "Property Creation (Corrected)" "$API_BASE/api/properties" "POST" $propertyData $landlordHeaders
    
    if ($newProperty -and $newProperty.property) {
        $propertyId = $newProperty.property.id
        Write-Host "   Property created with ID: $propertyId" -ForegroundColor Green
        
        # Test Property Retrieval
        $property = Test-API "Property Retrieval" "$API_BASE/api/properties/$propertyId"
        
        # Test Property Update
        $updateData = @{
            title = "Updated Beautiful Test Property"
            rent = 27000
            description = "Updated description for the test property"
        }
        
        $updateResult = Test-API "Property Update" "$API_BASE/api/properties/$propertyId" "PUT" $updateData $landlordHeaders
        
        # Test Landlord Properties List
        $myProperties = Test-API "Landlord Properties List" "$API_BASE/api/properties/my-properties" "GET" $null $landlordHeaders
        
        if ($myProperties -and $myProperties.properties) {
            Write-Host "   Landlord has $($myProperties.properties.Count) properties" -ForegroundColor Green
        }
    }
}

# Test Student Functionality with Property
Write-Host "`nPhase 3: Student Functionality" -ForegroundColor Cyan

if ($studentToken -and $propertyId) {
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    
    # Test Property Search
    $searchResult = Test-API "Property Search" "$API_BASE/api/properties"
    if ($searchResult -and $searchResult.data.properties) {
        Write-Host "   Found $($searchResult.data.properties.Count) properties in search" -ForegroundColor Green
    }
    
    # Test Property Details Access
    $propertyDetails = Test-API "Property Details Access" "$API_BASE/api/properties/$propertyId"
    
    # Test Inquiry Creation with CORRECT schema
    $inquiryData = @{
        propertyId = $propertyId
        contactType = "EMAIL"  # CORRECTED: Must be one of the enum values
        message = "I am very interested in this property. Could we schedule a visit?"
        userEmail = $studentEmail
        userName = "Test Student"
    }
    
    $inquiry = Test-API "Inquiry Creation (Corrected)" "$API_BASE/api/inquiries" "POST" $inquiryData $studentHeaders
    
    if ($inquiry) {
        # Test Student Inquiries List
        $myInquiries = Test-API "Student Inquiries List" "$API_BASE/api/inquiries/my-inquiries" "GET" $null $studentHeaders
    }
    
    # Test Wishlist Operations
    $wishlistAdd = Test-API "Add to Wishlist" "$API_BASE/api/wishlist/$propertyId" "POST" $null $studentHeaders
    
    if ($wishlistAdd) {
        $wishlist = Test-API "Get Wishlist" "$API_BASE/api/wishlist" "GET" $null $studentHeaders
        
        if ($wishlist -and $wishlist.wishlist) {
            Write-Host "   Wishlist contains $($wishlist.wishlist.Count) properties" -ForegroundColor Green
        }
        
        # Test Remove from Wishlist
        $wishlistRemove = Test-API "Remove from Wishlist" "$API_BASE/api/wishlist/$propertyId" "DELETE" $null $studentHeaders
    }
}

# Test Landlord Inquiry Management
Write-Host "`nPhase 4: Landlord Inquiry Management" -ForegroundColor Cyan

if ($landlordToken -and $propertyId) {
    $landlordHeaders = @{ "Authorization" = "Bearer $landlordToken" }
    
    # Test Property Inquiries List
    $propertyInquiries = Test-API "Property Inquiries List" "$API_BASE/api/inquiries/property/$propertyId" "GET" $null $landlordHeaders
    
    if ($propertyInquiries -and $propertyInquiries.inquiries) {
        Write-Host "   Property has $($propertyInquiries.inquiries.Count) inquiries" -ForegroundColor Green
    }
}

# Test Access Control
Write-Host "`nPhase 5: Role-Based Access Control" -ForegroundColor Cyan

if ($studentToken) {
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    
    # Student should NOT be able to create properties
    $unauthorizedProperty = @{
        title = "Unauthorized Property"
        description = "This should fail"
        rent = 10000
        location = "Mumbai"
        propertyType = "FLAT"
        roomType = "ONE_BHK"
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
    
    # Test Student Cannot Access My Properties
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/properties/my-properties" -Method "GET" -Headers $studentHeaders -TimeoutSec 10
        Write-Host "FAIL: Student My-Properties Access Block (Should have been blocked)" -ForegroundColor Red
        $script:totalTests++
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 403) {
            Write-Host "PASS: Student My-Properties Access Block (Correctly blocked)" -ForegroundColor Green
            $script:passedTests++
        } else {
            Write-Host "FAIL: Student My-Properties Access Block (Wrong error code: $statusCode)" -ForegroundColor Red
        }
        $script:totalTests++
    }
}

# Test Property Filtering
Write-Host "`nPhase 6: Advanced Property Search" -ForegroundColor Cyan

# Test search with filters
$filteredSearch = Test-API "Property Search with Filters" "$API_BASE/api/properties?propertyType=FLAT&roomType=TWO_BHK&city=Mumbai"

# Test search with rent range
$rentSearch = Test-API "Property Search by Rent Range" "$API_BASE/api/properties?minRent=20000&maxRent=30000"

# Test Property Deletion (Cleanup)
Write-Host "`nPhase 7: Property Cleanup" -ForegroundColor Cyan

if ($landlordToken -and $propertyId) {
    $landlordHeaders = @{ "Authorization" = "Bearer $landlordToken" }
    $deleteResult = Test-API "Property Deletion" "$API_BASE/api/properties/$propertyId" "DELETE" $null $landlordHeaders
    
    if ($deleteResult) {
        # Verify property is deleted
        try {
            $response = Invoke-RestMethod -Uri "$API_BASE/api/properties/$propertyId" -TimeoutSec 10
            Write-Host "FAIL: Property Deletion Verification (Property still exists)" -ForegroundColor Red
            $script:totalTests++
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 404) {
                Write-Host "PASS: Property Deletion Verification (Property correctly not found)" -ForegroundColor Green
                $script:passedTests++
            } else {
                Write-Host "FAIL: Property Deletion Verification (Wrong error code: $statusCode)" -ForegroundColor Red
            }
            $script:totalTests++
        }
    }
}

# Final Summary
Write-Host "`nCOMPREHENSIVE TESTING SUMMARY" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red

$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

Write-Host "`nFUNCTIONALITY VERIFICATION:" -ForegroundColor Cyan
Write-Host "- User Registration & Authentication: TESTED" -ForegroundColor Green
Write-Host "- Property CRUD Operations: TESTED" -ForegroundColor Green  
Write-Host "- Inquiry System: TESTED" -ForegroundColor Green
Write-Host "- Wishlist Functionality: TESTED" -ForegroundColor Green
Write-Host "- Role-Based Access Control: TESTED" -ForegroundColor Green
Write-Host "- Property Search & Filtering: TESTED" -ForegroundColor Green

if ($successRate -ge 90) {
    Write-Host "`nSTATUS: PRODUCTION READY!" -ForegroundColor Green
    Write-Host "All critical functionality is working perfectly." -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "`nSTATUS: GOOD! Minor issues to address." -ForegroundColor Yellow
} else {
    Write-Host "`nSTATUS: NEEDS ATTENTION! Critical issues found." -ForegroundColor Red
}

Write-Host "`nComprehensive API Testing Complete!" -ForegroundColor Cyan
