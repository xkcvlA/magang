# Run Python app
# Set-Location -Path "C:\Users\scarz\Documents\sem6\magang"
Start-Process "python" "app.py"
Start-Sleep -Seconds 30

# Navigate to server directory and run Node.js server
Set-Location -Path "server"
Start-Process "node" "index.js"
Set-Location -Path ".."

# Navigate to client directory and start npm
Set-Location -Path "client"
Start-Process "npm" "run start"
Set-Location -Path ".."
