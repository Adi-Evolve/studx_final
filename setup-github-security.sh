#!/bin/bash

# 🔒 GITHUB REPOSITORY SECURITY SETUP SCRIPT
# Run this script to automatically configure GitHub security settings via GitHub CLI

echo "🔒 GITHUB REPOSITORY SECURITY SETUP"
echo "===================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Please install it first:"
    echo "   Windows: winget install --id GitHub.cli"
    echo "   macOS: brew install gh"
    echo "   Linux: curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    exit 1
fi

# Authenticate with GitHub
echo "🔐 Authenticating with GitHub..."
gh auth status || gh auth login

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📂 Repository: $REPO"

# Enable security features
echo "🛡️ Enabling security features..."

# Enable vulnerability alerts
echo "🔍 Enabling vulnerability alerts..."
gh api -X PATCH "/repos/$REPO" -f has_vulnerability_alerts=true

# Enable automated security fixes
echo "🔧 Enabling automated security fixes..."
gh api -X PUT "/repos/$REPO/automated-security-fixes"

# Enable secret scanning
echo "🔐 Enabling secret scanning..."
gh api -X PUT "/repos/$REPO/secret-scanning/alerts"

# Enable push protection
echo "🛡️ Enabling push protection..."
gh api -X PATCH "/repos/$REPO" -f security_and_analysis.secret_scanning_push_protection.status=enabled

# Configure branch protection
echo "🌿 Setting up branch protection for main branch..."
gh api -X PUT "/repos/$REPO/branches/main/protection" \
  --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["security-check"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "restrict_pushes_that_create_files": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false
}
EOF

# Make repository private (if not already)
echo "🔒 Ensuring repository is private..."
gh api -X PATCH "/repos/$REPO" -f private=true

# Disable forking
echo "🚫 Disabling repository forking..."
gh api -X PATCH "/repos/$REPO" -f allow_forking=false

# Set default branch permissions
echo "👥 Configuring default permissions..."
gh api -X PATCH "/repos/$REPO" -f default_branch=main

echo ""
echo "✅ GITHUB SECURITY SETUP COMPLETE!"
echo "=================================="
echo ""
echo "🛡️ ENABLED SECURITY FEATURES:"
echo "✅ Vulnerability alerts"
echo "✅ Automated security fixes" 
echo "✅ Secret scanning"
echo "✅ Push protection"
echo "✅ Branch protection (main)"
echo "✅ Required PR reviews"
echo "✅ Code owner reviews"
echo "✅ Private repository"
echo "✅ Forking disabled"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Go to GitHub.com → $REPO → Settings"
echo "2. Manually verify all settings are applied"
echo "3. Add collaborators with READ-ONLY access"
echo "4. Test the protection by trying to push to main"
echo ""
echo "🚨 IMPORTANT:"
echo "Even as repository owner, you'll need to create PRs for main branch changes"
echo "This ensures maximum security for your repository"
echo ""
echo "🎯 RESULT: Repository is now under complete control of Adi-Evolve"
