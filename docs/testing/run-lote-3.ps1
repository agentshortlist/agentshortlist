# Lote 3 (solo ASCII, a proposito): llamada inocua en 4 servidores y tools/list de 9 fichas nuevas, para dejar corriendo sin supervision.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-3.ps1 [-MaxMinutos 240]
# Reanudable: si se corta, vuelve a ejecutarlo y salta lo ya hecho (marcas .done en out\lote3). Para repetir todo, borra la carpeta out\lote3.
# Resultado: out\lote3\RESUMEN.txt, TIEMPOS.csv y TODO.txt (envia TODO.txt como archivo al terminar).
# Seguridad: sin credenciales, sin montar carpetas personales (solo C:\probe), datos sinteticos, limites de memoria, CPU y procesos por contenedor.
param([int]$MaxMinutos = 240)
$ErrorActionPreference = "Continue"
$dir = "out/lote3"
New-Item -ItemType Directory -Force -Path $dir, "calls" | Out-Null
$nodeImg = "node:22-slim"
$uvImg = "ghcr.io/astral-sh/uv:python3.12-bookworm-slim"
$env_txt = "Docker on Windows, no credentials, synthetic data, fixed hostname, resource limits"
$limits = @("--hostname=probe-host", "--memory=3g", "--cpus=2", "--pids-limit=1024", "--security-opt=no-new-privileges")
# Si Docker no esta en marcha, no se hace nada (si no, todas las pruebas fallarian y quedarian marcadas como hechas).
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker no esta en marcha. Abre Docker Desktop, espera a que arranque del todo y vuelve a ejecutar el script."
  exit 1
}
$inicio = Get-Date
$tiempos = "$dir/TIEMPOS.csv"
if (-not (Test-Path $tiempos)) { "slug,paquete,pasada,inicio,fin,segundos" | Out-File $tiempos -Encoding ascii }

# Evita que Windows se suspenda mientras corre el script (no cambia ningun ajuste: se deshace al terminar).
try {
  Add-Type -Namespace Win -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
} catch { }
try { [void][Win.Power]::SetThreadExecutionState([uint32]2147483649) } catch { Write-Host "No se pudo evitar la suspension automatica: desactivala a mano." }

function Safe-Name($pkg) { return ($pkg -replace '[^A-Za-z0-9._-]', '_') }

# Llamadas inocuas: datos sinteticos, nada fuera del contenedor salvo la lectura de example.com con fetch.
function Write-Calls($name, $json) { Set-Content -Path "calls/$name.json" -Value $json -Encoding ascii }
Write-Calls "memory" '[{"tool":"create_entities","arguments":{"entities":[{"name":"probe-entity","entityType":"test","observations":["synthetic observation"]}]}},{"tool":"read_graph","arguments":{}}]'
Write-Calls "everything" '[{"tool":"echo","arguments":{"message":"hello"}},{"tool":"get-sum","arguments":{"a":1,"b":2}}]'
Write-Calls "git" '[{"tool":"git_status","arguments":{"repo_path":"/tmp/probe-repo"}}]'
Write-Calls "fetch" '[{"tool":"fetch","arguments":{"url":"https://example.com","max_length":300}}]'

function Run-Test {
  param($slug, $pkg, $kind, $cmd, $tag, $calls = "", $envs = @(), $timeout = 240, $pre = "")
  $name = (Safe-Name $pkg) + ".$tag"
  if (Test-Path "$dir/$name.done") { Write-Host "-- ya hecho: $name"; return }
  if (((Get-Date) - $inicio).TotalMinutes -gt $MaxMinutos) {
    Write-Host "-- omitido por tiempo maximo: $name"
    "omitido por tiempo maximo" | Out-File "$dir/$name.txt" -Encoding ascii
    return
  }
  Write-Host ("== {0} ({1}) pasada {2}  [{3}]" -f $slug, $pkg, $tag, (Get-Date -Format "HH:mm:ss"))
  $t0 = Get-Date
  $envArgs = @()
  foreach ($e in $envs) { $envArgs += "--env=$e" }
  if ($kind -eq "npm") {
    $callsArg = @()
    if ($calls) { $callsArg = @("--calls=calls/$calls.json") }
    $cmdArgs = $cmd -split " "
    & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/mcp-probe.mjs "--slug=$slug" "--package=$pkg" "--timeout=$timeout" "--tools-out=$dir/$name.tools.json" "--record-out=$dir/$name.record.json" @callsArg @envArgs "--environment=$nodeImg, $env_txt" -- @cmdArgs 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } else {
    $callsStr = ""
    if ($calls) { $callsStr = "--calls=calls/$calls.json" }
    $envStr = ""
    foreach ($e in $envArgs) { $envStr += "'" + $e + "' " }
    $inner = "apt-get update -qq > /dev/null 2>&1 && apt-get install -y -qq nodejs git > /dev/null 2>&1 && $pre node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=$timeout --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json $callsStr $envStr '--environment=uv python3.12 image, $env_txt' -- $cmd"
    & docker run --rm @limits -v "${PWD}:/work" -w /work $uvImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  }
  $t1 = Get-Date
  ("{0},{1},{2},{3},{4},{5}" -f $slug, $pkg, $tag, $t0.ToString("s"), $t1.ToString("s"), [int]($t1 - $t0).TotalSeconds) | Add-Content $tiempos -Encoding ascii
  "ok" | Out-File "$dir/$name.done" -Encoding ascii
}

# ---- A. Llamada inocua (una pasada). Versiones iguales a las del lote 1 para poder comparar hashes.
Run-Test -slug "mcp-reference-servers" -pkg "@modelcontextprotocol/server-memory@2.0.0" -kind "npm" -cmd "npx -y @modelcontextprotocol/server-memory@2.0.0" -tag "call" -calls "memory"
Run-Test -slug "mcp-reference-servers" -pkg "@modelcontextprotocol/server-everything@2.0.0" -kind "npm" -cmd "npx -y @modelcontextprotocol/server-everything@2.0.0" -tag "call" -calls "everything"
Run-Test -slug "mcp-reference-servers" -pkg "mcp-server-git@2026.10.19" -kind "uv" -cmd "uvx mcp-server-git@2026.10.19" -tag "call" -calls "git" -pre "git init -q /tmp/probe-repo &&"
Run-Test -slug "mcp-reference-servers" -pkg "mcp-server-fetch@2026.10.19" -kind "uv" -cmd "uvx mcp-server-fetch@2026.10.19" -tag "call" -calls "fetch"

# ---- B. Fichas nuevas: tools/list, dos pasadas (la segunda solo si la primera hizo handshake). Versiones consultadas en npm y PyPI el 25 oct 2026.
$lote3 = @(
  @{ slug = "kubernetes-mcp-server"; pkg = "kubernetes-mcp-server@0.0.69"; kind = "npm"; cmd = "npx -y kubernetes-mcp-server@0.0.69" },
  @{ slug = "mcp-server-kubernetes"; pkg = "mcp-server-kubernetes@4.1.9"; kind = "npm"; cmd = "npx -y mcp-server-kubernetes@4.1.9" },
  @{ slug = "browser-tools-mcp"; pkg = "@agentdeskai/browser-tools-mcp@2.0.2"; kind = "npm"; cmd = "npx -y @agentdeskai/browser-tools-mcp@2.0.2" },
  @{ slug = "context-mode"; pkg = "context-mode@1.0.169"; kind = "npm"; cmd = "npx -y context-mode@1.0.169" },
  @{ slug = "n8n-mcp"; pkg = "n8n-mcp@2.99.1"; kind = "npm"; cmd = "npx -y n8n-mcp@2.99.1"; envs = @("MCP_MODE=stdio", "LOG_LEVEL=error"); timeout = 300 },
  @{ slug = "mongodb-mcp-server"; pkg = "mongodb-mcp-server@3.1.0"; kind = "npm"; cmd = "npx -y mongodb-mcp-server@3.1.0" },
  @{ slug = "motherduck-mcp-server"; pkg = "mcp-server-motherduck@1.1.0"; kind = "uv"; cmd = "uvx mcp-server-motherduck@1.1.0 --db-path :memory:" },
  @{ slug = "redis-mcp-server"; pkg = "redis-mcp-server@0.5.1"; kind = "uv"; cmd = "uvx redis-mcp-server@0.5.1 --url redis://127.0.0.1:6379/0" },
  @{ slug = "qdrant-mcp-server"; pkg = "mcp-server-qdrant@0.8.1"; kind = "uv"; cmd = "uvx mcp-server-qdrant@0.8.1"; envs = @("QDRANT_LOCAL_PATH=/tmp/qdrant-probe", "COLLECTION_NAME=probe"); timeout = 420 }
)
foreach ($pasada in @("a", "b")) {
  foreach ($t in $lote3) {
    if ($pasada -eq "b") {
      $recA = "$dir/" + (Safe-Name $t.pkg) + ".a.record.json"
      $ok = $false
      if (Test-Path $recA) { try { $ok = ((Get-Content $recA -Raw | ConvertFrom-Json).record.handshake -eq "pass") } catch { } }
      if (-not $ok) { Write-Host ("-- sin segunda pasada (la primera no hizo handshake): " + $t.pkg); continue }
    }
    $e = @(); if ($t.envs) { $e = $t.envs }
    $to = 240; if ($t.timeout) { $to = $t.timeout }
    Run-Test -slug $t.slug -pkg $t.pkg -kind $t.kind -cmd $t.cmd -tag $pasada -envs $e -timeout $to
  }
}

# ---- C. Comparar pasada a con pasada b (si las dos listaron herramientas).
function Compare-ToolsFiles($a, $b, $name) {
  $out = "$dir/DIFF-$name.txt"
  "### $a  vs  $b" | Out-File $out -Encoding ascii
  & docker run --rm -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs "$dir/$a.tools.json" "$dir/$b.tools.json" 2>&1 | Tee-Object -FilePath $out -Append
}
foreach ($t in $lote3) {
  $n = Safe-Name $t.pkg
  if ((Test-Path "$dir/$n.a.tools.json") -and (Test-Path "$dir/$n.b.tools.json")) { Compare-ToolsFiles "$n.a" "$n.b" ("control-" + $n) }
}

# ---- D. Resumen y archivo para enviar.
$filas = foreach ($f in (Get-ChildItem "$dir/*.record.json" | Sort-Object Name)) {
  try {
    $d = Get-Content $f.FullName -Raw | ConvertFrom-Json
    $r = $d.record
    $llamada = "-"; if ($r.call) { $llamada = $r.call.status }
    [pscustomobject]@{ Paquete = $r.package; Pasada = ($f.BaseName -replace '.*\.(a|b|call)\.record$', '$1'); Instalacion = $r.install; Handshake = $r.handshake; Lista = $r.toolsList.status; Herramientas = $r.toolsList.count; Llamada = $llamada }
  } catch { }
}
$filas | Format-Table -AutoSize | Out-String -Width 220 | Out-File "$dir/RESUMEN.txt" -Encoding ascii
$todo = "$dir/TODO.txt"
"######## RESUMEN" | Out-File $todo -Encoding ascii
Get-Content "$dir/RESUMEN.txt" | Add-Content $todo -Encoding ascii
"######## TIEMPOS" | Add-Content $todo -Encoding ascii
Get-Content $tiempos | Add-Content $todo -Encoding ascii
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -notin @("TODO.txt", "RESUMEN.txt") } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
try { [void][Win.Power]::SetThreadExecutionState([uint32]2147483648) } catch { }
Write-Host ""
Write-Host "Listo. Sube el archivo out\lote3\TODO.txt (o pega RESUMEN.txt y TIEMPOS.csv)."
