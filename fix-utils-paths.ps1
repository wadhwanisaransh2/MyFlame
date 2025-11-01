# PowerShell script to fix all utils import paths
# This script will replace all instances of '../../utils' with '../../Utils'

Write-Host "Starting to fix utils import paths..." -ForegroundColor Green

# Get all TypeScript and TSX files
$files = Get-ChildItem -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*android*" -and $_.FullName -notlike "*ios*" }

$totalFiles = $files.Count
$processedFiles = 0
$modifiedFiles = 0

foreach ($file in $files) {
    $processedFiles++
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace all variations of utils imports
    $content = $content -replace "from ['\"]\.\.\/\.\.\/utils", "from '..\/..\/Utils"
    $content = $content -replace "from ['\"]\.\.\/utils", "from '..\/Utils"
    $content = $content -replace "from ['\"]\.\/src\/utils", "from './src/Utils"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $modifiedFiles++
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Yellow
    }
    
    # Show progress
    if ($processedFiles % 10 -eq 0) {
        Write-Host "Processed $processedFiles of $totalFiles files..." -ForegroundColor Cyan
    }
}

Write-Host "`nCompleted!" -ForegroundColor Green
Write-Host "Total files processed: $processedFiles" -ForegroundColor White
Write-Host "Files modified: $modifiedFiles" -ForegroundColor White
