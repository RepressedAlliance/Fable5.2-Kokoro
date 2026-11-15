# Run image jobs written by the prompt scripts (tools/g1_r9_prompts.py, tools/w1_wind_prompts.py) in parallel: one
# Codex picture per job through tools/gen.ps1. A job is {prompt, out, refs | ref}; relative paths are from the project.
#   pwsh -NoProfile -File tools/run_jobs.ps1 -Jobs work/qc/tmp/w1/jobs_up0_keysa.json[,more.json] [-Throttle 4]
# Every Codex job holds a few hundred MB: raise -Throttle only as far as the machine's memory allows.
param([Parameter(Mandatory)][string[]]$Jobs, [int]$Throttle = 4)
$ErrorActionPreference = 'Stop'
$proj = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $proj
$Jobs = @($Jobs | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
$work = foreach ($f in $Jobs) { Get-Content -Raw -LiteralPath $f -Encoding UTF8 | ConvertFrom-Json }
$work | ForEach-Object -Parallel {
    $p = $using:proj
    $abs = { param($x) if ([System.IO.Path]::IsPathRooted($x)) { $x } else { Join-Path $p $x } }
    $refs = @(@($_.refs) + @($_.ref) | Where-Object { $_ } | ForEach-Object { & $abs $_ })
    & (Join-Path $p 'tools/gen.ps1') -PromptFile (& $abs $_.prompt) -OutPath (& $abs $_.out) -Ref $refs
} -ThrottleLimit $Throttle
