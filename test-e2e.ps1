# ProperEase End-to-End Functional Testing Script
# This script performs real-world testing scenarios

Write-Host "🧪 ProperEase End-to-End Functional Testing" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Test configuration
$API_BASE = "http://localhost:3001"
$FRONTEND_BASE = "http://localhost:3000"
$testResults = @()

# Test users data
$testUsers = @{
    landlord = @{
        email = "landlord@test.com"
        password = "Test123!@#"
        name = "John Landlord"
        userType = "LANDLORD"
        whatsapp = "+91-9876543210"
    }
    student = @{
        email = "student@test.com"
        password = "Test123!@#"
        name = "Jane Student"
        userType = "STUDENT"
    }
}

# Global variables for tokens
$landlordToken = ""
$studentToken = ""

function Write-TestResult {
    param($testName, $status, $message)
    $result = @{
        Test = $testName
        Status = $status
        Message = $message
        Timestamp = Get-Date
    }
    $testResults += $result
    
    if ($status -eq "PASS") {
        Write-Host "✅ $testName - PASS: $message" -ForegroundColor Green
    } else {
        Write-Host "❌ $testName - FAIL: $message" -ForegroundColor Red
    }
}

function Invoke-APIRequest {
    param($url, $method = "GET", $headers = @{}, $body = $null)
    
    try {
        $requestParams = @{
            Uri = $url
            Method = $method
            Headers = $headers
            ContentType = "application/json"
            TimeoutSec = 30
        }
        
        if ($body) {
            $requestParams.Body = $body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @requestParams
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $statusCode }
    }
}

function Test-ServerAvailability {
    Write-Host "`n🔍 Phase 1: Server Availability Testing" -ForegroundColor Yellow
    
    # Test Backend Server
    $result = Invoke-APIRequest "$API_BASE/"
    if ($result.Success) {
        Write-TestResult "Backend Server" "PASS" "Server is running and responding"
    } else {
        Write-TestResult "Backend Server" "FAIL" "Server not accessible: $($result.Error)"
        return $false
    }
    
    # Test Database Connection
    $result = Invoke-APIRequest "$API_BASE/test-db"
    if ($result.Success -and $result.Data.success) {
        Write-TestResult "Database Connection" "PASS" "Database connected successfully"
    } else {
        Write-TestResult "Database Connection" "FAIL" "Database connection failed"
        return $false
    }
    
    # Test Frontend Server
    try {
        $response = Invoke-WebRequest "$FRONTEND_BASE/" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-TestResult "Frontend Server" "PASS" "Frontend is accessible"
        } else {
            Write-TestResult "Frontend Server" "FAIL" "Frontend returned status: $($response.StatusCode)"
        }
    } catch {
        Write-TestResult "Frontend Server" "FAIL" "Frontend not accessible: $($_.Exception.Message)"
    }
    
    return $true
}

function Test-UserRegistration {
    Write-Host "`n👤 Phase 2: User Registration Testing" -ForegroundColor Yellow
    
    # Register Landlord
    $landlordData = $testUsers.landlord
    $result = Invoke-APIRequest "$API_BASE/api/auth/signup" "POST" @{} $landlordData
    
    if ($result.Success) {
        Write-TestResult "Landlord Registration" "PASS" "Landlord registered successfully"
    } else {
        Write-TestResult "Landlord Registration" "FAIL" "Registration failed: $($result.Error)"
    }
    
    # Register Student
    $studentData = $testUsers.student
    $result = Invoke-APIRequest "$API_BASE/api/auth/signup" "POST" @{} $studentData
    
    if ($result.Success) {
        Write-TestResult "Student Registration" "PASS" "Student registered successfully"
    } else {
        Write-TestResult "Student Registration" "FAIL" "Registration failed: $($result.Error)"
    }
    
    # Test Duplicate Email Registration
    $result = Invoke-APIRequest "$API_BASE/api/auth/signup" "POST" @{} $landlordData
    
    if (!$result.Success -and $result.StatusCode -eq 400) {
        Write-TestResult "Duplicate Email Prevention" "PASS" "Duplicate email correctly rejected"
    } else {
        Write-TestResult "Duplicate Email Prevention" "FAIL" "Duplicate email not handled properly"
    }
}

function Test-UserAuthentication {
    Write-Host "`n🔐 Phase 3: Authentication Testing" -ForegroundColor Yellow
    
    # Test Landlord Login
    $loginData = @{
        email = $testUsers.landlord.email
        password = $testUsers.landlord.password
    }
    
    $result = Invoke-APIRequest "$API_BASE/api/auth/signin" "POST" @{} $loginData
    
    if ($result.Success -and $result.Data.token) {
        $script:landlordToken = $result.Data.token
        Write-TestResult "Landlord Login" "PASS" "Landlord login successful"
    } else {
        Write-TestResult "Landlord Login" "FAIL" "Login failed: $($result.Error)"
        return $false
    }
    
    # Test Student Login
    $loginData = @{
        email = $testUsers.student.email
        password = $testUsers.student.password
    }
    
    $result = Invoke-APIRequest "$API_BASE/api/auth/signin" "POST" @{} $loginData
    
    if ($result.Success -and $result.Data.token) {
        $script:studentToken = $result.Data.token
        Write-TestResult "Student Login" "PASS" "Student login successful"
    } else {
        Write-TestResult "Student Login" "FAIL" "Login failed: $($result.Error)"
        return $false
    }
    
    # Test Invalid Login
    $invalidLogin = @{
        email = "invalid@test.com"
        password = "wrongpassword"
    }
    
    $result = Invoke-APIRequest "$API_BASE/api/auth/signin" "POST" @{} $invalidLogin
    
    if (!$result.Success -and $result.StatusCode -eq 401) {
        Write-TestResult "Invalid Login Prevention" "PASS" "Invalid credentials correctly rejected"
    } else {
        Write-TestResult "Invalid Login Prevention" "FAIL" "Invalid login not handled properly"
    }
    
    return $true
}

function Test-TokenValidation {
    Write-Host "`n🎫 Phase 4: Token Validation Testing" -ForegroundColor Yellow
    
    # Test Valid Token Access
    $headers = @{ "Authorization" = "Bearer $landlordToken" }
    $result = Invoke-APIRequest "$API_BASE/api/auth/me" "GET" $headers
    
    if ($result.Success -and $result.Data.user) {
        Write-TestResult "Valid Token Access" "PASS" "Token validation successful"
    } else {
        Write-TestResult "Valid Token Access" "FAIL" "Token validation failed"
    }
    
    # Test Invalid Token
    $headers = @{ "Authorization" = "Bearer invalid_token_here" }
    $result = Invoke-APIRequest "$API_BASE/api/auth/me" "GET" $headers
    
    if (!$result.Success -and $result.StatusCode -eq 401) {
        Write-TestResult "Invalid Token Rejection" "PASS" "Invalid token correctly rejected"
    } else {
        Write-TestResult "Invalid Token Rejection" "FAIL" "Invalid token not handled properly"
    }
    
    # Test Protected Route Without Token
    $result = Invoke-APIRequest "$API_BASE/api/properties/my-properties" "GET"
    
    if (!$result.Success -and $result.StatusCode -eq 401) {
        Write-TestResult "Protected Route Access" "PASS" "Protected route correctly requires authentication"
    } else {
        Write-TestResult "Protected Route Access" "FAIL" "Protected route accessible without authentication"
    }
}

function Test-PropertyManagement {
    Write-Host "`n🏠 Phase 5: Property Management Testing" -ForegroundColor Yellow
    
    # Test Property Creation (Landlord)
    $propertyData = @{
        title = "Test Property 1"
        description = "This is a test property for automated testing"
        rent = 25000
        location = "Test Location"
        propertyType = "APARTMENT"
        roomType = "2BHK"
        address = "123 Test Street, Test City"
        amenities = @("WIFI", "PARKING", "GYM")
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
    
    $headers = @{ "Authorization" = "Bearer $landlordToken" }
    $result = Invoke-APIRequest "$API_BASE/api/properties" "POST" $headers $propertyData
    
    if ($result.Success -and $result.Data.property) {
        $propertyId = $result.Data.property.id
        Write-TestResult "Property Creation" "PASS" "Property created successfully"
        
        # Test Property Retrieval
        $result = Invoke-APIRequest "$API_BASE/api/properties/$propertyId"
        
        if ($result.Success -and $result.Data.property) {
            Write-TestResult "Property Retrieval" "PASS" "Property retrieved successfully"
        } else {
            Write-TestResult "Property Retrieval" "FAIL" "Property retrieval failed"
        }
        
        # Test Property Update
        $updateData = @{
            title = "Updated Test Property 1"
            rent = 27000
        }
        
        $result = Invoke-APIRequest "$API_BASE/api/properties/$propertyId" "PUT" $headers $updateData
        
        if ($result.Success) {
            Write-TestResult "Property Update" "PASS" "Property updated successfully"
        } else {
            Write-TestResult "Property Update" "FAIL" "Property update failed"
        }
        
        # Test Landlord Properties List
        $result = Invoke-APIRequest "$API_BASE/api/properties/my-properties" "GET" $headers
        
        if ($result.Success -and $result.Data.properties) {
            Write-TestResult "Landlord Properties List" "PASS" "Properties list retrieved successfully"
        } else {
            Write-TestResult "Landlord Properties List" "FAIL" "Properties list retrieval failed"
        }
        
        return $propertyId
    } else {
        Write-TestResult "Property Creation" "FAIL" "Property creation failed: $($result.Error)"
        return $null
    }
}

function Test-StudentFunctionality {
    param($propertyId)
    
    Write-Host "`n🎓 Phase 6: Student Functionality Testing" -ForegroundColor Yellow
    
    if (!$propertyId) {
        Write-TestResult "Student Testing" "SKIP" "No property available for testing"
        return
    }
    
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    
    # Test Property Search/List
    $result = Invoke-APIRequest "$API_BASE/api/properties"
    
    if ($result.Success -and $result.Data.properties) {
        Write-TestResult "Property Search" "PASS" "Properties list accessible to students"
    } else {
        Write-TestResult "Property Search" "FAIL" "Property search failed"
    }
    
    # Test Property Details
    $result = Invoke-APIRequest "$API_BASE/api/properties/$propertyId"
    
    if ($result.Success -and $result.Data.property) {
        Write-TestResult "Property Details Access" "PASS" "Property details accessible to students"
    } else {
        Write-TestResult "Property Details Access" "FAIL" "Property details access failed"
    }
    
    # Test Inquiry Creation
    $inquiryData = @{
        propertyId = $propertyId
        message = "I'm interested in this property. Can we schedule a visit?"
        contactPreference = "EMAIL"
    }
    
    $result = Invoke-APIRequest "$API_BASE/api/inquiries" "POST" $studentHeaders $inquiryData
    
    if ($result.Success) {
        Write-TestResult "Inquiry Creation" "PASS" "Inquiry sent successfully"
        
        # Test Student Inquiries List
        $result = Invoke-APIRequest "$API_BASE/api/inquiries/my-inquiries" "GET" $studentHeaders
        
        if ($result.Success) {
            Write-TestResult "Student Inquiries List" "PASS" "Student inquiries retrieved successfully"
        } else {
            Write-TestResult "Student Inquiries List" "FAIL" "Student inquiries retrieval failed"
        }
    } else {
        Write-TestResult "Inquiry Creation" "FAIL" "Inquiry creation failed: $($result.Error)"
    }
    
    # Test Wishlist Addition
    $result = Invoke-APIRequest "$API_BASE/api/wishlist/$propertyId" "POST" $studentHeaders
    
    if ($result.Success) {
        Write-TestResult "Wishlist Addition" "PASS" "Property added to wishlist successfully"
        
        # Test Wishlist Retrieval
        $result = Invoke-APIRequest "$API_BASE/api/wishlist" "GET" $studentHeaders
        
        if ($result.Success) {
            Write-TestResult "Wishlist Retrieval" "PASS" "Wishlist retrieved successfully"
        } else {
            Write-TestResult "Wishlist Retrieval" "FAIL" "Wishlist retrieval failed"
        }
        
        # Test Wishlist Removal
        $result = Invoke-APIRequest "$API_BASE/api/wishlist/$propertyId" "DELETE" $studentHeaders
        
        if ($result.Success) {
            Write-TestResult "Wishlist Removal" "PASS" "Property removed from wishlist successfully"
        } else {
            Write-TestResult "Wishlist Removal" "FAIL" "Wishlist removal failed"
        }
    } else {
        Write-TestResult "Wishlist Addition" "FAIL" "Wishlist addition failed: $($result.Error)"
    }
}

function Test-LandlordInquiries {
    param($propertyId)
    
    Write-Host "`n📬 Phase 7: Landlord Inquiry Management Testing" -ForegroundColor Yellow
    
    if (!$propertyId) {
        Write-TestResult "Landlord Inquiry Testing" "SKIP" "No property available for testing"
        return
    }
    
    $landlordHeaders = @{ "Authorization" = "Bearer $landlordToken" }
    
    # Test Property Inquiries List
    $result = Invoke-APIRequest "$API_BASE/api/inquiries/property/$propertyId" "GET" $landlordHeaders
    
    if ($result.Success) {
        Write-TestResult "Property Inquiries List" "PASS" "Property inquiries retrieved successfully"
    } else {
        Write-TestResult "Property Inquiries List" "FAIL" "Property inquiries retrieval failed"
    }
}

function Test-RoleBasedAccess {
    Write-Host "`n🔒 Phase 8: Role-Based Access Control Testing" -ForegroundColor Yellow
    
    $studentHeaders = @{ "Authorization" = "Bearer $studentToken" }
    
    # Test Student Cannot Create Property
    $propertyData = @{
        title = "Unauthorized Property"
        description = "This should fail"
        rent = 10000
    }
    
    $result = Invoke-APIRequest "$API_BASE/api/properties" "POST" $studentHeaders $propertyData
    
    if (!$result.Success -and $result.StatusCode -eq 403) {
        Write-TestResult "Student Property Creation Block" "PASS" "Student correctly prevented from creating properties"
    } else {
        Write-TestResult "Student Property Creation Block" "FAIL" "Student should not be able to create properties"
    }
    
    # Test Student Cannot Access Landlord Properties
    $result = Invoke-APIRequest "$API_BASE/api/properties/my-properties" "GET" $studentHeaders
    
    if (!$result.Success -and $result.StatusCode -eq 403) {
        Write-TestResult "Student Landlord Access Block" "PASS" "Student correctly prevented from accessing landlord features"
    } else {
        Write-TestResult "Student Landlord Access Block" "FAIL" "Student should not access landlord features"
    }
}

function Test-PropertyDeletion {
    param($propertyId)
    
    Write-Host "`n🗑️ Phase 9: Property Deletion Testing" -ForegroundColor Yellow
    
    if (!$propertyId) {
        Write-TestResult "Property Deletion Testing" "SKIP" "No property available for testing"
        return
    }
    
    $landlordHeaders = @{ "Authorization" = "Bearer $landlordToken" }
    
    # Test Property Deletion
    $result = Invoke-APIRequest "$API_BASE/api/properties/$propertyId" "DELETE" $landlordHeaders
    
    if ($result.Success) {
        Write-TestResult "Property Deletion" "PASS" "Property deleted successfully"
        
        # Verify Property No Longer Exists
        $result = Invoke-APIRequest "$API_BASE/api/properties/$propertyId"
        
        if (!$result.Success -and $result.StatusCode -eq 404) {
            Write-TestResult "Property Deletion Verification" "PASS" "Deleted property correctly not found"
        } else {
            Write-TestResult "Property Deletion Verification" "FAIL" "Deleted property still accessible"
        }
    } else {
        Write-TestResult "Property Deletion" "FAIL" "Property deletion failed: $($result.Error)"
    }
}

function Test-FrontendPages {
    Write-Host "`n🌐 Phase 10: Frontend Page Testing" -ForegroundColor Yellow
    
    $pages = @(
        @{url="$FRONTEND_BASE/"; name="Homepage"},
        @{url="$FRONTEND_BASE/auth/login"; name="Login Page"},
        @{url="$FRONTEND_BASE/auth/signup"; name="Signup Page"},
        @{url="$FRONTEND_BASE/properties"; name="Properties Page"},
        @{url="$FRONTEND_BASE/dashboard"; name="Dashboard Page"},
        @{url="$FRONTEND_BASE/list-property"; name="List Property Page"},
        @{url="$FRONTEND_BASE/wishlist"; name="Wishlist Page"}
    )
    
    foreach ($page in $pages) {
        try {
            $response = Invoke-WebRequest $page.url -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-TestResult "$($page.name) Accessibility" "PASS" "Page loads successfully"
            } else {
                Write-TestResult "$($page.name) Accessibility" "FAIL" "Page returned status: $($response.StatusCode)"
            }
        } catch {
            Write-TestResult "$($page.name) Accessibility" "FAIL" "Page not accessible: $($_.Exception.Message)"
        }
    }
}

function Generate-TestReport {
    Write-Host "`n📊 Test Results Summary" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    
    $totalTests = $testResults.Count
    $passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
    $failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
    $skippedTests = ($testResults | Where-Object { $_.Status -eq "SKIP" }).Count
    
    $successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }
    
    Write-Host "Total Tests: $totalTests" -ForegroundColor White
    Write-Host "Passed: $passedTests" -ForegroundColor Green
    Write-Host "Failed: $failedTests" -ForegroundColor Red
    Write-Host "Skipped: $skippedTests" -ForegroundColor Yellow
    Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })
    
    # Create detailed report file
    $reportContent = @"
# ProperEase End-to-End Testing Report

**Date:** $(Get-Date)
**Total Tests:** $totalTests
**Passed:** $passedTests
**Failed:** $failedTests
**Skipped:** $skippedTests
**Success Rate:** $successRate%

## Detailed Results:

"@
    
    foreach ($result in $testResults) {
        $status = if ($result.Status -eq "PASS") { "✅" } elseif ($result.Status -eq "FAIL") { "❌" } else { "⏭️" }
        $reportContent += "$status **$($result.Test)**: $($result.Message)`n"
    }
    
    $reportContent | Out-File -FilePath "E2E_TEST_REPORT.md" -Encoding UTF8
    
    Write-Host "`nDetailed report saved to: E2E_TEST_REPORT.md" -ForegroundColor Cyan
    
    if ($successRate -ge 90) {
        Write-Host "`n🎉 EXCELLENT! Project is production ready!" -ForegroundColor Green
    } elseif ($successRate -ge 70) {
        Write-Host "`n⚠️ GOOD! Some issues need attention." -ForegroundColor Yellow
    } else {
        Write-Host "`n🚨 CRITICAL! Major issues found!" -ForegroundColor Red
    }
}

# Main Testing Execution
Write-Host "Starting comprehensive end-to-end testing..." -ForegroundColor White

# Check if servers are running
if (!(Test-ServerAvailability)) {
    Write-Host "❌ Servers not available. Please start both backend and frontend servers first." -ForegroundColor Red
    exit 1
}

# Run all test phases
Test-UserRegistration
$authSuccess = Test-UserAuthentication

if ($authSuccess) {
    Test-TokenValidation
    $propertyId = Test-PropertyManagement
    Test-StudentFunctionality $propertyId
    Test-LandlordInquiries $propertyId
    Test-RoleBasedAccess
    Test-PropertyDeletion $propertyId
} else {
    Write-Host "❌ Authentication tests failed. Skipping dependent tests." -ForegroundColor Red
}

Test-FrontendPages
Generate-TestReport

Write-Host "`n✅ End-to-end testing completed!" -ForegroundColor Green
