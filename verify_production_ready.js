// StudX Production Readiness Verification
require('dotenv').config({ path: '.env.local' });

async function verifyProductionReadiness() {
    // console.log('🎯 StudX Production Readiness Check\n');
    
    const checks = [];
    
    // Environment Variables Check
    // console.log('📋 Checking Environment Variables...');
    const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
        'SUPABASE_SECRET_KEY',
        'IMGBB_API_KEY',
        'GOOGLE_DRIVE_CLIENT_EMAIL',
        'GOOGLE_DRIVE_PRIVATE_KEY',
        'GOOGLE_DRIVE_FOLDER_ID'
    ];
    
    let envVarsOk = true;
    requiredEnvVars.forEach(varName => {
        if (process.env[varName]) {
            // console.log(`   ✅ ${varName}`);
        } else {
            // console.log(`   ❌ ${varName} - MISSING`);
            envVarsOk = false;
        }
    });
    checks.push({ name: 'Environment Variables', passed: envVarsOk });
    
    // Google Drive Connection Check
    // console.log('\n🚗 Testing Google Drive Connection...');
    try {
        const { uploadPdfToGoogleDrive } = require('./lib/googleDrivePdfService');
        
        // Create a minimal test file
        const testFile = {
            name: 'readiness_test.pdf',
            size: 100,
            type: 'application/pdf',
            arrayBuffer: async () => Buffer.from('test content')
        };
        
        const result = await uploadPdfToGoogleDrive(testFile);
        // console.log(`   ✅ Google Drive upload successful: ${result.fileId}`);
        checks.push({ name: 'Google Drive Integration', passed: true });
        
        // Clean up test file
        const { deletePdfFromGoogleDrive } = require('./lib/googleDrivePdfService');
        await deletePdfFromGoogleDrive(result.fileId);
        // console.log(`   🧹 Cleaned up test file`);
        
    } catch (error) {
        // console.log(`   ❌ Google Drive test failed: ${error.message}`);
        checks.push({ name: 'Google Drive Integration', passed: false });
    }
    
    // Package Dependencies Check
    // console.log('\n📦 Checking Dependencies...');
    try {
        const packageJson = require('./package.json');
        const requiredDeps = ['googleapis', 'dotenv', '@supabase/auth-helpers-nextjs'];
        
        let depsOk = true;
        requiredDeps.forEach(dep => {
            if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
                // console.log(`   ✅ ${dep}`);
            } else {
                // console.log(`   ❌ ${dep} - MISSING`);
                depsOk = false;
            }
        });
        checks.push({ name: 'Dependencies', passed: depsOk });
        
    } catch (error) {
        // console.log(`   ❌ Could not check package.json: ${error.message}`);
        checks.push({ name: 'Dependencies', passed: false });
    }
    
    // File Structure Check
    // console.log('\n📁 Checking File Structure...');
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
        'app/api/sell/route.js',
        'lib/googleDrivePdfService.js',
        'package.json',
        '.env.local'
    ];
    
    let filesOk = true;
    requiredFiles.forEach(filePath => {
        if (fs.existsSync(path.join(__dirname, filePath))) {
            // console.log(`   ✅ ${filePath}`);
        } else {
            // console.log(`   ❌ ${filePath} - MISSING`);
            filesOk = false;
        }
    });
    checks.push({ name: 'File Structure', passed: filesOk });
    
    // Summary
    // console.log('\n📊 Production Readiness Summary:');
    // console.log('═'.repeat(50));
    
    const passedChecks = checks.filter(check => check.passed).length;
    const totalChecks = checks.length;
    
    checks.forEach(check => {
        const status = check.passed ? '✅ PASS' : '❌ FAIL';
        // console.log(`   ${status} ${check.name}`);
    });
    
    // console.log('═'.repeat(50));
    // console.log(`   Score: ${passedChecks}/${totalChecks} checks passed`);
    
    if (passedChecks === totalChecks) {
        // console.log('\n🎉 PRODUCTION READY!');
        // console.log('✨ Your StudX app is ready to deploy to Vercel!');
        // console.log('\n🚀 Next steps:');
        // console.log('   1. Run: vercel');
        // console.log('   2. Add environment variables in Vercel dashboard');
        // console.log('   3. Deploy: vercel --prod');
        // console.log('\n📚 See DEPLOYMENT_CHECKLIST.md for detailed instructions');
        return true;
    } else {
        // console.log('\n⚠️  ISSUES FOUND');
        // console.log('🔧 Please fix the failed checks before deployment');
        // console.log('📚 See setup guides for troubleshooting');
        return false;
    }
}

// Run verification
if (require.main === module) {
    verifyProductionReadiness()
        .then((ready) => {
            process.exit(ready ? 0 : 1);
        })
        .catch((error) => {
            // console.error('\n❌ Verification failed:', error);
            process.exit(1);
        });
}

module.exports = { verifyProductionReadiness };
