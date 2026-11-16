# Prueba de llamadas (solo ASCII): que pasa de verdad cuando se llama a herramientas con el ajuste de solo lectura puesto y sin el.
# Todo en contenedores desechables, datos sinteticos, sin credenciales reales, sin montar carpetas personales (solo C:\probe), con limites.
# Uso (PowerShell, desde C:\probe):
#   powershell -ExecutionPolicy Bypass -File .\run-write-probe.ps1            (todo: Blender, ClickHouse, Grafana, anotaciones)
#   powershell -ExecutionPolicy Bypass -File .\run-write-probe.ps1 -Only blender
#   ... -Only clickhouse | -Only annotations | -Only grafana
# Resultado: out\write-probe\TODO.txt (envialo como archivo). Tarda 15-25 minutos la primera vez (descargas).
param([string]$Only = "all")
$ErrorActionPreference = "Continue"
$out = "out/write-probe"
New-Item -ItemType Directory -Force -Path $out | Out-Null
docker info *> $null
if ($LASTEXITCODE -ne 0) { Write-Host "Docker no esta en marcha. Abre Docker Desktop, espera a que arranque del todo y vuelve a ejecutar el script."; exit 1 }
$uv = "ghcr.io/astral-sh/uv:python3.12-bookworm-slim"
$node = "node:22-slim"
$limits = @("--hostname=probe-host", "--memory=3g", "--cpus=2", "--pids-limit=1024", "--security-opt=no-new-privileges")
$sw = "docs/testing/write-probe"
function Want($n) { return ($Only -eq "all" -or $Only -eq $n) }

# ---------- 1. Blender: el servidor MCP real, con un falso socket de Blender que solo anota lo que le llega (no ejecuta nada) ----------
if (Want "blender") {
  foreach ($p in @(@("safe-off", "0"), @("safe-on", "1"))) {
    Write-Host ("== Blender {0}  [{1}]" -f $p[0], (Get-Date -Format "HH:mm:ss"))
    & docker run --rm @limits -v "${PWD}:/work" -w /work $uv sh "$sw/blender-run.sh" $p[0] $p[1] 2>&1 | Tee-Object -FilePath "$out/blender.$($p[0]).txt"
  }
}

# ---------- 2. ClickHouse: servidor desechable en una red aislada, sin puertos publicados ----------
if (Want "clickhouse") {
  $netName = "probe-net"; $ch = "probe-ch"
  & docker network create $netName *> $null
  & docker rm -f $ch *> $null
  & docker run -d --name $ch --network $netName --memory=2g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges `
    -e CLICKHOUSE_USER=probe -e CLICKHOUSE_PASSWORD=probe-pass -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 clickhouse/clickhouse-server:24.8 | Out-Null
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) {
    & docker exec $ch clickhouse-client --user probe --password probe-pass -q "SELECT 1" *> $null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 2
  }
  if (-not $ready) { Write-Host "ClickHouse no arranco."; }
  else {
    function CH($sql) { & docker exec $ch clickhouse-client --user probe --password probe-pass --multiquery -q $sql 2>&1 }
    function Reset-Fixture {
      CH "DROP DATABASE IF EXISTS probe_test SYNC; CREATE DATABASE probe_test; CREATE TABLE probe_test.t (id UInt32, ts DateTime) ENGINE = MergeTree ORDER BY id; INSERT INTO probe_test.t VALUES (1, now()), (2, now()), (3, now()); CREATE TABLE probe_test.t_victim (id UInt32) ENGINE = MergeTree ORDER BY id; INSERT INTO probe_test.t_victim VALUES (10), (11);" | Out-Null
    }
    function Dump-State($label) {
      Start-Sleep -Seconds 6   # las mutaciones y el TTL son asincronos
      "-- estado $label (tablas de probe_test) --"
      CH "SELECT name, total_rows FROM system.tables WHERE database = 'probe_test' ORDER BY name"
      "-- mutaciones --"
      CH "SELECT command, is_done FROM system.mutations WHERE database = 'probe_test'"
    }
    $runs = @(
      @{ tag = "read-default";  calls = "$sw/clickhouse-read-calls.json";  write = "false"; drop = "false" },
      @{ tag = "write-nodrop";  calls = "$sw/clickhouse-write-calls.json"; write = "true";  drop = "false" },
      @{ tag = "write-drop";    calls = "$sw/clickhouse-drop-calls.json";  write = "true";  drop = "true" }
    )
    foreach ($r in $runs) {
      Write-Host ("== ClickHouse {0}  [{1}]" -f $r.tag, (Get-Date -Format "HH:mm:ss"))
      Reset-Fixture
      $log = "$out/clickhouse.$($r.tag).txt"
      "######## ClickHouse $($r.tag): ALLOW_WRITE_ACCESS=$($r.write) ALLOW_DROP=$($r.drop)" | Out-File $log -Encoding ascii
      Dump-State "ANTES" | Add-Content $log -Encoding ascii
      & docker run --rm @limits --network $netName -v "${PWD}:/work" -w /work $uv sh "$sw/clickhouse-run.sh" $r.tag $r.calls $r.write $r.drop 2>&1 | Tee-Object -FilePath $log -Append
      Dump-State "DESPUES" | Add-Content $log -Encoding ascii
    }
    & docker rm -f $ch *> $null
    & docker network rm $netName *> $null
  }
}

# ---------- 4. Grafana: servidor desechable (cuenta de servicio de prueba), con y sin --disable-write ----------
if (Want "grafana") {
  $netName = "probe-net"; $gf = "probe-gf"; $gfPass = "probe-pass"
  & docker network create $netName *> $null
  & docker rm -f $gf *> $null
  & docker run -d --name $gf --network $netName --memory=2g --cpus=2 --pids-limit=1024 --security-opt=no-new-privileges `
    -e GF_SECURITY_ADMIN_PASSWORD=$gfPass -e GF_ANALYTICS_REPORTING_ENABLED=false -e GF_ANALYTICS_CHECK_FOR_UPDATES=false -e GF_ANALYTICS_CHECK_FOR_PLUGIN_UPDATES=false `
    grafana/grafana-oss:11.6.0 | Out-Null
  function GFX($mode) { & docker run --rm --network $netName -v "${PWD}:/work" -w /work $node node scripts/grafana-fixture.mjs $mode "http://$($gf):3000" $gfPass 2>&1 }
  $w = GFX "wait"
  Write-Host ($w -join " ")
  $setup = GFX "setup"
  $token = (($setup | Where-Object { $_ -like "TOKEN=*" } | Select-Object -First 1) -replace "^TOKEN=", "")
  if (-not $token) { Write-Host "No se pudo crear el token de Grafana:"; Write-Host ($setup -join " ") }
  else {
    $runs = @(
      @{ tag = "default";  calls = "$sw/grafana-default-calls.json";  extra = "none" },
      @{ tag = "readonly"; calls = "$sw/grafana-readonly-calls.json"; extra = "--disable-write" }
    )
    foreach ($r in $runs) {
      Write-Host ("== Grafana {0}  [{1}]" -f $r.tag, (Get-Date -Format "HH:mm:ss"))
      GFX "reset" | Out-Null
      $log = "$out/grafana.$($r.tag).txt"
      "######## Grafana $($r.tag): extra args = $($r.extra)" | Out-File $log -Encoding ascii
      "-- estado ANTES --" | Add-Content $log -Encoding ascii
      GFX "state" | Add-Content $log -Encoding ascii
      & docker run --rm @limits --network $netName -v "${PWD}:/work" -w /work $uv sh "$sw/grafana-run.sh" $r.tag $r.calls $r.extra $token 2>&1 | Tee-Object -FilePath $log -Append
      "-- estado DESPUES --" | Add-Content $log -Encoding ascii
      GFX "state" | Add-Content $log -Encoding ascii
    }
  }
  & docker rm -f $gf *> $null
  & docker network rm $netName *> $null
}

# ---------- 5. Anotaciones (al final, para incluir tambien las listas nuevas de Grafana) (readOnlyHint y demas) de todas las listas guardadas, las nuevas y las de pruebas anteriores ----------
if (Want "annotations") {
  Write-Host "== Anotaciones de todos los *.tools.json de out\"
  & docker run --rm @limits -v "${PWD}:/work" -w /work $node sh -c 'node scripts/annotations-summary.mjs $(find out -name "*.tools.json" | sort)' 2>&1 | Tee-Object -FilePath "$out/annotations.txt"
}

$todo = "$out/TODO-$Only.txt"
$since = (Get-Date).AddHours(-3)
"######## RESULTADO prueba de llamadas" | Out-File $todo -Encoding ascii
foreach ($f in (Get-ChildItem "$out/*.txt" | Where-Object { $_.Name -notlike "TODO*" -and $_.Name -notlike "*.probe.txt" -and $_.LastWriteTime -gt $since } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
foreach ($f in (Get-ChildItem "$out/blender.*.socket.log" -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $since } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\write-probe\TODO-$Only.txt."
