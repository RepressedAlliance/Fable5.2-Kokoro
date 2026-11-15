param(
    [Parameter(Mandatory)][string]$PromptFile,
    [Parameter(Mandatory)][string]$OutPath,
    [string[]]$Ref = @()
)
# Generate one image with Codex's built-in image generation and save it to $OutPath.
# The prompt text comes from a UTF-8 file; reference images are attached with -i.
$outDir = Split-Path -Parent $OutPath
$outName = Split-Path -Leaf $OutPath
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
if (Test-Path -LiteralPath $OutPath) { Write-Output "SKIP exists: $OutPath"; exit 0 }
$spec = Get-Content -Raw -LiteralPath $PromptFile -Encoding UTF8
$refNote = ''
if ($Ref.Count -gt 0) {
    $refNote = "The attached image(s) are the approved reference for this character/style. Pass them to the image generation tool as reference input and match them as the spec says. "
}
$full = @"
Use your built-in image generation tool (do not write drawing code) to create exactly ONE image following the spec below. $refNote
Do not add anything the spec does not ask for. After generating, copy the resulting PNG into the current directory as "$outName" and reply with only the saved file name.

IMAGE SPEC:
$spec
"@
$codexArgs = @('exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', $outDir)
foreach ($r in $Ref) { $codexArgs += @('-i', $r) }
$codexArgs += '-'
$log = Join-Path $outDir ($outName + '.log')
$full | codex @codexArgs *> $log
if (Test-Path -LiteralPath $OutPath) { Write-Output "OK $OutPath" } else { Write-Output "FAIL $OutPath (see $log)"; exit 1 }
