# Lote 4 (solo ASCII): 6 servidores sin credenciales reales, dos pasadas cada uno, con y sin el flag o variable que cambia su lista,
# mas la prueba pareada con un servidor sintetico propio (scripts/fake-mcp-server.mjs).
# Los 6 comandos ya se validaron el 28 oct (lote 4a): todos arrancaron y listaron herramientas.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-4.ps1
# Reanudable: si se corta, vuelve a ejecutarlo y salta lo hecho (marcas .done en out\lote4). Para repetir todo, borra out\lote4.
# Resultado: out\lote4\TODO.txt (envialo como archivo). Deberia tardar unos 10 a 15 minutos.
# Seguridad: sin credenciales reales (valores "filler"), sin montar carpetas personales (solo C:\probe), limites de memoria, CPU y procesos, hostname fijo.
$ErrorActionPreference = "Continue"
$dir = "out/lote4"
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
if (-not (Test-Path $tiempos)) { "slug,variante,pasada,inicio,fin,segundos" | Out-File $tiempos -Encoding ascii }
function Safe-Name($s) { return ($s -replace '[^A-Za-z0-9._-]', '_') }

function Run-Probe {
  param($slug, $pkg, $variant, $kind, $cmd, $tag, $envs = @())
  $name = (Safe-Name $slug) + "." + (Safe-Name $variant) + "." + $tag
  if (Test-Path "$dir/$name.done") { Write-Host "(ya hecho) $name"; return }
  Write-Host ("== {0} [{1}] pasada {2}  [{3}]" -f $slug, $variant, $tag, (Get-Date -Format "HH:mm:ss"))
  $t0 = Get-Date
  $envArgs = @()
  foreach ($e in $envs) { $envArgs += "--env=$e" }
  if ($kind -eq "node") {
    $cmdArgs = $cmd -split " "
    & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/mcp-probe.mjs "--slug=$slug" "--package=$pkg" "--timeout=90" "--tools-out=$dir/$name.tools.json" "--record-out=$dir/$name.record.json" @envArgs "--environment=$nodeImg, $env_txt, variant: $variant" -- @cmdArgs 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } elseif ($kind -eq "bun") {
    $inner = "npm i -g bun > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=90 --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json '--environment=$nodeImg + bun, $env_txt, variant: $variant' -- $cmd"
    & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } else {
    $envStr = ""
    foreach ($e in $envArgs) { $envStr += "'" + $e + "' " }
    $inner = "apt-get update -qq > /dev/null 2>&1 && apt-get install -y -qq nodejs git > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=90 --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json $envStr '--environment=uv python3.12 image, $env_txt, variant: $variant' -- $cmd"
    & docker run --rm @limits -v "${PWD}:/work" -w /work $uvImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  }
  $t1 = Get-Date
  ("{0},{1},{2},{3},{4},{5}" -f $slug, $variant, $tag, $t0.ToString("s"), $t1.ToString("s"), [int]($t1 - $t0).TotalSeconds) | Add-Content $tiempos -Encoding ascii
  "ok" | Out-File "$dir/$name.done" -Encoding ascii
}

foreach ($p in @("1", "2")) {
  # serena (por defecto)
  Run-Probe -slug "serena" -pkg "serena-agent@2.1.0" -variant "default" -kind "uv" -cmd "uvx --from serena-agent==2.1.0 serena start-mcp-server" -tag $p

  # blender-mcp: con y sin modo seguro
  Run-Probe -slug "blender-mcp" -pkg "mcp-for-blender@2.2.4" -variant "safe-mode" -kind "uv" -cmd "uvx mcp-for-blender@2.2.4" -tag $p -envs @("BLENDER_MCP_SAFE_MODE=1", "DISABLE_TELEMETRY=true")
  Run-Probe -slug "blender-mcp" -pkg "mcp-for-blender@2.2.4" -variant "no-safe-mode" -kind "uv" -cmd "uvx mcp-for-blender@2.2.4" -tag $p -envs @("DISABLE_TELEMETRY=true")

  # grafana: con y sin --disable-write (token de relleno)
  Run-Probe -slug "grafana-mcp-server" -pkg "mcp-grafana@2.1.1" -variant "disable-write" -kind "uv" -cmd "uvx mcp-grafana@2.1.1 --disable-write" -tag $p -envs @("GRAFANA_URL=http://localhost:3000", "GRAFANA_SERVICE_ACCOUNT_TOKEN=filler-not-a-real-token")
  Run-Probe -slug "grafana-mcp-server" -pkg "mcp-grafana@2.1.1" -variant "default" -kind "uv" -cmd "uvx mcp-grafana@2.1.1" -tag $p -envs @("GRAFANA_URL=http://localhost:3000", "GRAFANA_SERVICE_ACCOUNT_TOKEN=filler-not-a-real-token")

  # clickhouse: escritura desactivada y activada (servidor inexistente)
  Run-Probe -slug "clickhouse-mcp-server" -pkg "mcp-clickhouse@0.7.0" -variant "write-false" -kind "uv" -cmd "uvx mcp-clickhouse@0.7.0" -tag $p -envs @("CLICKHOUSE_HOST=localhost", "CLICKHOUSE_USER=default", "CLICKHOUSE_PASSWORD=filler", "CLICKHOUSE_ALLOW_WRITE_ACCESS=false")
  Run-Probe -slug "clickhouse-mcp-server" -pkg "mcp-clickhouse@0.7.0" -variant "write-true" -kind "uv" -cmd "uvx mcp-clickhouse@0.7.0" -tag $p -envs @("CLICKHOUSE_HOST=localhost", "CLICKHOUSE_USER=default", "CLICKHOUSE_PASSWORD=filler", "CLICKHOUSE_ALLOW_WRITE_ACCESS=true")

  # mcp-toolbox con la configuracion preconstruida de sqlite
  Run-Probe -slug "mcp-toolbox-for-databases" -pkg "@toolbox-sdk/server@1.15.0" -variant "prebuilt-sqlite" -kind "node" -cmd "npx -y @toolbox-sdk/server@1.15.0 --prebuilt=sqlite --stdio" -tag $p -envs @("SQLITE_DATABASE=/tmp/filler.db")

  # talk-to-figma (necesita Bun; reintenta conectar a un websocket que no existe y aun asi lista herramientas)
  Run-Probe -slug "talk-to-figma-mcp" -pkg "cursor-talk-to-figma-mcp@0.3.5" -variant "default" -kind "bun" -cmd "bunx cursor-talk-to-figma-mcp@0.3.5" -tag $p
}

# Prueba pareada con el servidor sintetico: A (base), B (solo cambia el ID), C (solo cambia el destino permitido). A se repite.
Run-Probe -slug "fake-mcp-server" -pkg "fake-mcp-server@0.0.1" -variant "A-base" -kind "node" -cmd "node scripts/fake-mcp-server.mjs" -tag "1" -envs @("FAKE_ID=aaaaaaaaaaaa", "FAKE_TARGET=https://example.invalid/a")
Run-Probe -slug "fake-mcp-server" -pkg "fake-mcp-server@0.0.1" -variant "A-base" -kind "node" -cmd "node scripts/fake-mcp-server.mjs" -tag "2" -envs @("FAKE_ID=aaaaaaaaaaaa", "FAKE_TARGET=https://example.invalid/a")
Run-Probe -slug "fake-mcp-server" -pkg "fake-mcp-server@0.0.1" -variant "B-solo-id" -kind "node" -cmd "node scripts/fake-mcp-server.mjs" -tag "1" -envs @("FAKE_ID=bbbbbbbbbbbb", "FAKE_TARGET=https://example.invalid/a")
Run-Probe -slug "fake-mcp-server" -pkg "fake-mcp-server@0.0.1" -variant "C-solo-destino" -kind "node" -cmd "node scripts/fake-mcp-server.mjs" -tag "1" -envs @("FAKE_ID=aaaaaaaaaaaa", "FAKE_TARGET=https://example.invalid/b")

# Comparaciones de la prueba pareada (en bruto y normalizado) y de las variantes con y sin flag.
function Compare-Pair($a, $b, $label) {
  "######## $label" | Add-Content "$dir/COMPARACIONES.txt" -Encoding ascii
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs "$dir/$a" "$dir/$b" 2>&1 | Add-Content "$dir/COMPARACIONES.txt" -Encoding ascii
  "-- normalizado (solo cadenas hexadecimales de 12 caracteres):" | Add-Content "$dir/COMPARACIONES.txt" -Encoding ascii
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs "$dir/$a" "$dir/$b" --normalize 2>&1 | Add-Content "$dir/COMPARACIONES.txt" -Encoding ascii
}
Remove-Item "$dir/COMPARACIONES.txt" -ErrorAction SilentlyContinue
Compare-Pair "fake-mcp-server.A-base.1.tools.json" "fake-mcp-server.A-base.2.tools.json" "PAREADA 0: A frente a A (control de determinismo)"
Compare-Pair "fake-mcp-server.A-base.1.tools.json" "fake-mcp-server.B-solo-id.1.tools.json" "PAREADA 1: A frente a B (solo cambia el ID de la descripcion)"
Compare-Pair "fake-mcp-server.A-base.1.tools.json" "fake-mcp-server.C-solo-destino.1.tools.json" "PAREADA 2: A frente a C (solo cambia el destino permitido)"
Compare-Pair "blender-mcp.safe-mode.1.tools.json" "blender-mcp.no-safe-mode.1.tools.json" "BLENDER: modo seguro frente a sin modo seguro"
Compare-Pair "grafana-mcp-server.disable-write.1.tools.json" "grafana-mcp-server.default.1.tools.json" "GRAFANA: --disable-write frente a por defecto"
Compare-Pair "clickhouse-mcp-server.write-false.1.tools.json" "clickhouse-mcp-server.write-true.1.tools.json" "CLICKHOUSE: escritura false frente a true"

$todo = "$dir/TODO.txt"
"######## TIEMPOS" | Out-File $todo -Encoding ascii
Get-Content $tiempos | Add-Content $todo -Encoding ascii
if (Test-Path "$dir/COMPARACIONES.txt") { Get-Content "$dir/COMPARACIONES.txt" | Add-Content $todo -Encoding ascii }
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -notin @("TODO.txt", "COMPARACIONES.txt") } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\lote4\TODO.txt."
