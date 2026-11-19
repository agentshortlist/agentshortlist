# Prueba de telemetria (solo ASCII). Para cada servidor MCP: que nombres de internet intenta contactar al arrancar y en los 40 s siguientes,
# SIN llamar a ninguna herramienta y SIN dejarle salir a internet. Todo nombre que pida se resuelve a un sumidero local que lo anota.
# Fase 1 (con internet): instala cada paquete en una cache, sin ejecutarlo. Fase 2 (sin internet): lo arranca en una red cerrada, en el mismo contenedor que el sumidero.
# Uso (PowerShell, desde C:\probe):
#   powershell -ExecutionPolicy Bypass -File .\run-telemetry-probe.ps1                      (todos, unos 90 minutos; reanudable)
#   powershell -ExecutionPolicy Bypass -File .\run-telemetry-probe.ps1 -Only chrome-devtools,apify,blender,azure   (los cuatro con telemetria documentada, ~15 min)
# Resultado: out\telemetry\TODO.txt   (si lo paras a medias, vuelve a ejecutarlo: salta lo ya hecho).
param([string]$Only = "all", [int]$Window = 40, [switch]$Redo)
$ErrorActionPreference = "Continue"
$img = "asl-telemetry-probe"
$net = "tel-net"
$out = "out/telemetry"
New-Item -ItemType Directory -Force -Path $out | Out-Null
docker info *> $null
if ($LASTEXITCODE -ne 0) { Write-Host "Docker no esta en marcha. Abre Docker Desktop, espera a que arranque del todo y vuelve a ejecutar el script."; exit 1 }
if (-not (Test-Path "scripts/telemetry-sink.mjs") -or -not (Test-Path "docs/testing/telemetry/servers.json")) { Write-Host "Faltan archivos. Ejecuta el script desde C:\probe, con el paquete descomprimido ahi."; exit 1 }

Write-Host "== Preparando imagen y red [$(Get-Date -Format 'HH:mm:ss')]"
docker build -q -t $img docs/testing/telemetry 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "No se pudo construir la imagen $img. Revisa la conexion a internet y vuelve a intentarlo."; exit 1 }
docker network create --internal $net *> $null   # sin salida a internet; si ya existe, no pasa nada
docker rm -f tel-sink *> $null

$servers = Get-Content "docs/testing/telemetry/servers.json" -Raw | ConvertFrom-Json
if ($Only -ne "all") { $want = $Only.Split(",") | ForEach-Object { $_.Trim() }; $servers = $servers | Where-Object { $want -contains $_.id } }
Write-Host ("Servidores: {0}" -f $servers.Count)
if ($Redo) { foreach ($s in $servers) { Remove-Item "$out/$($s.id).*.done" -ErrorAction SilentlyContinue } }   # -Redo: repetir aunque ya estuviera hecho

# ---- Fase 1: instalar sin ejecutar (con internet) ----
foreach ($s in $servers) {
  Write-Host ("== Instalando {0} [{1}]" -f $s.id, (Get-Date -Format "HH:mm:ss"))
  docker run --rm -v "${PWD}:/work" -v asl-tel-cache:/cache -w /work $img node scripts/telemetry-warm.mjs $s.id 2>&1 | Tee-Object -FilePath "$out/warm.log" -Append
}

# ---- Fase 2: ejecutar sin internet, con el sumidero ----
function Run-Capture {
  param($id, $variant)
  $name = "$id.$variant"
  if (Test-Path "$out/$name.done") { Write-Host "(ya hecho) $name"; return }
  Write-Host ("== Ejecutando {0} [{1}]" -f $name, (Get-Date -Format "HH:mm:ss"))
  docker rm -f tel-sink *> $null
  # Un solo contenedor, sin salida a internet: el sumidero es el proceso principal y el servidor se ejecuta dentro con "docker exec".
  docker run -d --name tel-sink --network $net --hostname probe-host -v "${PWD}:/work" -v asl-tel-cache:/cache -w /work --memory=3g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges $img node scripts/telemetry-sink.mjs "out/telemetry/$name.sink.log" *> $null
  Start-Sleep -Seconds 3
  docker exec -w /work tel-sink node scripts/telemetry-run-one.mjs $id $variant $Window 2>&1 | Tee-Object -FilePath "$out/$name.run.txt"
  Start-Sleep -Seconds 2
  docker rm -f tel-sink *> $null
  "ok" | Out-File "$out/$name.done" -Encoding ascii
}

# Control del montaje: un "servidor" que contacta un nombre por TLS y otro por HTTP. Si no salen, lo demas no vale.
Remove-Item "$out/control.default.done" -ErrorAction SilentlyContinue
Run-Capture "control" "default"
$ctl = Get-Content "$out/control.default.sink.log" -Raw -ErrorAction SilentlyContinue
if (($ctl -notmatch "telemetry.control.test") -or ($ctl -notmatch "plain.control.test") -or ($ctl -notmatch '"kind":"tls"') -or ($ctl -notmatch '"kind":"http"')) {
  Write-Host "EL CONTROL HA FALLADO: el sumidero no vio las conexiones de prueba. No sigo. Envia out\telemetry\control.default.sink.log y out\telemetry\control.default.run.txt."
  exit 1
}
Write-Host "Control correcto: el sumidero ve DNS, TLS y HTTP."

foreach ($s in $servers) {
  Run-Capture $s.id "default"
  if ($s.PSObject.Properties.Name -contains "optout") { Run-Capture $s.id "optout" }
  if ($s.PSObject.Properties.Name -contains "variants") { foreach ($vn in $s.variants.PSObject.Properties.Name) { Run-Capture $s.id $vn } }
}

# ---- Resumen ----
$ver = (docker run --rm $img sh -c "node --version; uv --version" 2>&1) -join " | "
"######## RESULTADO prueba de telemetria" | Out-File "$out/TODO.txt" -Encoding utf8
"######## $(Get-Date -Format 's')  ventana tras tools/list: $Window s  imagen: $ver" | Out-File "$out/TODO.txt" -Append -Encoding utf8
docker run --rm -v "${PWD}:/work" -w /work $img node scripts/telemetry-summary.mjs out/telemetry $Window 2>&1 | Out-File "$out/TODO.txt" -Append -Encoding utf8
"######## warm.log" | Out-File "$out/TODO.txt" -Append -Encoding utf8
Get-Content "$out/warm.log" -ErrorAction SilentlyContinue | Out-File "$out/TODO.txt" -Append -Encoding utf8
Write-Host ""
Write-Host "LISTO. Sube el archivo out\telemetry\TODO.txt."
