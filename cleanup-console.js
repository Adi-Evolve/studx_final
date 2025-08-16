const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files
function findJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules, .git, and other build directories
            if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
                findJSFiles(filePath, fileList);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to comment out console statements
function commentOutConsole(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Match console.log, console.error, console.warn, console.info, console.debug
        // but NOT console.error for actual error handling
        const lines = content.split('\n');
        const updatedLines = lines.map(line => {
            // Skip lines that are already commented
            if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
                return line;
            }
            
            // Comment out console.log, console.info, console.debug, console.warn
            if (line.includes('console.log') || line.includes('console.info') || line.includes('console.debug') || line.includes('console.warn')) {
                changed = true;
                const indent = line.match(/^\s*/)[0];
                return `${indent}// ${line.trim()}`;
            }
            
            // Only comment out console.error if it's not for critical error handling
            if (line.includes('console.error') && !line.includes('catch') && !line.includes('Error:')) {
                // Check if this is a debug/development console.error
                if (line.includes('❌') || line.includes('🔍') || line.includes('Auth error') || line.includes('debug') || line.includes('Debug')) {
                    changed = true;
                    const indent = line.match(/^\s*/)[0];
                    return `${indent}// ${line.trim()}`;
                }
            }
            
            return line;
        });
        
        if (changed) {
            fs.writeFileSync(filePath, updatedLines.join('\n'));
            // console.log(`✅ Updated: ${filePath}`);
        }
    } catch (error) {
        // console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Main execution
const projectRoot = process.cwd();
const jsFiles = findJSFiles(projectRoot);

// Filter out test files and config files
const appFiles = jsFiles.filter(file => 
    !file.includes('test-') && 
    !file.includes('verify-') && 
    !file.includes('update-') && 
    !file.includes('node_modules') &&
    (file.includes('\\app\\') || file.includes('\\components\\') || file.includes('\\lib\\') || file.includes('/app/') || file.includes('/components/') || file.includes('/lib/'))
);

// console.log(`🔧 Processing ${appFiles.length} application files...`);

appFiles.forEach(commentOutConsole);

// console.log('✅ Console statement cleanup completed!');
