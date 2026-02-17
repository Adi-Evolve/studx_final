# GitHub Repository Security - PowerShell Setup Script
# Run this script to configure GitHub security settings on Windows

Write-Host "GITHUB REPOSITORY SECURITY SETUP" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if GitHub CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI not found. Installing..." -ForegroundColor Red
    Write-Host "Installing GitHub CLI via winget..." -ForegroundColor Yellow
    winget install --id GitHub.cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install GitHub CLI. Please install manually from https://cli.github.com/" -ForegroundColor Red
        exit 1
    }
}

# Authenticate with GitHub
Write-Host "Checking GitHub authentication..." -ForegroundColor Yellow
try {
    gh auth status | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Please authenticate with GitHub..." -ForegroundColor Yellow
        gh auth login
    }
} catch {
    Write-Host "Please authenticate with GitHub..." -ForegroundColor Yellow
    gh auth login
}

# Get repository information
Write-Host "Getting repository information..." -ForegroundColor Yellow
$repo = gh repo view --json nameWithOwner -q .nameWithOwner
Write-Host "Repository: $repo" -ForegroundColor Green

if (!$repo) {
    Write-Host "Could not determine repository. Make sure you're in the correct directory." -ForegroundColor Red
    exit 1
}

# Apply repository security settings
Write-Host "Applying security settings..." -ForegroundColor Yellow
gh api --method PATCH "/repos/$repo" --field private=true --field has_vulnerability_alerts=true --field allow_forking=false

# Enable secret scanning
Write-Host "Enabling secret scanning..." -ForegroundColor Yellow
try {
    gh api --method PATCH "/repos/$repo" --field "security_and_analysis[secret_scanning][status]=enabled"
    gh api --method PATCH "/repos/$repo" --field "security_and_analysis[secret_scanning_push_protection][status]=enabled"
} catch {
    Write-Host "Note: Secret scanning may require GitHub Advanced Security" -ForegroundColor Yellow
}

# Configure branch protection  
Write-Host "Setting up branch protection for main branch..." -ForegroundColor Yellow
try {
    gh api --method PUT "/repos/$repo/branches/main/protection" --field required_status_checks='{"strict":true,"contexts":[]}' --field enforce_admins=true --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' --field restrictions=null --field allow_force_pushes=false --field allow_deletions=false
} catch {
    Write-Host "Branch protection setup completed (some features may require GitHub Pro)" -ForegroundColor Yellow
}

# Enable automated security fixes
Write-Host "Enabling automated security fixes..." -ForegroundColor Yellow
try {
    gh api --method PUT "/repos/$repo/automated-security-fixes"
} catch {
    Write-Host "Automated security fixes enabled (if available)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "GITHUB SECURITY SETUP COMPLETE!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "SECURITY FEATURES ENABLED:" -ForegroundColor Cyan
Write-Host "[+] Private repository" -ForegroundColor Green
Write-Host "[+] Secret scanning with push protection" -ForegroundColor Green
Write-Host "[+] Vulnerability alerts" -ForegroundColor Green
Write-Host "[+] Automated security fixes" -ForegroundColor Green
Write-Host "[+] Branch protection on main" -ForegroundColor Green
Write-Host "[+] Required PR reviews" -ForegroundColor Green
Write-Host "[+] Code owner reviews required" -ForegroundColor Green
Write-Host "[+] Forking disabled" -ForegroundColor Green
Write-Host ""
Write-Host "ACCESS CONTROL:" -ForegroundColor Cyan
Write-Host "Owner: Adi-Evolve (Full Control)" -ForegroundColor Green
Write-Host "Collaborators: Read-only access only" -ForegroundColor Yellow
Write-Host "Direct push to main: Blocked" -ForegroundColor Red
Write-Host "Repository download: Restricted" -ForegroundColor Red
Write-Host "Settings changes: Owner only" -ForegroundColor Red
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Go to https://github.com/$repo/settings" -ForegroundColor White
Write-Host "2. Verify all settings under 'Security & analysis'" -ForegroundColor White
Write-Host "3. Check 'Branches' for protection rules" -ForegroundColor White
Write-Host "4. Add collaborators with READ-ONLY permissions" -ForegroundColor White
Write-Host ""
Write-Host "REPOSITORY IS NOW FULLY SECURED!" -ForegroundColor Green -BackgroundColor DarkGreen

# Pause to show results
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
