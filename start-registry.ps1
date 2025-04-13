# Build and start the registry service
Write-Host "Building and starting the registry service..."

# Navigate to the registry directory
Set-Location $PSScriptRoot

# Build the Docker image
docker-compose build

# Start the registry service
docker-compose up -d

Write-Host "Registry service started at http://localhost:3031"
Write-Host "Test the registry by visiting http://localhost:3031/endpoints"
