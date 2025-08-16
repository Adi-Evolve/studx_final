# 🔒 AUTOMATED SECURITY VERIFICATION SCRIPT
# This script tests all GitHub repository security features

Write-Host "GITHUB REPOSITORY SECURITY VERIFICATION" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Refresh PATH for GitHub CLI
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Test 1: GitHub CLI Availability
Write-Host ""
Write-Host "[TEST 1] GitHub CLI Availability" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

if (Get-Command gh -ErrorAction SilentlyContinue) {
    $version = gh --version | Select-String "gh version" 
    Write-Host "[PASS] GitHub CLI installed: $version" -ForegroundColor Green
} else {
    Write-Host "[FAIL] GitHub CLI not found - Install from https://cli.github.com/" -ForegroundColor Red
    Write-Host "Run: winget install --id GitHub.cli" -ForegroundColor Yellow
}

# Test 2: Repository Detection
Write-Host ""
Write-Host "[TEST 2] Repository Detection" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

try {
    $remoteUrl = git remote get-url origin 2>$null
    if ($remoteUrl -match "github.com/([^/]+)/([^/.]+)") {
        $owner = $matches[1]
        $repo = $matches[2]
        Write-Host "[PASS] Repository detected: $owner/$repo" -ForegroundColor Green
        $repoFullName = "$owner/$repo"
    } else {
        Write-Host "[FAIL] Not a GitHub repository" -ForegroundColor Red
        $repoFullName = $null
    }
} catch {
    Write-Host "[FAIL] Git repository not detected" -ForegroundColor Red
    $repoFullName = $null
}

# Test 3: Security Files Present
Write-Host ""
Write-Host "[TEST 3] Security Files Check" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

$securityFiles = @(
    "SECURITY.md",
    "CODEOWNERS",
    ".github\workflows\security-enforcement.yml",
    ".github\workflows\security-monitor.yml"
)

$allFilesPresent = $true
foreach ($file in $securityFiles) {
    if (Test-Path $file) {
        Write-Host "[PASS] $file exists" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $file missing" -ForegroundColor Red
        $allFilesPresent = $false
    }
}

# Test 4: CODEOWNERS Configuration
Write-Host ""
Write-Host "[TEST 4] CODEOWNERS Configuration" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

if (Test-Path "CODEOWNERS") {
    $codeowners = Get-Content "CODEOWNERS" -Raw
    if ($codeowners -match "@$owner") {
        Write-Host "[PASS] CODEOWNERS configured for repository owner" -ForegroundColor Green
    } else {
        Write-Host "[WARN] CODEOWNERS may not be configured correctly" -ForegroundColor Yellow
    }
} else {
    Write-Host "[FAIL] CODEOWNERS file not found" -ForegroundColor Red
}

# Test 5: GitHub Actions Workflows
Write-Host ""
Write-Host "[TEST 5] GitHub Actions Workflows" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

$workflows = @(
    ".github\workflows\security-enforcement.yml",
    ".github\workflows\security-monitor.yml"
)

foreach ($workflow in $workflows) {
    if (Test-Path $workflow) {
        $content = Get-Content $workflow -Raw
        if ($content -match "on:" -and $content -match "jobs:") {
            Write-Host "[PASS] $(Split-Path $workflow -Leaf) is valid" -ForegroundColor Green
        } else {
            Write-Host "[WARN] $(Split-Path $workflow -Leaf) may have syntax issues" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[FAIL] $(Split-Path $workflow -Leaf) not found" -ForegroundColor Red
    }
}

# Test 6: Git Configuration Security
Write-Host ""
Write-Host "[TEST 6] Git Configuration Security" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

try {
    $branch = git branch --show-current 2>$null
    if ($branch -eq "main") {
        Write-Host "[PASS] On main branch" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Current branch: $branch" -ForegroundColor Yellow
    }
    
    $status = git status --porcelain 2>$null
    if ($status) {
        Write-Host "[INFO] Repository has uncommitted changes" -ForegroundColor Yellow
        Write-Host "       Commit security files to activate GitHub Actions" -ForegroundColor Yellow
    } else {
        Write-Host "[PASS] Repository is clean" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Could not check Git status" -ForegroundColor Yellow
}

# Test 7: Authentication Test (if authenticated)
Write-Host ""
Write-Host "[TEST 7] GitHub Authentication" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow

try {
    gh auth status 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $user = gh api user --jq .login 2>$null
        if ($user -eq $owner) {
            Write-Host "[PASS] Authenticated as repository owner: $user" -ForegroundColor Green
            $authenticated = $true
        } else {
            Write-Host "[WARN] Authenticated as: $user (not repository owner)" -ForegroundColor Yellow
            $authenticated = $true
        }
    } else {
        Write-Host "[INFO] GitHub CLI not authenticated" -ForegroundColor Yellow
        Write-Host "       Run 'gh auth login' to enable advanced tests" -ForegroundColor Yellow
        $authenticated = $false
    }
} catch {
    Write-Host "[INFO] GitHub CLI authentication not available" -ForegroundColor Yellow
    $authenticated = $false
}

# Test 8: Repository Settings Test (if authenticated)
if ($authenticated -and $repoFullName) {
    Write-Host ""
    Write-Host "[TEST 8] Repository Settings Verification" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Yellow
    
    try {
        $repoInfo = gh api "repos/$repoFullName" 2>$null | ConvertFrom-Json
        
        if ($repoInfo.private) {
            Write-Host "[PASS] Repository is private" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Repository is public - should be private for security" -ForegroundColor Yellow
        }
        
        if (-not $repoInfo.allow_forking) {
            Write-Host "[PASS] Forking is disabled" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Forking is enabled - should be disabled" -ForegroundColor Yellow
        }
        
        if ($repoInfo.has_vulnerability_alerts) {
            Write-Host "[PASS] Vulnerability alerts enabled" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Vulnerability alerts disabled" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[WARN] Could not verify repository settings" -ForegroundColor Yellow
    }
}

# Test 9: Branch Protection Test (if authenticated)
if ($authenticated -and $repoFullName) {
    Write-Host ""
    Write-Host "[TEST 9] Branch Protection Verification" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    
    try {
        $protection = gh api "repos/$repoFullName/branches/main/protection" 2>$null | ConvertFrom-Json
        
        if ($protection.required_pull_request_reviews) {
            Write-Host "[PASS] Branch protection requires PR reviews" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Branch protection not configured properly" -ForegroundColor Yellow
        }
        
        if ($protection.enforce_admins.enabled) {
            Write-Host "[PASS] Branch protection includes administrators" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Administrators can bypass branch protection" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[WARN] Could not verify branch protection (may not be set up)" -ForegroundColor Yellow
        Write-Host "       Configure branch protection manually in GitHub settings" -ForegroundColor Yellow
    }
}

# Security Summary
Write-Host ""
Write-Host "SECURITY VERIFICATION SUMMARY" -ForegroundColor Cyan -BackgroundColor DarkBlue
Write-Host "==============================" -ForegroundColor Cyan -BackgroundColor DarkBlue

if ($allFilesPresent) {
    Write-Host "[PASS] All security files are present" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Some security files are missing" -ForegroundColor Red
}

if ($repoFullName) {
    Write-Host "[PASS] Repository properly configured" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Repository configuration issues" -ForegroundColor Red
}

if ($authenticated) {
    Write-Host "[PASS] GitHub CLI ready for advanced configuration" -ForegroundColor Green
} else {
    Write-Host "[INFO] Run 'gh auth login' for complete verification" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. If not authenticated: Run 'gh auth login'" -ForegroundColor White
Write-Host "2. Follow COMPLETE_SECURITY_IMPLEMENTATION.md for manual setup" -ForegroundColor White
Write-Host "3. Commit security files to activate GitHub Actions:" -ForegroundColor White
Write-Host "   git add .github/ CODEOWNERS SECURITY.md" -ForegroundColor Gray
Write-Host "   git commit -m 'Add repository security'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "SECURITY VERIFICATION COMPLETE!" -ForegroundColor Green -BackgroundColor DarkGreen

# Pause for user to read results
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
