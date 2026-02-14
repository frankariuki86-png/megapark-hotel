<#
  Template script to create a Render Postgres database and Web Service via the Render API.
  WARNING: Do NOT paste API keys into chat. Set the following env vars locally before running:
    $env:RENDER_API_KEY = 'your-render-api-key'
    $env:GITHUB_REMOTE = 'https://github.com/owner/repo.git' (optional, used for repo link)

  The script will show the curl payloads and attempt to call Render API when RENDER_API_KEY is present.
  Confirm payloads before running in production.
#>

if (-not $env:RENDER_API_KEY) {
    Write-Host "RENDER_API_KEY not set. Set it in your shell and re-run. Example (PowerShell):"
    Write-Host "$env:RENDER_API_KEY = 'rnd_xxx'"
    exit 2
}

$renderApi = 'https://api.render.com/v1'

Write-Host "Preparing Render API payloads (preview)."

# 1) Create a Postgres database (template payload)
$dbPayload = @{
    name = 'megapark-db'
    plan = 'starter'
    region = 'oregon'
    # add other options if desired
} | ConvertTo-Json

Write-Host "POST $renderApi/databases"
Write-Host $dbPayload

Write-Host "To create the DB now, run (example):"
Write-Host "curl -X POST \"$renderApi/databases\" -H \"Authorization: Bearer $($env:RENDER_API_KEY)\" -H \"Content-Type: application/json\" -d '$dbPayload'"

# 2) Create a Web Service (template payload)
$servicePayload = @{
    service = @{
        name = 'megapark-backend'
        env = 'node'
        plan = 'starter'
        region = 'oregon'
        branch = 'main'
        repo = @{ url = (git remote get-url origin) }
        buildCommand = 'npm install'
        startCommand = 'npm start'
        root = 'backend'
    }
} | ConvertTo-Json

Write-Host "POST $renderApi/services"
Write-Host $servicePayload

Write-Host "To create the service now, run (example):"
Write-Host "curl -X POST \"$renderApi/services\" -H \"Authorization: Bearer $($env:RENDER_API_KEY)\" -H \"Content-Type: application/json\" -d '$servicePayload'"

Write-Host "NOTE: Render's API requires specific fields and may vary; review their API docs before creating services programmatically."
Write-Host "If you want, set env var RENDER_API_KEY here in your terminal and re-run this script to attempt creation."
