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

// Function to fix broken console statements
function fixBrokenConsole(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        // Fix broken multi-line console statements
        const patterns = [
            // Pattern 1: console.log with object spread across lines
            /\/\/\s*console\.log\([^)]+,\s*\{[^}]*\n[^}]*\}/g,
            // Pattern 2: console.log with object properties on separate lines
            /\/\/\s*console\.log\([^{]+\{[^}]*\n[^}]*\}/g,
        ];
        
        // Replace broken patterns with proper multi-line comments
        content = content.replace(/(\/\/\s*console\.(?:log|error|warn|info|debug)\([^)]*,\s*\{[^{]*\n)([\s\S]*?\n\s*\}\);)/g, (match, start, middle) => {
            // Convert to properly commented multi-line block
            const lines = match.split('\n');
            const commentedLines = lines.map((line, index) => {
                if (index === 0) return line; // First line is already commented
                const indent = line.match(/^(\s*)/)[1];
                return `${indent}// ${line.trim()}`;
            });
            changed = true;
            return commentedLines.join('\n');
        });
        
        // Also fix simple broken console statements
        content = content.replace(/(\/\/\s*console\.(?:log|error|warn|info|debug)\([^)]*\{[^}]*\n)([\s\S]*?\n\s*\}\);)/g, (match, start, middle) => {
            const lines = match.split('\n');
            const commentedLines = lines.map((line, index) => {
                if (index === 0) return line;
                const indent = line.match(/^(\s*)/)[1];
                return `${indent}// ${line.trim()}`;
            });
            changed = true;
            return commentedLines.join('\n');
        });
        
        if (changed) {
            fs.writeFileSync(filePath, content);
            // console.log(`✅ Fixed: ${filePath}`);
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
    !file.includes('cleanup-') &&
    !file.includes('node_modules') &&
    (file.includes('\\app\\') || file.includes('\\components\\') || file.includes('\\lib\\') || file.includes('/app/') || file.includes('/components/') || file.includes('/lib/'))
);

// console.log(`🔧 Processing ${appFiles.length} application files...`);

appFiles.forEach(fixBrokenConsole);

// console.log('✅ Console statement fix completed!');
