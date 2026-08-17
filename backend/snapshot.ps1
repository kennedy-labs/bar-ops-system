Clear-Host

# =========================================================
# Project Snapshot v2
# =========================================================

$Backend = Join-Path $PSScriptRoot "backend"

if (!(Test-Path $Backend)) {
    Write-Host "ERROR: backend folder not found."
    exit
}

Set-Location $Backend

function Section($title) {
    Write-Host ""
    Write-Host "============================================================"
    Write-Host $title
    Write-Host "============================================================"
}

function ShowFile($path) {
    if (Test-Path $path) {
        Write-Host ""
        Write-Host "-------------------- $path --------------------"
        Get-Content $path
    }
    else {
        Write-Host ""
        Write-Host "$path (not found)"
    }
}

# =========================================================
Section "PROJECT"

Get-Location

# =========================================================
Section "ENVIRONMENT"

Write-Host "Node:"
node -v

Write-Host "`nNPM:"
npm -v

Write-Host "`nPrisma:"
npx prisma -v

Write-Host "`nDocker:"
docker ps

# =========================================================
Section "GIT"

Write-Host "Branch:"
git branch --show-current

Write-Host "`nStatus:"
git status --short

Write-Host "`nRecent commits:"
git log --oneline -5

# =========================================================
Section "PROJECT STRUCTURE"

tree .\src /F

Write-Host ""

tree .\prisma /F

# =========================================================
Section "CONFIGURATION"

ShowFile ".\package.json"

ShowFile ".\tsconfig.json"

Write-Host ""
Write-Host "-------------------- .env --------------------"

if (Test-Path ".\.env") {

    Get-Content .\.env | ForEach-Object {

        if ($_ -match "^DATABASE_URL=") {

            "DATABASE_URL=<hidden>"

        }

        else {

            $_

        }

    }

}

ShowFile ".\prisma\schema.prisma"

# =========================================================
Section "IMPLEMENTATION"

ShowFile ".\src\app.module.ts"

ShowFile ".\src\prisma\prisma.module.ts"
ShowFile ".\src\prisma\prisma.service.ts"

ShowFile ".\src\products\products.module.ts"
ShowFile ".\src\products\products.controller.ts"
ShowFile ".\src\products\products.service.ts"

ShowFile ".\src\users\users.module.ts"
ShowFile ".\src\users\users.controller.ts"
ShowFile ".\src\users\users.service.ts"

ShowFile ".\src\branches\branches.module.ts"
ShowFile ".\src\branches\branches.controller.ts"
ShowFile ".\src\branches\branches.service.ts"

# =========================================================
Section "PROJECT HEALTH"

Write-Host "TypeScript"
npx tsc --noEmit -p .

Write-Host ""

Write-Host "ESLint"
npm run lint

# =========================================================
Section "END OF SNAPSHOT"