param([string]$Blender = 'blender', [string]$Python = 'python')
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    & $Python scripts/make-screen-textures.py
    if ($LASTEXITCODE -ne 0) { throw 'Screen texture generation failed' }
    & $Blender --background --python art/build_scene.py
    if ($LASTEXITCODE -ne 0) { throw 'Blender export failed' }
    & $Python scripts/optimize-renders.py
    if ($LASTEXITCODE -ne 0) { throw 'Poster optimization failed' }
} finally { Pop-Location }
