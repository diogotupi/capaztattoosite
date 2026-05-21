# Gera o app AR em ../tattooar e copia para ./ar (capaztattoo.com/ar)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$tattooar = Join-Path (Split-Path $root -Parent) "tattooar"
$dest = Join-Path $root "ar"

if (-not (Test-Path $tattooar)) {
  Write-Error "Pasta tattooar não encontrada: $tattooar"
}

Push-Location $tattooar
npm run build
Pop-Location

if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest | Out-Null
Copy-Item -Path (Join-Path $tattooar "dist\*") -Destination $dest -Recurse -Force
Write-Host "AR sincronizado em $dest"
