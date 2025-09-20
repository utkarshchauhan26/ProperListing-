# ProperEase Manual Testing Guide
# This script guides through manual testing scenarios

Write-Host "🧪 ProperEase Manual Testing Guide" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

Write-Host "`nThis script will guide you through manual testing scenarios." -ForegroundColor Yellow
Write-Host "Please ensure both servers are running before starting." -ForegroundColor Yellow

# Check servers
Write-Host "`n🔍 Checking server availability..." -ForegroundColor White

try {
    $backendCheck = Invoke-RestMethod "http://localhost:3001/" -TimeoutSec 5
    Write-Host "✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server not accessible" -ForegroundColor Red
    Write-Host "Please start with: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

try {
    $frontendCheck = Invoke-WebRequest "http://localhost:3000/" -TimeoutSec 5
    Write-Host "✅ Frontend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend server not accessible" -ForegroundColor Red
    Write-Host "Please start with: cd frontend && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Manual testing scenarios
$testScenarios = @(
    @{
        title = "User Registration Testing"
        description = "Test user registration for both student and landlord"
        steps = @(
            "1. Open http://localhost:3000/auth/signup",
            "2. Register as Student:",
            "   - Name: Test Student",
            "   - Email: student@test.com",
            "   - Password: Test123!",
            "   - User Type: Student",
            "3. Register as Landlord:",
            "   - Name: Test Landlord", 
            "   - Email: landlord@test.com",
            "   - Password: Test123!",
            "   - User Type: Landlord",
            "   - WhatsApp: +91-9876543210",
            "4. Try registering with duplicate email (should fail)",
            "5. Try registering with invalid password (should fail)"
        )
        expectedResults = @(
            "✅ Student registration successful",
            "✅ Landlord registration successful",
            "✅ Duplicate email rejected",
            "✅ Invalid password rejected",
            "✅ Proper validation messages shown"
        )
    },
    @{
        title = "Login/Logout Testing"
        description = "Test login functionality and session management"
        steps = @(
            "1. Open http://localhost:3000/auth/login",
            "2. Login as Student (student@test.com / Test123!)",
            "3. Verify you're redirected to dashboard",
            "4. Check if navbar shows 'Student' role",
            "5. Logout and verify session cleared",
            "6. Login as Landlord (landlord@test.com / Test123!)",
            "7. Verify you're redirected to dashboard",
            "8. Check if navbar shows 'Landlord' role",
            "9. Try invalid credentials (should fail)",
            "10. Test 'Remember Me' functionality"
        )
        expectedResults = @(
            "✅ Student login successful",
            "✅ Proper role displayed",
            "✅ Logout clears session",
            "✅ Landlord login successful",
            "✅ Invalid credentials rejected",
            "✅ Session persistence works"
        )
    },
    @{
        title = "Property Creation (Landlord)"
        description = "Test property creation functionality"
        steps = @(
            "1. Login as Landlord",
            "2. Go to Dashboard -> Properties tab",
            "3. Click 'List New Property'",
            "4. Fill property form:",
            "   - Title: Test Property 1",
            "   - Description: Beautiful 2BHK apartment",
            "   - Rent: 25000",
            "   - Location: Mumbai",
            "   - Property Type: Apartment",
            "   - Room Type: 2BHK",
            "   - Address: 123 Test Street",
            "   - Select amenities: WiFi, Parking",
            "   - Set rules: No smoking, Pets allowed",
            "   - Add contact info",
            "5. Try uploading images",
            "6. Submit form",
            "7. Verify property appears in 'My Properties'",
            "8. Try creating property with missing fields (should fail)"
        )
        expectedResults = @(
            "✅ Property form accessible",
            "✅ All fields working properly",
            "✅ Image upload functional",
            "✅ Property created successfully",
            "✅ Property visible in My Properties",
            "✅ Form validation working"
        )
    },
    @{
        title = "Property Search (Student)"
        description = "Test property search and filtering"
        steps = @(
            "1. Logout and login as Student",
            "2. Go to Properties page",
            "3. Verify properties are listed",
            "4. Test search by location",
            "5. Test filter by property type",
            "6. Test filter by room type",
            "7. Test price range filter",
            "8. Test amenities filter",
            "9. Click on a property to view details"
        )
        expectedResults = @(
            "✅ Properties displayed correctly",
            "✅ Search functionality working",
            "✅ All filters working",
            "✅ Property details page accessible",
            "✅ Images display properly"
        )
    },
    @{
        title = "Property Details & Inquiry"
        description = "Test property details page and inquiry system"
        steps = @(
            "1. As Student, click on a property",
            "2. Verify all property details display",
            "3. Check image gallery functionality",
            "4. Test image lightbox/modal",
            "5. Fill inquiry form:",
            "   - Message: 'Interested in visiting'",
            "   - Contact preference: Email",
            "6. Submit inquiry",
            "7. Go to Dashboard -> My Inquiries",
            "8. Verify inquiry appears",
            "9. Test WhatsApp/Call buttons"
        )
        expectedResults = @(
            "✅ Property details complete",
            "✅ Image gallery working",
            "✅ Inquiry form functional",
            "✅ Inquiry submitted successfully",
            "✅ Inquiry visible in dashboard",
            "✅ Contact buttons working"
        )
    },
    @{
        title = "Wishlist Functionality"
        description = "Test wishlist add/remove functionality"
        steps = @(
            "1. As Student, browse properties",
            "2. Click 'Add to Wishlist' on a property",
            "3. Verify success message",
            "4. Go to Wishlist page",
            "5. Verify property appears in wishlist",
            "6. Remove property from wishlist",
            "7. Verify property removed",
            "8. Test wishlist from property details page",
            "9. Add multiple properties to wishlist"
        )
        expectedResults = @(
            "✅ Add to wishlist working",
            "✅ Wishlist page accessible",
            "✅ Remove from wishlist working",
            "✅ Multiple properties supported",
            "✅ Wishlist state persistent"
        )
    },
    @{
        title = "Landlord Inquiry Management"
        description = "Test landlord inquiry management"
        steps = @(
            "1. Logout and login as Landlord",
            "2. Go to Dashboard -> Properties tab",
            "3. Click on a property with inquiries",
            "4. View property inquiries",
            "5. Check inquiry details",
            "6. Try responding to inquiry",
            "7. Update inquiry status",
            "8. Test inquiry filtering/sorting"
        )
        expectedResults = @(
            "✅ Inquiries visible to landlord",
            "✅ Inquiry details accessible",
            "✅ Response functionality working",
            "✅ Status updates working",
            "✅ Inquiry management complete"
        )
    },
    @{
        title = "Property Management (Landlord)"
        description = "Test property editing and deletion"
        steps = @(
            "1. As Landlord, go to My Properties",
            "2. Click 'Edit' on a property",
            "3. Update property details:",
            "   - Change rent amount",
            "   - Update description",
            "   - Modify amenities",
            "4. Save changes",
            "5. Verify changes reflected",
            "6. Test property deletion:",
            "   - Click 'Delete' on a property",
            "   - Confirm deletion",
            "   - Verify property removed",
            "7. Test property status toggle"
        )
        expectedResults = @(
            "✅ Property editing functional",
            "✅ Changes saved successfully",
            "✅ Property deletion working",
            "✅ Property removed from listings",
            "✅ Status toggle working"
        )
    },
    @{
        title = "Role-Based Access Control"
        description = "Test access restrictions based on user role"
        steps = @(
            "1. As Student, try accessing:",
            "   - /list-property (should redirect)",
            "   - Direct property creation URL",
            "   - Landlord dashboard features",
            "2. As Landlord, verify access to:",
            "   - Property creation form",
            "   - My Properties section",
            "   - Property management features",
            "3. Test guest user access:",
            "   - View properties (should work)",
            "   - Try accessing protected pages",
            "4. Test navigation restrictions"
        )
        expectedResults = @(
            "✅ Students cannot access landlord features",
            "✅ Landlords have full property access",
            "✅ Guests properly restricted",
            "✅ Proper redirections working",
            "✅ Navigation adapted to roles"
        )
    },
    @{
        title = "Error Handling & Edge Cases"
        description = "Test error handling and edge cases"
        steps = @(
            "1. Test network error handling:",
            "   - Disable network briefly",
            "   - Try submitting forms",
            "   - Check error messages",
            "2. Test invalid data:",
            "   - Empty required fields",
            "   - Invalid email formats",
            "   - Negative rent amounts",
            "3. Test session expiry:",
            "   - Wait for token expiry",
            "   - Try protected actions",
            "4. Test large data sets:",
            "   - Create many properties",
            "   - Test pagination",
            "5. Test concurrent actions"
        )
        expectedResults = @(
            "✅ Proper error messages shown",
            "✅ Network errors handled gracefully",
            "✅ Invalid data rejected",
            "✅ Session expiry handled",
            "✅ Large data sets supported"
        )
    }
)

function Show-TestScenario {
    param($scenario, $index)
    
    Write-Host "`n" + "="*50 -ForegroundColor Cyan
    Write-Host "TEST SCENARIO $($index + 1): $($scenario.title)" -ForegroundColor Cyan
    Write-Host "="*50 -ForegroundColor Cyan
    Write-Host "Description: $($scenario.description)" -ForegroundColor Yellow
    
    Write-Host "`n📋 Steps to perform:" -ForegroundColor White
    foreach ($step in $scenario.steps) {
        Write-Host "  $step" -ForegroundColor Gray
    }
    
    Write-Host "`n✅ Expected Results:" -ForegroundColor Green
    foreach ($result in $scenario.expectedResults) {
        Write-Host "  $result" -ForegroundColor Gray
    }
    
    Write-Host "`nReady to test this scenario?" -ForegroundColor Yellow
    $response = Read-Host "Press Enter to continue to next scenario, or 'q' to quit"
    
    if ($response -eq 'q') {
        return $false
    }
    return $true
}

# Main execution
Write-Host "`n🚀 Starting Manual Testing Scenarios" -ForegroundColor Cyan
Write-Host "Please open a web browser and follow along with each scenario." -ForegroundColor Yellow

for ($i = 0; $i -lt $testScenarios.Count; $i++) {
    $continue = Show-TestScenario $testScenarios[$i] $i
    if (!$continue) {
        break
    }
}

Write-Host "`n🎉 Manual testing scenarios completed!" -ForegroundColor Green
Write-Host "Please document any issues found during testing." -ForegroundColor Yellow

# Create a manual test checklist file
$checklistContent = @"
# ProperEase Manual Testing Checklist

## Testing Progress

"@

foreach ($scenario in $testScenarios) {
    $checklistContent += "### $($scenario.title)`n"
    $checklistContent += "- [ ] Test completed`n"
    $checklistContent += "- [ ] All expected results achieved`n"
    $checklistContent += "- [ ] Issues documented`n`n"
}

$checklistContent += @"

## Issues Found

| Issue | Severity | Description | Steps to Reproduce | Status |
|-------|----------|-------------|-------------------|---------|
|       |          |             |                   |         |

## Overall Assessment

- [ ] All critical functionality working
- [ ] User experience satisfactory  
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Ready for production

## Notes

"@

$checklistContent | Out-File -FilePath "MANUAL_TEST_CHECKLIST.md" -Encoding UTF8

Write-Host "`n📝 Manual test checklist created: MANUAL_TEST_CHECKLIST.md" -ForegroundColor Cyan
Write-Host "Use this to track your testing progress and document issues." -ForegroundColor Yellow
