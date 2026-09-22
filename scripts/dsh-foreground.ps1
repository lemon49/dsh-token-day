<#
.SYNOPSIS
    Run dsh in the foreground so that "restart" comes back in THIS terminal.

.DESCRIPTION
    dsh-toolbox has two restart paths, and dsh picks one automatically:

      * detached   - dsh spawns a helper that relaunches it outside your terminal.
                     The new process is no longer a child of this window, so closing
                     the window does NOT stop dsh.
      * supervised - this script. It stays in the terminal, runs dsh, and when dsh
                     exits it looks for a restart request. If one is there, it runs
                     the very same command again - so the new dsh is still a child of
                     this window, and Ctrl+C / closing the window stops it.

    dsh recognises supervised mode through the DSH_TOOLBOX_REQUEST environment
    variable, which this script sets. That variable is also a safety net: the path
    it points at sits next to a supervisor.json holding this shell's PID, and dsh
    only trusts supervised mode while that PID is still alive. Stop this script
    (Ctrl+C) and dsh falls back to the detached relaunch instead of exiting into
    the void.

.PARAMETER Launch
    The whole command as ONE string, exactly as you would type it. The command is
    parsed with PowerShell's own parser, so the leading "--import" that PowerShell
    would otherwise read as a parameter name is just part of the text:

        .\dsh-foreground.ps1 -Launch 'node --import tsx/esm D:\deepseek-harness\apps\cli\src\bin.ts web'

    Omit it to replay whatever the last dsh start recorded in
    <cache>\last-launch.json (written by the plugin on every boot).

.PARAMETER WorkingDirectory
    Directory to run the command in. Defaults to the cwd recorded in
    last-launch.json when that file exists, otherwise the current directory.

.EXAMPLE
    # Pin the command (also the way to use this script before any dsh has booted
    # with the new plugin, i.e. before last-launch.json exists):
    .\dsh-foreground.ps1 -Launch 'node --import tsx/esm D:\deepseek-harness\apps\cli\src\bin.ts web' -WorkingDirectory D:\deepseek-harness

.EXAMPLE
    # Afterwards - replays the recorded command:
    .\dsh-foreground.ps1
#>
[CmdletBinding()]
param(
    [string] $Launch,
    [string] $WorkingDirectory
)

$ErrorActionPreference = 'Stop'

# Where dsh-toolbox keeps its cache. Must match lib/index.js resolveCacheDir().
$cacheDir = if ($env:DSH_HOME) {
    Join-Path $env:DSH_HOME 'cache\dsh-toolbox'
} else {
    Join-Path $env:USERPROFILE '.dsh\cache\dsh-toolbox'
}
$descriptor = Join-Path $cacheDir 'last-launch.json'

<#
    Split the pasted command line into argv. Using PowerShell's own parser keeps
    quoted paths in one piece and leaves switches such as --import alone.
#>
function Split-DshCommandLine {
    param([Parameter(Mandatory = $true)][string] $Line)

    $tokens = $null
    $errors = $null
    $ast = [System.Management.Automation.Language.Parser]::ParseInput($Line, [ref]$tokens, [ref]$errors)
    if ($errors.Count -gt 0) {
        # A line that starts with a quoted program path ("C:\Program Files\node.exe" ...)
        # is not a command at statement position - the parser reads it as an expression.
        # Prepending the call operator fixes exactly that case.
        $tokens = $null
        $errors = $null
        $ast = [System.Management.Automation.Language.Parser]::ParseInput("& $Line", [ref]$tokens, [ref]$errors)
    }
    if ($errors.Count -gt 0) {
        throw "cannot parse the command line: $($errors[0].Message)"
    }
    $statements = @($ast.EndBlock.Statements)
    if ($statements.Count -ne 1 -or @($statements[0].PipelineElements).Count -ne 1) {
        throw 'give exactly one command, without pipes or semicolons'
    }
    $elements = @($statements[0].PipelineElements[0].CommandElements)
    if ($elements.Count -eq 0) {
        throw 'the command line is empty'
    }
    $parts = @()
    foreach ($element in $elements) {
        if ($element -is [System.Management.Automation.Language.StringConstantExpressionAst]) {
            $parts += $element.Value
        } else {
            # Switches (--import) and anything else: take the raw text.
            $parts += $element.Extent.Text
        }
    }
    return $parts
}

$record = $null
if (Test-Path -LiteralPath $descriptor) {
    $record = Get-Content -LiteralPath $descriptor -Raw | ConvertFrom-Json
}

$command = @()
$runIn = $WorkingDirectory

if ([string]::IsNullOrWhiteSpace($Launch)) {
    if ($null -eq $record) {
        Write-Host "[dsh-toolbox] nothing to run: no -Launch given and no $descriptor" -ForegroundColor Yellow
        Write-Host "[dsh-toolbox] usage: dsh-foreground.ps1 -Launch 'node --import tsx/esm <checkout>\apps\cli\src\bin.ts web'" -ForegroundColor Yellow
        exit 2
    }
    $command = @($record.execPath) + @($record.execArgv) + @($record.argv)
    if ([string]::IsNullOrWhiteSpace($runIn)) { $runIn = $record.cwd }
    Write-Host "[dsh-toolbox] replaying: $($command -join ' ')" -ForegroundColor DarkGray
} else {
    $command = Split-DshCommandLine -Line $Launch
    # The pasted line carries no working directory; prefer the one dsh last ran in.
    if ([string]::IsNullOrWhiteSpace($runIn) -and $null -ne $record) { $runIn = $record.cwd }
}

if (-not [string]::IsNullOrWhiteSpace($runIn) -and (Test-Path -LiteralPath $runIn)) {
    Set-Location -LiteralPath $runIn
}

$exe = $command[0]
$arguments = @()
if ($command.Count -gt 1) { $arguments = $command[1..($command.Count - 1)] }

# Handshake files, one set per supervisor process.
$session = Join-Path ([System.IO.Path]::GetTempPath()) "dsh-toolbox-supervisor-$PID"
New-Item -ItemType Directory -Force -Path $session | Out-Null
$requestPath = Join-Path $session 'restart.request'
Remove-Item -LiteralPath $requestPath -Force -ErrorAction SilentlyContinue

# UTF-8 without BOM: JSON.parse() on the Node side rejects a BOM.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$supervisorJson = @{
    pid       = $PID
    startedAt = (Get-Date).ToUniversalTime().ToString('o')
    command   = $command
    cwd       = (Get-Location).Path
} | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText((Join-Path $session 'supervisor.json'), $supervisorJson, $utf8NoBom)

# This is what puts dsh into supervised mode.
$env:DSH_TOOLBOX_REQUEST = $requestPath

Write-Host "[dsh-toolbox] supervised by pid $PID in $((Get-Location).Path) - a restart will come back into this window." -ForegroundColor DarkGray

try {
    while ($true) {
        & $exe @arguments
        $code = $LASTEXITCODE

        if (-not (Test-Path -LiteralPath $requestPath)) {
            # No restart request: dsh was stopped (Ctrl+C, crash, normal exit).
            Write-Host "[dsh-toolbox] dsh exited (code $code); the terminal is yours again." -ForegroundColor DarkGray
            exit $code
        }

        Remove-Item -LiteralPath $requestPath -Force -ErrorAction SilentlyContinue
        Write-Host "[dsh-toolbox] restart requested - relaunching in this window..." -ForegroundColor DarkGray
        Start-Sleep -Milliseconds 300
    }
}
finally {
    Remove-Item -LiteralPath $session -Recurse -Force -ErrorAction SilentlyContinue
}
