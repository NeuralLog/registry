# Stop the registry service
Write-Host "Stopping the registry service..."

# Navigate to the registry directory
Set-Location $PSScriptRoot

# Stop the registry service
docker-compose down

Write-Host "Registry service stopped"
