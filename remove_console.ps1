$files = @(
    "components/forms/NotesForm.js",
    "components/forms/RoomsForm.js", 
    "app/profile/ProfileClientPage.js",
    "app/api/sell/route.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Removing console statements from $file"
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Remove console.log statements completely (including multi-line)
        $content = $content -replace "(?s)console\.log\([^;]*?\);", ""
        $content = $content -replace "(?s)console\.error\([^;]*?\);", ""
        $content = $content -replace "(?s)console\.warn\([^;]*?\);", ""
        
        # Clean up extra blank lines that might be left
        $content = $content -replace "(?m)^\s*$\n", ""
        
        Set-Content $file -Value $content -Encoding UTF8
    }
}
