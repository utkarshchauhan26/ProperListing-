# ProperEase Project Setup Script
Write-Host "ProperEase Project Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Step 1: Install Backend Dependencies
Write-Host "`nInstalling Backend Dependencies..." -ForegroundColor Yellow
Set-Location "backend"

try {
    npm install
    Write-Host "Backend dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to install backend dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Generate Prisma Client
Write-Host "`nGenerating Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "Prisma client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to generate Prisma client: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Create uploads directory
Write-Host "`nCreating uploads directory..." -ForegroundColor Yellow
if (!(Test-Path "uploads\properties")) {
    New-Item -ItemType Directory -Path "uploads\properties" -Force
    Write-Host "Uploads directory created" -ForegroundColor Green
} else {
    Write-Host "Uploads directory already exists" -ForegroundColor Green
}

Set-Location ".."

# Step 4: Install Frontend Dependencies
Write-Host "`nInstalling Frontend Dependencies..." -ForegroundColor Yellow
Set-Location "frontend"

try {
    npm install
    Write-Host "Frontend dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to install frontend dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Set-Location ".."

# Step 5: Check Database Connection
Write-Host "`nChecking Database Connection..." -ForegroundColor Yellow
Set-Location "backend"

try {
    npx prisma db push
    Write-Host "Database schema synced successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to sync database schema: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is running and credentials are correct" -ForegroundColor Yellow
}

Set-Location ".."

Write-Host "`nSetup completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: .\test-project.ps1 (to test the project)" -ForegroundColor White
Write-Host "2. Or manually start services:" -ForegroundColor White
Write-Host "   Backend: cd backend; npm run dev" -ForegroundColor White
Write-Host "   Frontend: cd frontend; npm run dev" -ForegroundColor White
