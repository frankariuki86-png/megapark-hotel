Param(
    [string]$BranchName = "feature/render-deploy",
    [string]$PrTitle = "Add Render deployment manifest and README",
    [string]$PrBody = "Adds render.yaml, Render deployment README, and Postgres SSL handling in backend/index.js."
)

Write-Host "Preparing branch $BranchName and PR..."

# Ensure git repo
if (-not (Test-Path .git)) {
    Write-Error "This is not a git repository (no .git). Run this script from repo root."
    exit 2
}

$status = git status --porcelain
if ($status) {
    Write-Host "Staging changes..."
    git add render.yaml backend/README_RENDER.md backend/index.js || git add -A
    git commit -m "$PrTitle" -q || Write-Host "No changes to commit or commit failed."
} else {
    Write-Host "Working tree clean. Creating branch anyway."
}

Write-Host "Creating branch $BranchName..."
git checkout -b $BranchName

Write-Host "Pushing branch to origin..."
git push -u origin $BranchName

# Try to create PR with gh CLI
if (Get-Command gh -ErrorAction SilentlyContinue) {
    Write-Host "Creating PR using gh CLI..."
    gh pr create --title "$PrTitle" --body "$PrBody" --base main
    exit $LASTEXITCODE
}

# Fallback: use GitHub API if GITHUB_TOKEN is set
if ($env:GITHUB_TOKEN) {
    $remote = git remote get-url origin
    # Parse owner/repo
    if ($remote -match "github.com[:/](.+?)/(.+?)(\.git)?$") {
        $owner = $matches[1]
        $repo = $matches[2]
        $payload = @{ title = $PrTitle; head = $BranchName; base = 'main'; body = $PrBody } | ConvertTo-Json
        Write-Host "Creating PR via GitHub API for $owner/$repo..."
        $resp = Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$owner/$repo/pulls" -Headers @{ Authorization = "token $($env:GITHUB_TOKEN)"; 'User-Agent' = 'create-pr-script' } -Body $payload -ContentType 'application/json'
        Write-Host "PR created:" $resp.html_url
        exit 0
    } else {
        Write-Error "Could not parse remote URL: $remote"
        exit 3
    }
}

Write-Host "Neither gh CLI nor GITHUB_TOKEN available. To finish, run one of the following commands manually:"
Write-Host "  gh pr create --title '$PrTitle' --body '$PrBody' --base main"
Write-Host "OR set GITHUB_TOKEN env var and re-run this script."
