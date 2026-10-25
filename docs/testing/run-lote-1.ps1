# Lote 1 de pruebas: handshake + tools/list de 10 servidores, cada uno en su contenedor, sin credenciales.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-1.ps1
# Resultado: una carpeta out\ con un .txt y un .tools.json por servidor, y out\TODO.txt con todo junto para pegar.
$ErrorActionPreference = "Continue"
New-Item -ItemType Directory -Force -Path out | Out-Null
$nodeImg = "node:22-slim"
$uvImg = "ghcr.io/astral-sh/uv:python3.12-bookworm-slim"
$env_txt = "Docker on Windows, no credentials, synthetic data"

# Nombre de archivo único por paquete: varios servidores comparten ficha y se pisarían los resultados.
function Safe-Name($pkg) { return ($pkg -replace '[^A-Za-z0-9._-]', '_') }

function Probe-Npm($slug, $pkg, $cmd) {
  Write-Host "== $slug ($pkg)"
  $f = Safe-Name $pkg
  $args2 = $cmd -split " "
  & docker run --rm -v "${PWD}:/work" -w /work $nodeImg node scripts/mcp-probe.mjs "--slug=$slug" "--package=$pkg" "--timeout=240" "--tools-out=out/$f.tools.json" "--environment=$nodeImg, $env_txt" -- @args2 2>&1 | Tee-Object -FilePath "out/$f.txt"
}
function Probe-Uv($slug, $pkg, $cmd) {
  Write-Host "== $slug ($pkg)"
  $f = Safe-Name $pkg
  $inner = "apt-get update -qq > /dev/null 2>&1 && apt-get install -y -qq nodejs git > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=240 --tools-out=out/$f.tools.json '--environment=uv python3.12 image, $env_txt' -- $cmd"
  & docker run --rm -v "${PWD}:/work" -w /work $uvImg sh -c $inner 2>&1 | Tee-Object -FilePath "out/$f.txt"
}

# Versiones fijadas el 24 oct 2026 (las últimas publicadas ese día).
Probe-Npm "playwright-mcp"        "@playwright/mcp@0.0.83"                         "npx -y @playwright/mcp@0.0.83"
Probe-Npm "mcp-reference-servers" "@modelcontextprotocol/server-memory@2.0.0"      "npx -y @modelcontextprotocol/server-memory@2.0.0"
Probe-Npm "mcp-reference-servers" "@modelcontextprotocol/server-everything@2.0.0"  "npx -y @modelcontextprotocol/server-everything@2.0.0"
Probe-Npm "context7"              "@upstash/context7-mcp@4.4.4"                    "npx -y @upstash/context7-mcp@4.4.4"
Probe-Npm "chrome-devtools-mcp"   "chrome-devtools-mcp@1.12.0"                     "npx -y chrome-devtools-mcp@1.12.0"
Probe-Npm "desktop-commander-mcp" "@wonderwhy-er/desktop-commander@0.3.1"          "npx -y @wonderwhy-er/desktop-commander@0.3.1"
Probe-Npm "codebase-memory-mcp"   "codebase-memory-mcp@0.12.1"                     "npx -y codebase-memory-mcp@0.12.1"
Probe-Uv  "mcp-reference-servers" "mcp-server-fetch@2026.10.19"                    "uvx mcp-server-fetch@2026.10.19"
Probe-Uv  "mcp-reference-servers" "mcp-server-git@2026.10.19"                      "uvx mcp-server-git@2026.10.19"
Probe-Uv  "excel-mcp-server"      "excel-mcp-server@2.2.2"                         "uvx excel-mcp-server@2.2.2 stdio"

Get-ChildItem out\*.txt -Exclude TODO.txt | Get-Content | Set-Content out\TODO.txt
Write-Host "`nListo. Pega aquí el contenido de out\TODO.txt (o súbelo como archivo)."
