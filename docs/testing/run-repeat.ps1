# Repeticion en OTRO DIA (solo ASCII): vuelve a lanzar, con la sonda nueva, todos los servidores ya probados (una pasada cada uno).
# Sirve para dos cosas: 1) comprobar si algun hash cambia con los dias sin que cambie la version (por ejemplo una fecha dentro de una descripcion);
# 2) registrar con que era del protocolo responde cada servidor: la sonda nueva prueba primero server/discover (revision 2026-07-28) y si no, initialize.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-repeat.ps1
# Reanudable: si se corta, vuelve a ejecutarlo y salta lo hecho (marcas .done en out\repeat). Para repetir todo, borra out\repeat.
# Resultado: out\repeat\TODO.txt (envialo como archivo). Calcula unos 30 a 40 minutos.
# Necesita en C:\probe\scripts el mcp-probe.mjs NUEVO y el fake-mcp-server.mjs. Seguridad: sin credenciales reales, solo C:\probe montado, limites de recursos, hostname fijo.
$ErrorActionPreference = "Continue"
$dir = "out/repeat"
New-Item -ItemType Directory -Force -Path $dir, "calls" | Out-Null
docker info *> $null
if ($LASTEXITCODE -ne 0) { Write-Host "Docker no esta en marcha. Abre Docker Desktop, espera a que arranque del todo y vuelve a ejecutar el script."; exit 1 }
$nodeImg = "node:22-slim"
$uvImg = "ghcr.io/astral-sh/uv:python3.12-bookworm-slim"
$env_txt = "Docker on Windows, no real credentials, filler values, fixed hostname, resource limits"
$limits = @("--hostname=probe-host", "--memory=3g", "--cpus=2", "--pids-limit=1024", "--security-opt=no-new-privileges")
$tiempos = "$dir/TIEMPOS.csv"
if (-not (Test-Path $tiempos)) { "slug,paquete,primera_prueba,inicio,fin,segundos" | Out-File $tiempos -Encoding ascii }
function Safe-Name($s) { return ($s -replace '[^A-Za-z0-9._-]', '_') }

# kubeconfig inventado para kubernetes-mcp-server y mcp-server-kubernetes
$kube = @'
apiVersion: v1
kind: Config
clusters:
- name: fake
  cluster:
    server: https://127.0.0.1:6443
    insecure-skip-tls-verify: true
users:
- name: fake
  user:
    token: not-a-real-token
contexts:
- name: fake
  context:
    cluster: fake
    user: fake
current-context: fake
'@
Set-Content -Path "calls/kubeconfig-fake.yaml" -Value $kube -Encoding ascii

function Run-Probe {
  param($slug, $pkg, $first, $kind, $cmd, $envs = @())
  $name = (Safe-Name $slug) + "." + (Safe-Name $pkg)
  if (Test-Path "$dir/$name.done") { Write-Host "(ya hecho) $name"; return }
  Write-Host ("== {0} [{1}]  (primera prueba {2})  [{3}]" -f $slug, $pkg, $first, (Get-Date -Format "HH:mm:ss"))
  $t0 = Get-Date
  $envArgs = @()
  foreach ($e in $envs) { $envArgs += "--env=$e" }
  if ($kind -eq "node") {
    $cmdArgs = $cmd -split " "
    & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/mcp-probe.mjs "--slug=$slug" "--package=$pkg" "--timeout=300" "--tools-out=$dir/$name.tools.json" "--record-out=$dir/$name.record.json" @envArgs "--environment=$nodeImg, $env_txt, repeat" -- @cmdArgs 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } elseif ($kind -eq "bun") {
    $inner = "npm i -g bun > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug '--package=$pkg' --timeout=300 --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json '--environment=$nodeImg + bun, $env_txt, repeat' -- $cmd"
    & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } else {
    $envStr = ""
    foreach ($e in $envArgs) { $envStr += "'" + $e + "' " }
    $inner = "apt-get update -qq > /dev/null 2>&1 && apt-get install -y -qq nodejs git > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug '--package=$pkg' --timeout=300 --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json $envStr '--environment=uv python3.12 image, $env_txt, repeat' -- $cmd"
    & docker run --rm @limits -v "${PWD}:/work" -w /work $uvImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  }
  $t1 = Get-Date
  ("{0},{1},{2},{3},{4},{5}" -f $slug, $pkg, $first, $t0.ToString("s"), $t1.ToString("s"), [int]($t1 - $t0).TotalSeconds) | Add-Content $tiempos -Encoding ascii
  "ok" | Out-File "$dir/$name.done" -Encoding ascii
}

Run-Probe -slug "playwright-mcp" -pkg "@playwright/mcp@0.0.83" -first "2026-10-25" -kind "node" -cmd "npx -y @playwright/mcp@0.0.83" -envs @()
Run-Probe -slug "chrome-devtools-mcp" -pkg "chrome-devtools-mcp@1.12.0" -first "2026-10-25" -kind "node" -cmd "npx -y chrome-devtools-mcp@1.12.0" -envs @()
Run-Probe -slug "codebase-memory-mcp" -pkg "codebase-memory-mcp@0.12.1" -first "2026-10-25" -kind "node" -cmd "npx -y codebase-memory-mcp@0.12.1" -envs @()
Run-Probe -slug "context7" -pkg "@upstash/context7-mcp@4.4.4" -first "2026-10-25" -kind "node" -cmd "npx -y @upstash/context7-mcp@4.4.4" -envs @()
Run-Probe -slug "desktop-commander-mcp" -pkg "@wonderwhy-er/desktop-commander@0.3.1" -first "2026-10-25" -kind "node" -cmd "npx -y @wonderwhy-er/desktop-commander@0.3.1" -envs @()
Run-Probe -slug "excel-mcp-server" -pkg "excel-mcp-server@2.2.2" -first "2026-10-25" -kind "uv" -cmd "uvx excel-mcp-server@2.2.2 stdio" -envs @()
Run-Probe -slug "mcp-reference-servers" -pkg "@modelcontextprotocol/server-memory@2.0.0" -first "2026-10-25" -kind "node" -cmd "npx -y @modelcontextprotocol/server-memory@2.0.0" -envs @()
Run-Probe -slug "mcp-reference-servers" -pkg "@modelcontextprotocol/server-everything@2.0.0" -first "2026-10-25" -kind "node" -cmd "npx -y @modelcontextprotocol/server-everything@2.0.0" -envs @()
Run-Probe -slug "mcp-reference-servers" -pkg "mcp-server-fetch@2026.10.19" -first "2026-10-25" -kind "uv" -cmd "uvx mcp-server-fetch@2026.10.19" -envs @()
Run-Probe -slug "mcp-reference-servers" -pkg "mcp-server-git@2026.10.19" -first "2026-10-25" -kind "uv" -cmd "uvx mcp-server-git@2026.10.19" -envs @()
Run-Probe -slug "dbhub" -pkg "@bytebase/dbhub@0.22.5" -first "2026-10-25" -kind "node" -cmd "npx -y @bytebase/dbhub@0.22.5 --demo" -envs @()
Run-Probe -slug "dbhub" -pkg "@bytebase/dbhub@0.22.6" -first "2026-10-25" -kind "node" -cmd "npx -y @bytebase/dbhub@0.22.6 --demo" -envs @()
Run-Probe -slug "mysql-mcp-server" -pkg "mysql-mcp-server@0.4.4" -first "2026-10-25" -kind "uv" -cmd "uvx --from mysql-mcp-server==0.4.4 mysql_mcp_server" -envs @("MYSQL_HOST=127.0.0.1", "MYSQL_USER=probe", "MYSQL_PASSWORD=probe", "MYSQL_DATABASE=probe")
Run-Probe -slug "mcp-server-kubernetes" -pkg "mcp-server-kubernetes@4.1.9" -first "2026-10-25" -kind "node" -cmd "npx -y mcp-server-kubernetes@4.1.9" -envs @()
Run-Probe -slug "browser-tools-mcp" -pkg "@agentdeskai/browser-tools-mcp@2.0.2" -first "2026-10-25" -kind "node" -cmd "npx -y @agentdeskai/browser-tools-mcp@2.0.2" -envs @()
Run-Probe -slug "context-mode" -pkg "context-mode@1.0.169" -first "2026-10-25" -kind "node" -cmd "npx -y context-mode@1.0.169" -envs @()
Run-Probe -slug "n8n-mcp" -pkg "n8n-mcp@2.99.1" -first "2026-10-25" -kind "node" -cmd "npx -y n8n-mcp@2.99.1" -envs @("MCP_MODE=stdio", "LOG_LEVEL=error")
Run-Probe -slug "mongodb-mcp-server" -pkg "mongodb-mcp-server@3.1.0" -first "2026-10-25" -kind "node" -cmd "npx -y mongodb-mcp-server@3.1.0" -envs @()
Run-Probe -slug "mongodb-mcp-server" -pkg "mongodb-mcp-server@3.1.0 --readOnly" -first "2026-10-26" -kind "node" -cmd "npx -y mongodb-mcp-server@3.1.0 --readOnly" -envs @()
Run-Probe -slug "redis-mcp-server" -pkg "redis-mcp-server@0.5.1" -first "2026-10-25" -kind "uv" -cmd "uvx redis-mcp-server@0.5.1 --url redis://127.0.0.1:6379/0" -envs @()
Run-Probe -slug "qdrant-mcp-server" -pkg "mcp-server-qdrant@0.8.1" -first "2026-10-25" -kind "uv" -cmd "uvx mcp-server-qdrant@0.8.1" -envs @("QDRANT_LOCAL_PATH=/tmp/qdrant-probe", "COLLECTION_NAME=probe")
Run-Probe -slug "motherduck-mcp-server" -pkg "mcp-server-motherduck@1.1.0" -first "2026-10-25" -kind "uv" -cmd "uvx mcp-server-motherduck@1.1.0 --db-path :memory: --read-write" -envs @()
Run-Probe -slug "kubernetes-mcp-server" -pkg "kubernetes-mcp-server@0.0.69" -first "2026-10-25" -kind "node" -cmd "npx -y kubernetes-mcp-server@0.0.69" -envs @("KUBECONFIG=/work/calls/kubeconfig-fake.yaml")
Run-Probe -slug "serena" -pkg "serena-agent@2.1.0" -first "2026-10-28" -kind "uv" -cmd "uvx --from serena-agent==2.1.0 serena start-mcp-server" -envs @()
Run-Probe -slug "blender-mcp" -pkg "mcp-for-blender@2.2.4 (BLENDER_MCP_SAFE_MODE=1)" -first "2026-10-28" -kind "uv" -cmd "uvx mcp-for-blender@2.2.4" -envs @("BLENDER_MCP_SAFE_MODE=1", "DISABLE_TELEMETRY=true")
Run-Probe -slug "blender-mcp" -pkg "mcp-for-blender@2.2.4" -first "2026-10-28" -kind "uv" -cmd "uvx mcp-for-blender@2.2.4" -envs @("DISABLE_TELEMETRY=true")
Run-Probe -slug "grafana-mcp-server" -pkg "mcp-grafana@2.1.1 --disable-write" -first "2026-10-28" -kind "uv" -cmd "uvx mcp-grafana@2.1.1 --disable-write" -envs @("GRAFANA_URL=http://localhost:3000", "GRAFANA_SERVICE_ACCOUNT_TOKEN=filler-not-a-real-token")
Run-Probe -slug "grafana-mcp-server" -pkg "mcp-grafana@2.1.1" -first "2026-10-28" -kind "uv" -cmd "uvx mcp-grafana@2.1.1" -envs @("GRAFANA_URL=http://localhost:3000", "GRAFANA_SERVICE_ACCOUNT_TOKEN=filler-not-a-real-token")
Run-Probe -slug "clickhouse-mcp-server" -pkg "mcp-clickhouse@0.7.0 (CLICKHOUSE_ALLOW_WRITE_ACCESS=false)" -first "2026-10-28" -kind "uv" -cmd "uvx mcp-clickhouse@0.7.0" -envs @("CLICKHOUSE_HOST=localhost", "CLICKHOUSE_USER=default", "CLICKHOUSE_PASSWORD=filler", "CLICKHOUSE_ALLOW_WRITE_ACCESS=false")
Run-Probe -slug "clickhouse-mcp-server" -pkg "mcp-clickhouse@0.7.0 (CLICKHOUSE_ALLOW_WRITE_ACCESS=true)" -first "2026-10-28" -kind "uv" -cmd "uvx mcp-clickhouse@0.7.0" -envs @("CLICKHOUSE_HOST=localhost", "CLICKHOUSE_USER=default", "CLICKHOUSE_PASSWORD=filler", "CLICKHOUSE_ALLOW_WRITE_ACCESS=true")
Run-Probe -slug "mcp-toolbox-for-databases" -pkg "@toolbox-sdk/server@1.15.0 --prebuilt=sqlite" -first "2026-10-28" -kind "node" -cmd "npx -y @toolbox-sdk/server@1.15.0 --prebuilt=sqlite --stdio" -envs @("SQLITE_DATABASE=/tmp/filler.db")
Run-Probe -slug "talk-to-figma-mcp" -pkg "cursor-talk-to-figma-mcp@0.3.5" -first "2026-10-28" -kind "bun" -cmd "bunx cursor-talk-to-figma-mcp@0.3.5" -envs @()

$todo = "$dir/TODO.txt"
"######## TIEMPOS" | Out-File $todo -Encoding ascii
Get-Content $tiempos | Add-Content $todo -Encoding ascii
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -ne "TODO.txt" } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\repeat\TODO.txt."
