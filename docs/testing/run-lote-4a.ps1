# Lote 4a (solo ASCII): validacion CORTA de los comandos de arranque de 6 candidatos. No es el lote definitivo.
# Para cada servidor: 1) su ayuda (--help) con limite de 40 s, 2) UNA pasada de la sonda con limite de 60 s.
# Sin credenciales reales: los valores de relleno estan marcados como "filler" y no tocan ningun servicio.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-4a.ps1
# Resultado: out\lote4a\TODO.txt (envialo como archivo). Deberia tardar menos de 15 minutos.
# Seguridad: sin credenciales, sin montar carpetas personales (solo C:\probe), limites de memoria, CPU y procesos, hostname fijo.
$ErrorActionPreference = "Continue"
$dir = "out/lote4a"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker no esta en marcha. Abre Docker Desktop, espera a que arranque del todo y vuelve a ejecutar el script."
  exit 1
}
$nodeImg = "node:22-slim"
$uvImg = "ghcr.io/astral-sh/uv:python3.12-bookworm-slim"
$env_txt = "Docker on Windows, no real credentials, filler values, fixed hostname, resource limits"
$limits = @("--hostname=probe-host", "--memory=3g", "--cpus=2", "--pids-limit=1024", "--security-opt=no-new-privileges")
$tiempos = "$dir/TIEMPOS.csv"
"slug,paso,inicio,fin,segundos" | Out-File $tiempos -Encoding ascii
function Safe-Name($s) { return ($s -replace '[^A-Za-z0-9._-]', '_') }

# Paso 1: ayuda del comando, con limite de 40 s (dentro del contenedor).
function Run-Help {
  param($slug, $kind, $helpCmd)
  Write-Host ("== {0} --help  [{1}]" -f $slug, (Get-Date -Format "HH:mm:ss"))
  $t0 = Get-Date
  $name = (Safe-Name $slug) + ".help"
  if ($kind -eq "node") {
    & docker run --rm @limits $nodeImg sh -c "timeout 40 $helpCmd" 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } else {
    & docker run --rm @limits $uvImg sh -c "timeout 40 $helpCmd" 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  }
  $t1 = Get-Date
  ("{0},help,{1},{2},{3}" -f $slug, $t0.ToString("s"), $t1.ToString("s"), [int]($t1 - $t0).TotalSeconds) | Add-Content $tiempos -Encoding ascii
}

# Paso 2: una pasada de la sonda con limite de 60 s.
function Run-Probe {
  param($slug, $pkg, $kind, $cmd, $envs = @())
  Write-Host ("== {0} sonda  [{1}]" -f $slug, (Get-Date -Format "HH:mm:ss"))
  $t0 = Get-Date
  $name = (Safe-Name $slug) + ".probe"
  $envArgs = @()
  foreach ($e in $envs) { $envArgs += "--env=$e" }
  if ($kind -eq "node") {
    $cmdArgs = $cmd -split " "
    & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/mcp-probe.mjs "--slug=$slug" "--package=$pkg" "--timeout=60" "--tools-out=$dir/$name.tools.json" "--record-out=$dir/$name.record.json" @envArgs "--environment=$nodeImg, $env_txt" -- @cmdArgs 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } elseif ($kind -eq "bun") {
    $inner = "npm i -g bun > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=60 --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json '--environment=$nodeImg + bun, $env_txt' -- $cmd"
    & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } else {
    $envStr = ""
    foreach ($e in $envArgs) { $envStr += "'" + $e + "' " }
    $inner = "apt-get update -qq > /dev/null 2>&1 && apt-get install -y -qq nodejs git > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=60 --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json $envStr '--environment=uv python3.12 image, $env_txt' -- $cmd"
    & docker run --rm @limits -v "${PWD}:/work" -w /work $uvImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  }
  $t1 = Get-Date
  ("{0},sonda,{1},{2},{3}" -f $slug, $t0.ToString("s"), $t1.ToString("s"), [int]($t1 - $t0).TotalSeconds) | Add-Content $tiempos -Encoding ascii
}

# 1. serena (PyPI serena-agent 2.1.0). El comando de servidor MCP no esta confirmado: la ayuda dira cual es.
Run-Help  -slug "serena" -kind "uv" -helpCmd "uvx --from serena-agent==2.1.0 serena --help"
Run-Probe -slug "serena" -pkg "serena-agent@2.1.0" -kind "uv" -cmd "uvx --from serena-agent==2.1.0 serena start-mcp-server"

# 2. blender-mcp (PyPI mcp-for-blender 2.2.4), modo seguro y sin telemetria.
Run-Help  -slug "blender-mcp" -kind "uv" -helpCmd "uvx mcp-for-blender@2.2.4 --help"
Run-Probe -slug "blender-mcp" -pkg "mcp-for-blender@2.2.4" -kind "uv" -cmd "uvx mcp-for-blender@2.2.4" -envs @("BLENDER_MCP_SAFE_MODE=1", "DISABLE_TELEMETRY=true")

# 3. grafana (PyPI mcp-grafana 2.1.1), solo lectura, token de relleno.
Run-Help  -slug "grafana-mcp-server" -kind "uv" -helpCmd "uvx mcp-grafana@2.1.1 --help"
Run-Probe -slug "grafana-mcp-server" -pkg "mcp-grafana@2.1.1" -kind "uv" -cmd "uvx mcp-grafana@2.1.1 --disable-write" -envs @("GRAFANA_URL=http://localhost:3000", "GRAFANA_SERVICE_ACCOUNT_TOKEN=filler-not-a-real-token")

# 4. clickhouse (PyPI mcp-clickhouse 0.7.0), escritura desactivada, servidor inexistente.
Run-Help  -slug "clickhouse-mcp-server" -kind "uv" -helpCmd "uvx mcp-clickhouse@0.7.0 --help"
Run-Probe -slug "clickhouse-mcp-server" -pkg "mcp-clickhouse@0.7.0" -kind "uv" -cmd "uvx mcp-clickhouse@0.7.0" -envs @("CLICKHOUSE_HOST=localhost", "CLICKHOUSE_USER=default", "CLICKHOUSE_PASSWORD=filler", "CLICKHOUSE_ALLOW_WRITE_ACCESS=false")

# 5. mcp-toolbox (npm @toolbox-sdk/server 1.15.0). Solo ayuda y un arranque de prueba; hay que ver que --prebuilt admite sqlite.
Run-Help  -slug "mcp-toolbox-for-databases" -kind "node" -helpCmd "npx -y @toolbox-sdk/server@1.15.0 --help"
Run-Probe -slug "mcp-toolbox-for-databases" -pkg "@toolbox-sdk/server@1.15.0" -kind "node" -cmd "npx -y @toolbox-sdk/server@1.15.0 --prebuilt=sqlite --stdio" -envs @("SQLITE_DATABASE=/tmp/filler.db")

# 6. talk-to-figma (npm cursor-talk-to-figma-mcp 0.3.5), necesita Bun.
Run-Help  -slug "talk-to-figma-mcp" -kind "node" -helpCmd "npx -y cursor-talk-to-figma-mcp@0.3.5 --help"
Run-Probe -slug "talk-to-figma-mcp" -pkg "cursor-talk-to-figma-mcp@0.3.5" -kind "bun" -cmd "bunx cursor-talk-to-figma-mcp@0.3.5"

$todo = "$dir/TODO.txt"
"######## TIEMPOS" | Out-File $todo -Encoding ascii
Get-Content $tiempos | Add-Content $todo -Encoding ascii
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -ne "TODO.txt" } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\lote4a\TODO.txt."
