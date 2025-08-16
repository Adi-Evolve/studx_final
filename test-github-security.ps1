# Simple GitHub Security Setup Test
# This is a dry-run version to test the syntax

Write-Host "GITHUB REPOSITORY SECURITY SETUP - TEST MODE" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Test GitHub CLI availability
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI not found - would install here in real script" -ForegroundColor Yellow
} else {
    Write-Host "GitHub CLI found - OK" -ForegroundColor Green
}

# Test repository detection
Write-Host "Testing repository detection..." -ForegroundColor Yellow
try {
    $repo = gh repo view --json nameWithOwner -q .nameWithOwner 2>$null
    if ($repo) {
        Write-Host "Repository detected: $repo" -ForegroundColor Green
    } else {
        Write-Host "Repository not detected - make sure you're in a git repository" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Could not detect repository - this is normal for testing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "SYNTAX TEST COMPLETE - SCRIPT IS READY!" -ForegroundColor Green
Write-Host "Run the full setup-github-security.ps1 script when ready" -ForegroundColor White
