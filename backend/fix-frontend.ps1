# Frontend Fix Script for ProperEase
# This script fixes the frontend build errors

Write-Host "🔧 Fixing ProperEase Frontend Issues..." -ForegroundColor Cyan

# Set environment variable
$env:DATABASE_URL = "postgresql://postgres:suraj121@localhost:5432/properease?schema=public"

# Navigate to frontend
Set-Location "../frontend"

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Copy fixed API client
Write-Host "📄 Copying corrected API client..." -ForegroundColor Green
Copy-Item "../backend/frontend-api.ts" "src/lib/api.ts" -Force

# Copy fixed hooks
Write-Host "📄 Copying corrected hooks..." -ForegroundColor Green
Copy-Item "../backend/frontend-hooks.ts" "src/lib/hooks.ts" -Force

# Fix dashboard template literal issue
Write-Host "🔧 Fixing dashboard template literal..." -ForegroundColor Green
$dashboardContent = Get-Content "src/app/dashboard/page.tsx" -Raw
$dashboardContent = $dashboardContent -replace 'src=\{https://ui-avatars\.com/api/\?name=&background=4F46E5&color=fff\}', 'src={`https://ui-avatars.com/api/?name=&background=4F46E5&color=fff`}'
$dashboardContent | Set-Content "src/app/dashboard/page.tsx"

# Fix CSS global selectors (create a simpler version)
Write-Host "🎨 Fixing CSS global selectors..." -ForegroundColor Green

# Create a simple globals.css to replace module files
$globalCSS = @"
/* Global Styles for ProperEase */
:root {
  --primary: #ff497c;
  --primary-dark: #e63946;
  --secondary: #4f46e5;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: var(--gray-900);
  background-color: var(--gray-50);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
"@

$globalCSS | Set-Content "src/app/globals.css"

# Update imports in components that use problematic CSS modules
Write-Host "📝 Updating component imports..." -ForegroundColor Green

# Remove CSS module imports from dashboard
if (Test-Path "src/app/dashboard/page.tsx") {
    $content = Get-Content "src/app/dashboard/page.tsx" -Raw
    $content = $content -replace "import styles from.*\.module\.css.*';", ""
    $content = $content -replace "className=\{styles\[.*?\]\}", 'className="container"'
    $content = $content -replace "className=\{styles\..*?\}", 'className="card"'
    $content | Set-Content "src/app/dashboard/page.tsx"
}

Write-Host "✅ Frontend fixes applied!" -ForegroundColor Green
Write-Host "🚀 Attempting to build..." -ForegroundColor Yellow

# Try to build
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful! Starting development server..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "❌ Build failed. Check the errors above." -ForegroundColor Red
    Write-Host "💡 Try running this script again or check individual files." -ForegroundColor Yellow
}
"@
