/**
 * Final deployment verification for StudX
 * Ensures the project is completely ready for production
 */

const fs = require('fs');
const path = require('path');

function checkProductionReadiness() {
    console.log('🔍 Final Deployment Verification for StudX\n');
    console.log('==========================================\n');
    
    const issues = [];
    const successes = [];
    
    // 1. Check for environment variables file
    const envExample = path.join(process.cwd(), '.env.production.example');
    if (fs.existsSync(envExample)) {
        successes.push('✅ Environment variables template created');
    } else {
        issues.push('❌ Missing .env.production.example file');
    }
    
    // 2. Check for active console logs in main files
    const mainFiles = [
        'app/login/page.js',
        'app/signup/page.js', 
        'app/api/sell/route.js',
        'components/forms/RoomsForm.js',
        'components/forms/NotesForm.js'
    ];
    
    let consoleLogsFound = 0;
    
    mainFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const activeConsoleRegex = /^\s*console\./gm;
            const matches = content.match(activeConsoleRegex);
            if (matches) {
                consoleLogsFound += matches.length;
                issues.push(`❌ Active console logs in ${file}: ${matches.length}`);
            } else {
                successes.push(`✅ No console logs in ${file}`);
            }
        }
    });
    
    // 3. Check for hardcoded API keys
    const sellRouteFile = path.join(process.cwd(), 'app/api/sell/route.js');
    if (fs.existsSync(sellRouteFile)) {
        const content = fs.readFileSync(sellRouteFile, 'utf8');
        if (content.includes('process.env.IMGBB_API_KEY')) {
            successes.push('✅ ImgBB API key using environment variables');
        } else if (content.includes('272785e1c6e6221d927bad99483ff9ed')) {
            issues.push('❌ ImgBB API key still hardcoded!');
        }
    }
    
    // 4. Check for package.json scripts
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (pkg.scripts && pkg.scripts.build) {
            successes.push('✅ Build script available');
        } else {
            issues.push('❌ Missing build script in package.json');
        }
        
        if (pkg.scripts && pkg.scripts.start) {
            successes.push('✅ Start script available');
        } else {
            issues.push('❌ Missing start script in package.json');
        }
    }
    
    // 5. Check for Next.js config
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
        successes.push('✅ Next.js configuration file exists');
    } else {
        issues.push('❌ Missing next.config.js');
    }
    
    // 6. Check for essential files
    const essentialFiles = [
        'app/layout.js',
        'app/page.js',
        'package.json',
        'tailwind.config.js',
        'lib/supabase/client.js'
    ];
    
    essentialFiles.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            successes.push(`✅ Essential file exists: ${file}`);
        } else {
            issues.push(`❌ Missing essential file: ${file}`);
        }
    });
    
    // Display results
    console.log('📊 VERIFICATION RESULTS:\n');
    
    if (successes.length > 0) {
        console.log('✅ PASSED CHECKS:\n');
        successes.forEach(success => console.log(`   ${success}`));
        console.log('');
    }
    
    if (issues.length > 0) {
        console.log('❌ ISSUES FOUND:\n');
        issues.forEach(issue => console.log(`   ${issue}`));
        console.log('');
        console.log('🚨 Please fix these issues before deployment!\n');
    } else {
        console.log('🎉 ALL CHECKS PASSED!\n');
        console.log('✅ Your StudX project is ready for production deployment!\n');
    }
    
    // Environment variables reminder
    console.log('📋 REQUIRED ENVIRONMENT VARIABLES:\n');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key'); 
    console.log('   IMGBB_API_KEY=your_imgbb_api_key');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_key (optional)\n');
    
    // Deployment recommendations
    console.log('🚀 RECOMMENDED DEPLOYMENT PLATFORMS:\n');
    console.log('   1. Vercel (Recommended) - Automatic Next.js optimization');
    console.log('   2. Netlify - Great for static deployments');
    console.log('   3. Railway - Good for full-stack apps');
    console.log('   4. Render - Alternative hosting option\n');
    
    console.log('📖 For detailed deployment instructions, see DEPLOYMENT_GUIDE.md\n');
    
    return issues.length === 0;
}

// Run verification
if (require.main === module) {
    const isReady = checkProductionReadiness();
    process.exit(isReady ? 0 : 1);
}

module.exports = { checkProductionReadiness };
