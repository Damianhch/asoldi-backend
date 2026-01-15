# Kill any process on port 3000
$port = 3000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Write-Host "Killing process $process on port $port..."
    Stop-Process -Id $process -Force
    Start-Sleep -Seconds 1
}

# Start dev server
Write-Host "Starting dev server on port $port..."
npm run dev

