$files = @(
    "components/forms/NotesForm.js",
    "components/forms/RoomsForm.js", 
    "app/profile/ProfileClientPage.js",
    "app/api/sell/route.js",
    "app/actions.js",
    "components/AuthTestPage.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Removing console statements from $file"
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Remove only simple console.log statements (single line)
        $content = $content -replace "(?m)^\s*console\.log\([^;]*?\);\s*$", ""
        $content = $content -replace "(?m)^\s*console\.error\([^;]*?\);\s*$", ""
        $content = $content -replace "(?m)^\s*console\.warn\([^;]*?\);\s*$", ""
        
        # Clean up extra blank lines that might be left
        $content = $content -replace "(?m)^\s*$\n\s*$", "`n"
        
        Set-Content $file -Value $content -Encoding UTF8
    }
}
