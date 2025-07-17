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
        
        # First, restore the original content in case it was broken
        $content = $content -replace "// console\.log\(", "console.log("
        $content = $content -replace "// console\.error\(", "console.error("
        $content = $content -replace "// console\.warn\(", "console.warn("
        
        # Now properly comment out console statements by finding complete statements
        # Match console.log with its complete statement including multi-line objects
        $content = $content -replace "(?s)console\.log\(([^;]*?)\);", "// console.log(`$1);"
        $content = $content -replace "(?s)console\.error\(([^;]*?)\);", "// console.error(`$1);"
        $content = $content -replace "(?s)console\.warn\(([^;]*?)\);", "// console.warn(`$1);"
        
        # Handle multi-line console statements that span multiple lines
        $lines = $content -split "`n"
        $newLines = @()
        $inConsoleBlock = $false
        $braceCount = 0
        $parenCount = 0
        
        for ($i = 0; $i -lt $lines.Length; $i++) {
            $line = $lines[$i]
            
            # Check if line starts a console statement
            if ($line -match "^\s*console\.(log|error|warn)\s*\(") {
                $inConsoleBlock = $true
                $braceCount = 0
                $parenCount = 0
                $line = $line -replace "console\.", "// console."
            }
            
            if ($inConsoleBlock) {
                # Count braces and parentheses
                $braceCount += ($line.ToCharArray() | Where-Object { $_ -eq '{' }).Count
                $braceCount -= ($line.ToCharArray() | Where-Object { $_ -eq '}' }).Count
                $parenCount += ($line.ToCharArray() | Where-Object { $_ -eq '(' }).Count
                $parenCount -= ($line.ToCharArray() | Where-Object { $_ -eq ')' }).Count
                
                # If we're in a console block and the line doesn't start with //, add //
                if (-not ($line -match "^\s*//")) {
                    $line = $line -replace "^(\s*)", "`$1// "
                }
                
                # Check if we've closed all braces and parentheses and found a semicolon
                if ($braceCount -eq 0 -and $parenCount -eq 0 -and $line -match ";\s*$") {
                    $inConsoleBlock = $false
                }
            }
            
            $newLines += $line
        }
        
        $content = $newLines -join "`n"
        Set-Content $file -Value $content -Encoding UTF8
    }
}
