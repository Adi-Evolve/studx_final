/**
 * Production deployment preparation script
 * This script will comment out all console logs and check for security issues
 */

const fs = require('fs');
const path = require('path');

// Files to exclude from console log removal (keep some for critical errors)
const EXCLUDE_PATTERNS = [
    'node_modules',
    '.git',
    '.next',
    'test_',
    'debug_',
    '.md',
    '.sql',
    'password_storage_explanation.js',
    'test_signup_',
    'check_password_storage',
    'SOLUTION_SUMMARY',
    'SIGNUP_',
    'PASSWORD_STORAGE_GUIDE'
];

// Console methods to comment out
const CONSOLE_METHODS = [
    'console.log',
    'console.error',
    'console.warn',
    'console.info',
    'console.debug'
];

// Security patterns to check for
const SECURITY_PATTERNS = [
    /['"](sk_|pk_)[a-zA-Z0-9_]{20,}['"]/, // API keys
    /['"]\w{32,}['"]/, // Potential tokens
    /password\s*[:=]\s*['"][^'"]{3,}['"]/, // Hardcoded passwords
    /api_key\s*[:=]\s*['"][^'"]{10,}['"]/, // API keys
    /secret\s*[:=]\s*['"][^'"]{10,}['"]/, // Secrets
];

function shouldExcludeFile(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function commentOutConsoleLogs(content, filePath) {
    let modified = false;
    let newContent = content;
    
    // Comment out console logs but preserve console.error for critical errors
    CONSOLE_METHODS.forEach(method => {
        const regex = new RegExp(`^(\\s*)(${method.replace('.', '\\.')})`, 'gm');
        const replacement = (match, indent, consoleCall) => {
            // Keep some console.errors for critical issues
            if (method === 'console.error' && (
                match.includes('Critical') || 
                match.includes('FATAL') ||
                match.includes('Authentication failed')
            )) {
                return match;
            }
            modified = true;
            return `${indent}// ${consoleCall}`;
        };
        newContent = newContent.replace(regex, replacement);
    });
    
    return { content: newContent, modified };
}

function checkForSecurityIssues(content, filePath) {
    const issues = [];
    
    SECURITY_PATTERNS.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
            issues.push({
                type: ['API Key', 'Token', 'Password', 'API Key', 'Secret'][index],
                match: matches[0],
                file: filePath
            });
        }
    });
    
    return issues;
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for security issues
    const securityIssues = checkForSecurityIssues(content, filePath);
    
    // Comment out console logs
    const { content: newContent, modified } = commentOutConsoleLogs(content, filePath);
    
    if (modified) {
        fs.writeFileSync(filePath, newContent);
        // console.log(`✅ Commented console logs in: ${filePath}`);
    }
    
    return securityIssues;
}

function walkDirectory(dir) {
    const allSecurityIssues = [];
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !shouldExcludeFile(filePath)) {
            allSecurityIssues.push(...walkDirectory(filePath));
        } else if (stat.isFile() && 
                  (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) &&
                  !shouldExcludeFile(filePath)) {
            const issues = processFile(filePath);
            allSecurityIssues.push(...issues);
        }
    });
    
    return allSecurityIssues;
}

function main() {
    // console.log('🚀 Preparing StudX for Production Deployment\n');
    // console.log('===========================================\n');
    
    const projectRoot = process.cwd();
    // console.log(`Processing directory: ${projectRoot}\n`);
    
    const securityIssues = walkDirectory(projectRoot);
    
    // console.log('\n📊 DEPLOYMENT PREPARATION COMPLETE\n');
    // console.log('==================================\n');
    
    if (securityIssues.length > 0) {
        // console.log('🚨 SECURITY ISSUES FOUND:\n');
        securityIssues.forEach((issue, index) => {
            // console.log(`${index + 1}. ${issue.type} in ${issue.file}`);
            // console.log(`   Pattern: ${issue.match}\n`);
        });
        // console.log('❌ Please fix these security issues before deployment!\n');
    } else {
        // console.log('✅ No security issues found!\n');
    }
    
    // console.log('📋 DEPLOYMENT CHECKLIST:\n');
    // console.log('✅ Console logs commented out');
    // console.log('✅ Security scan completed');
    // console.log('⚠️  Remember to set environment variables:');
    // console.log('   - IMGBB_API_KEY');
    // console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    // console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
    // console.log('   - SUPABASE_SERVICE_ROLE_KEY (if needed)\n');
    
    // console.log('🚀 Your StudX project is ready for production deployment!');
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { commentOutConsoleLogs, checkForSecurityIssues };
