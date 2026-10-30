# Repeticion 2 (solo ASCII): vuelve a lanzar solo los 4 registros que fallaron en la repeticion (clickhouse x2, motherduck, serena) con la sonda corregida
# (espera de 20 s a server/discover y respaldo con initialize en un proceso nuevo), y una segunda pasada de Desktop Commander para compararla con la de la repeticion.
# Sirve para dos cosas: 1) comprobar si algun hash cambia con los dias sin que cambie la version (por ejemplo una fecha dentro de una descripcion);
# 2) registrar con que era del protocolo responde cada servidor: la sonda nueva prueba primero server/discover (revision 2026-07-28) y si no, initialize.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-repeat.ps1
# Reanudable: si se corta, vuelve a ejecutarlo y salta lo hecho (marcas .done en out\repeat2). Para repetir todo, borra out\repeat2.
# Resultado: out\repeat2\TODO.txt (envialo como archivo). Calcula unos 30 a 40 minutos.
# Necesita en C:\probe\scripts el mcp-probe.mjs NUEVO y el fake-mcp-server.mjs. Seguridad: sin credenciales reales, solo C:\probe montado, limites de recursos, hostname fijo.
$ErrorActionPreference = "Continue"
$dir = "out/repeat2"
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
  param($slug, $pkg, $first, $kind, $cmd, $envs = @(), $suffix = "")
  $name = (Safe-Name $slug) + "." + (Safe-Name $pkg) + $suffix
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

Run-Probe -slug "desktop-commander-mcp" -pkg "@wonderwhy-er/desktop-commander@0.3.1" -first "2026-10-25" -kind "node" -cmd "npx -y @wonderwhy-er/desktop-commander@0.3.1" -envs @() -suffix "-b"
Run-Probe -slug "motherduck-mcp-server" -pkg "mcp-server-motherduck@1.1.0" -first "2026-10-25" -kind "uv" -cmd "uvx mcp-server-motherduck@1.1.0 --db-path :memory: --read-write" -envs @()
Run-Probe -slug "serena" -pkg "serena-agent@2.1.0" -first "2026-10-28" -kind "uv" -cmd "uvx --from serena-agent==2.1.0 serena start-mcp-server" -envs @()
Run-Probe -slug "clickhouse-mcp-server" -pkg "mcp-clickhouse@0.7.0 (CLICKHOUSE_ALLOW_WRITE_ACCESS=false)" -first "2026-10-28" -kind "uv" -cmd "uvx mcp-clickhouse@0.7.0" -envs @("CLICKHOUSE_HOST=localhost", "CLICKHOUSE_USER=default", "CLICKHOUSE_PASSWORD=filler", "CLICKHOUSE_ALLOW_WRITE_ACCESS=false")
Run-Probe -slug "clickhouse-mcp-server" -pkg "mcp-clickhouse@0.7.0 (CLICKHOUSE_ALLOW_WRITE_ACCESS=true)" -first "2026-10-28" -kind "uv" -cmd "uvx mcp-clickhouse@0.7.0" -envs @("CLICKHOUSE_HOST=localhost", "CLICKHOUSE_USER=default", "CLICKHOUSE_PASSWORD=filler", "CLICKHOUSE_ALLOW_WRITE_ACCESS=true")

# Desktop Commander: segunda pasada frente a la de la repeticion (mismo hostname fijo): si el hash vuelve a ser identico, la diferencia anterior dependia del hostname.
$a = "out/repeat/desktop-commander-mcp._wonderwhy-er_desktop-commander_0.3.1.tools.json"
$b = "$dir/desktop-commander-mcp._wonderwhy-er_desktop-commander_0.3.1-b.tools.json"
if ((Test-Path $a) -and (Test-Path $b)) {
  "######## DESKTOP COMMANDER: repeticion frente a segunda pasada (hostname fijo)" | Out-File "$dir/COMPARACION.txt" -Encoding ascii
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs $a $b 2>&1 | Add-Content "$dir/COMPARACION.txt" -Encoding ascii
}

# Desktop Commander: tambien frente a las pruebas antiguas (lote 1 y lote 3), en bruto y normalizado (solo cadenas hexadecimales de 12 caracteres).
$root = (Get-Location).Path
$olds = Get-ChildItem "out" -Recurse -Filter "*desktop*commander*tools.json" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "repeat" }
foreach ($o in $olds) {
  $rel = ($o.FullName.Substring($root.Length + 1)) -replace '\\', '/'
  "######## ANTIGUO $rel frente a la repeticion (bruto)" | Add-Content "$dir/COMPARACION.txt" -Encoding ascii
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs $rel $a 2>&1 | Add-Content "$dir/COMPARACION.txt" -Encoding ascii
  "######## ANTIGUO $rel frente a la repeticion (normalizado)" | Add-Content "$dir/COMPARACION.txt" -Encoding ascii
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs $rel $a --normalize 2>&1 | Add-Content "$dir/COMPARACION.txt" -Encoding ascii
}

$todo = "$dir/TODO.txt"
"######## TIEMPOS" | Out-File $todo -Encoding ascii
Get-Content $tiempos | Add-Content $todo -Encoding ascii
if (Test-Path "$dir/COMPARACION.txt") { Get-Content "$dir/COMPARACION.txt" | Add-Content $todo -Encoding ascii }
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -notin @("TODO.txt", "COMPARACION.txt") } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\repeat2\TODO.txt."
