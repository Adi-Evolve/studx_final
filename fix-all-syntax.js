const fs = require('fs');
const path = require('path');

// Function to fix all syntax issues caused by improperly commented console statements
function fixAllSyntaxIssues() {
    const filesToFix = [
        './components/forms/RegularProductForm.js',
        './components/forms/RoomsForm.js', 
        './app/api/item/delete/route.js',
        './app/api/item/mark-sold/route.js',
        './app/api/item/update/route.js',
        './app/api/search/route.js'
    ];

    filesToFix.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let fixed = false;

            // Fix broken object literals after commented console statements
            const patterns = [
                // Fix: // console.log('text', {\n property: value\n})
                {
                    regex: /(\/\/ console\.[^{]*\{[\s\n]*)((?:[^}\/\n]+(?:\n[^}\/]*)*))(\n\s*\}\))?/gm,
                    fix: (match, prefix, middle, suffix) => {
                        const lines = middle.split('\n');
                        const fixedLines = lines.map(line => {
                            if (line.trim() && !line.trim().startsWith('//')) {
                                return '// ' + line;
                            }
                            return line;
                        });
                        return prefix + fixedLines.join('\n') + (suffix || '\n// })');
                    }
                },
                // Fix missing closing for if statements
                {
                    regex: /if \([^)]+\) \{\s*\/\/ console\.[^{]*\{[^}]*$/gm,
                    fix: (match) => {
                        return match + '\n// });\n}';
                    }
                }
            ];

            patterns.forEach(pattern => {
                const originalContent = content;
                content = content.replace(pattern.regex, pattern.fix);
                if (content !== originalContent) {
                    fixed = true;
                }
            });

            // Specific fixes for known issues
            if (filePath.includes('RegularProductForm.js')) {
                // Make sure file ends properly
                if (!content.trim().endsWith('}')) {
                    content = content.trim();
                }
            }

            if (filePath.includes('RoomsForm.js')) {
                // Fix the specific line 229 issue
                content = content.replace(
                    /(\} else if \(key === 'location')/g,
                    '// });\n$1'
                );
            }

            if (fixed) {
                fs.writeFileSync(filePath, content);
                console.log(`✅ Fixed syntax in ${filePath}`);
            } else {
                console.log(`ℹ️  No changes needed for ${filePath}`);
            }
        } else {
            console.log(`⚠️  File not found: ${filePath}`);
        }
    });
}

console.log('🔧 Starting comprehensive syntax fix...');
fixAllSyntaxIssues();
console.log('✅ Syntax fix complete!');
