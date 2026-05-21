# Gera o app AR em ../tattooar e copia para ./ar (capaztattoo.com/ar)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$tattooar = Join-Path (Split-Path $root -Parent) "tattooar"
$dest = Join-Path $root "ar"

if (-not (Test-Path $tattooar)) {
  Write-Error "Pasta tattooar não encontrada: $tattooar"
}

Push-Location $tattooar
# Produção capaztattoo.com/ar exige VITE_BASE_PATH=/ar/ (.env.production)
$env:VITE_BASE_PATH = "/ar/"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
Pop-Location

if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest | Out-Null
Copy-Item -Path (Join-Path $tattooar "dist\*") -Destination $dest -Recurse -Force

$video = Join-Path $dest "videos\borntobe.mp4"
if (-not (Test-Path $video)) {
  Write-Error "Falta $video - o AR precisa de public/videos/borntobe.mp4 no tattooar."
}
Write-Host "AR sincronizado em $dest"
