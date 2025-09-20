# ProperEase Auth Fix Test
Write-Host "=== AUTH FIX VERIFICATION ===" -ForegroundColor Green

$baseUrl = "http://localhost:3001"
$frontendUrl = "http://localhost:3000"

# Test 1: Backend Auth
Write-Host "`nTesting backend authentication..." -ForegroundColor Yellow

$timestamp = (Get-Date).Ticks
$testEmail = "authtest-$timestamp@test.com"

$registerData = @{
    name = "Auth Test User"
    email = $testEmail
    password = "AuthTest123!"
    userType = "LANDLORD"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/signup" -Method POST -Body $registerData -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success -and $data.user.userType -eq "LANDLORD") {
        Write-Host "✅ Registration: LANDLORD role preserved" -ForegroundColor Green
    } else {
        Write-Host "❌ Registration failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Registration error" -ForegroundColor Red
}

$loginData = @{
    email = $testEmail
    password = "AuthTest123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/signin" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success -and $data.user.userType -eq "LANDLORD") {
        Write-Host "✅ Login: LANDLORD role preserved" -ForegroundColor Green
        $token = $data.token
    } else {
        Write-Host "❌ Login failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Login error" -ForegroundColor Red
}

# Test 2: Profile endpoint
Write-Host "`nTesting profile endpoint..." -ForegroundColor Yellow
if ($token) {
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers -UseBasicParsing
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success -and $data.user.userType -eq "LANDLORD") {
            Write-Host "✅ Profile endpoint working" -ForegroundColor Green
        } else {
            Write-Host "❌ Profile endpoint failed" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Profile error" -ForegroundColor Red
    }
}

# Test 3: Frontend pages
Write-Host "`nTesting frontend pages..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -UseBasicParsing
    Write-Host "✅ Homepage: HTTP $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Homepage error" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "$frontendUrl/profile" -Method GET -UseBasicParsing
    Write-Host "✅ Profile page: HTTP $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*302*") {
        Write-Host "✅ Profile page: Redirect (expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Profile page error" -ForegroundColor Red
    }
}

Write-Host "`n=== FIXES APPLIED ===" -ForegroundColor Cyan
Write-Host "✅ Removed NextAuth conflicts" -ForegroundColor Green
Write-Host "✅ Created profile page" -ForegroundColor Green
Write-Host "✅ Added auth debugging" -ForegroundColor Green
Write-Host "✅ Fixed provider conflicts" -ForegroundColor Green

Write-Host "`n🎯 NEXT: Test in browser at http://localhost:3000" -ForegroundColor Yellow
