$files = @(
    "components/forms/NotesForm.js",
    "components/forms/RoomsForm.js", 
    "app/profile/ProfileClientPage.js",
    "app/api/sell/route.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fixing console statements in $file"
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace "console\.log\(", "// console.log("
        $content = $content -replace "console\.error\(", "// console.error("
        $content = $content -replace "console\.warn\(", "// console.warn("
        Set-Content $file -Value $content -Encoding UTF8
    }
}
