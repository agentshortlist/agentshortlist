# Repeticion 3 (solo ASCII): vuelve a lanzar los 14 registros que NO respondieron a server/discover en 5 s, ahora con la espera de 20 s,
# para saber si eran servidores de la era anterior o servidores modernos lentos. Una pasada cada uno.
# Sirve para dos cosas: 1) comprobar si algun hash cambia con los dias sin que cambie la version (por ejemplo una fecha dentro de una descripcion);
# 2) registrar con que era del protocolo responde cada servidor: la sonda nueva prueba primero server/discover (revision 2026-07-28) y si no, initialize.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-repeat.ps1
# Reanudable: si se corta, vuelve a ejecutarlo y salta lo hecho (marcas .done en out\repeat3). Para repetir todo, borra out\repeat3.
# Resultado: out\repeat3\TODO.txt (envialo como archivo). Calcula unos 30 a 40 minutos.
# Necesita en C:\probe\scripts el mcp-probe.mjs NUEVO y el fake-mcp-server.mjs. Seguridad: sin credenciales reales, solo C:\probe montado, limites de recursos, hostname fijo.
$ErrorActionPreference = "Continue"
$dir = "out/repeat3"
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

Run-Probe -slug "codebase-memory-mcp" -pkg "codebase-memory-mcp@0.12.1" -first "2026-10-25" -kind "node" -cmd "npx -y codebase-memory-mcp@0.12.1" -envs @()
Run-Probe -slug "context7" -pkg "@upstash/context7-mcp@4.4.4" -first "2026-10-25" -kind "node" -cmd "npx -y @upstash/context7-mcp@4.4.4" -envs @()
Run-Probe -slug "mcp-reference-servers" -pkg "@modelcontextprotocol/server-everything@2.0.0" -first "2026-10-25" -kind "node" -cmd "npx -y @modelcontextprotocol/server-everything@2.0.0" -envs @()
Run-Probe -slug "dbhub" -pkg "@bytebase/dbhub@0.22.5" -first "2026-10-25" -kind "node" -cmd "npx -y @bytebase/dbhub@0.22.5 --demo" -envs @()
Run-Probe -slug "dbhub" -pkg "@bytebase/dbhub@0.22.6" -first "2026-10-25" -kind "node" -cmd "npx -y @bytebase/dbhub@0.22.6 --demo" -envs @()
Run-Probe -slug "mcp-server-kubernetes" -pkg "mcp-server-kubernetes@4.1.9" -first "2026-10-25" -kind "node" -cmd "npx -y mcp-server-kubernetes@4.1.9" -envs @()
Run-Probe -slug "browser-tools-mcp" -pkg "@agentdeskai/browser-tools-mcp@2.0.2" -first "2026-10-25" -kind "node" -cmd "npx -y @agentdeskai/browser-tools-mcp@2.0.2" -envs @()
Run-Probe -slug "context-mode" -pkg "context-mode@1.0.169" -first "2026-10-25" -kind "node" -cmd "npx -y context-mode@1.0.169" -envs @()
Run-Probe -slug "n8n-mcp" -pkg "n8n-mcp@2.99.1" -first "2026-10-25" -kind "node" -cmd "npx -y n8n-mcp@2.99.1" -envs @("MCP_MODE=stdio", "LOG_LEVEL=error")
Run-Probe -slug "mongodb-mcp-server" -pkg "mongodb-mcp-server@3.1.0" -first "2026-10-25" -kind "node" -cmd "npx -y mongodb-mcp-server@3.1.0" -envs @()
Run-Probe -slug "mongodb-mcp-server" -pkg "mongodb-mcp-server@3.1.0 --readOnly" -first "2026-10-26" -kind "node" -cmd "npx -y mongodb-mcp-server@3.1.0 --readOnly" -envs @()
Run-Probe -slug "redis-mcp-server" -pkg "redis-mcp-server@0.5.1" -first "2026-10-25" -kind "uv" -cmd "uvx redis-mcp-server@0.5.1 --url redis://127.0.0.1:6379/0" -envs @()
Run-Probe -slug "qdrant-mcp-server" -pkg "mcp-server-qdrant@0.8.1" -first "2026-10-25" -kind "uv" -cmd "uvx mcp-server-qdrant@0.8.1" -envs @("QDRANT_LOCAL_PATH=/tmp/qdrant-probe", "COLLECTION_NAME=probe")
Run-Probe -slug "mcp-toolbox-for-databases" -pkg "@toolbox-sdk/server@1.15.0 --prebuilt=sqlite" -first "2026-10-28" -kind "node" -cmd "npx -y @toolbox-sdk/server@1.15.0 --prebuilt=sqlite --stdio" -envs @("SQLITE_DATABASE=/tmp/filler.db")

$todo = "$dir/TODO.txt"
"######## TIEMPOS" | Out-File $todo -Encoding ascii
Get-Content $tiempos | Add-Content $todo -Encoding ascii
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -ne "TODO.txt" } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\repeat3\TODO.txt."
