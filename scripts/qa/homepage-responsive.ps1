param(
    [string]$Url = 'https://swimbasi.com/',
    [string]$Label = 'before',
    [string]$Session = 'swim-compression',
    [int[]]$Widths = @(390, 768, 1024, 1440, 1536)
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$artifactRoot = Join-Path $taskRoot 'artifacts/homepage-compression'
New-Item -ItemType Directory -Force -Path $artifactRoot | Out-Null
$measureScript = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'homepage-measure.js')
$measureEncoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($measureScript))
function Invoke-PageEval([string]$Script) {
    $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Script))
    & agent-browser --session $Session eval -b $encoded | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Browser evaluation failed' }
}
$reports = @()
foreach ($viewportWidth in $Widths) {
    $viewportHeight = if ($viewportWidth -le 390) { 844 } else { 900 }
    & agent-browser --session $Session set viewport $viewportWidth $viewportHeight
    & agent-browser --session $Session open $Url
    if ($LASTEXITCODE -ne 0) { throw 'Browser navigation failed' }
    Invoke-PageEval '(async () => { window.__homepageLayoutShiftScore = 0; new PerformanceObserver(list => { for (const entry of list.getEntries()) { if (!entry.hadRecentInput) window.__homepageLayoutShiftScore += entry.value; } }).observe({type: "layout-shift", buffered: true}); for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight * .8) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } await Promise.all([...document.images].filter(i => i.hasAttribute("src")).map(i => i.decode().catch(() => {}))); window.scrollTo(0, 0); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); })()'
    & agent-browser --session $Session wait --fn 'document.querySelector("video").readyState >= 1'
    $raw = & agent-browser --session $Session --json eval -b $measureEncoded
    if ($LASTEXITCODE -ne 0) { throw 'Browser measurement failed' }
    $parsed = ($raw -join "`n") | ConvertFrom-Json
    $report = $parsed.data.result
    if (-not $report.viewport) { throw "Unexpected measurement response: $raw" }
    $reports += $report
    & agent-browser --session $Session screenshot --full (Join-Path $artifactRoot "$Label-$viewportWidth.png")
    Write-Output "$Label $viewportWidth : $($report.documentHeight)px; overflow=$($report.overflow.Count); unloaded=$(@($report.images | Where-Object { -not $_.loaded }).Count)"
}
$reports | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $artifactRoot "$Label.json") -Encoding UTF8
