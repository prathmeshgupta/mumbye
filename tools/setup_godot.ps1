# Mumbye Godot Toolchain Setup
$ErrorActionPreference = "Stop"
$toolsDir = Join-Path $PSScriptRoot "godot"
$targetExe = Join-Path $toolsDir "Godot_v4.3-stable_win64.exe"

if (Test-Path $targetExe) {
    Write-Host "[OK] Godot 4.3 executable already installed at $targetExe" -ForegroundColor Green
    exit 0
}

Write-Host "[INFO] Downloading Godot 4.3 portable engine..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
$zipPath = Join-Path $toolsDir "godot.zip"
$url = "https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_win64.exe.zip"

Invoke-WebRequest -Uri $url -OutFile $zipPath
Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
Remove-Item $zipPath -Force
Write-Host "[OK] Godot 4.3 successfully installed." -ForegroundColor Green
