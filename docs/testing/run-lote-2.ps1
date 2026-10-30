# Lote 2: par de versiones consecutivas del mismo paquete, mismo entorno, sin credenciales, datos sintéticos.
# Par principal: @bytebase/dbhub 0.22.5 (afectada por GHSA-mwwr-p57h-56pf) contra 0.22.6 (corregida), modo --demo (SQLite en memoria con datos de ejemplo).
# Segundo par: mysql-mcp-server 0.4.1 contra 0.4.2 (PyPI). Se ejecuta por defecto; -SoloDbhub lo omite. El fallo corregido está en el transporte SSE; aquí se usa stdio.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-2.ps1 [-SoloDbhub]
# Resultado: carpeta out\lote2\ con un .txt y un .tools.json por ejecución, un DIFF-*.txt por comparación y out\lote2\TODO.txt para pegar.
param([switch]$SoloDbhub)
$ErrorActionPreference = "Continue"
$dir = "out/lote2"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$nodeImg = "node:22-slim"
$uvImg = "ghcr.io/astral-sh/uv:python3.12-bookworm-slim"
$env_txt = "Docker on Windows, no credentials, synthetic data, fixed hostname"
# Hostname fijo: una descripción puede incrustar el ID del contenedor (que es el hostname por defecto), como pasó con Desktop Commander.
$host_flag = "--hostname=probe-host"

function Safe-Name($pkg) { return ($pkg -replace '[^A-Za-z0-9._-]', '_') }

# $tag distingue la primera y la segunda ejecución de la misma versión (control de determinismo).
function Probe-Npm($slug, $pkg, $cmd, $tag) {
  Write-Host "== $slug ($pkg) run $tag"
  $f = (Safe-Name $pkg) + ".$tag"
  $args2 = $cmd -split " "
  & docker run --rm $host_flag -v "${PWD}:/work" -w /work $nodeImg node scripts/mcp-probe.mjs "--slug=$slug" "--package=$pkg" "--timeout=240" "--tools-out=$dir/$f.tools.json" "--environment=$nodeImg, $env_txt" -- @args2 2>&1 | Tee-Object -FilePath "$dir/$f.txt"
}
function Probe-Uv($slug, $pkg, $cmd, $tag, $extraEnv) {
  Write-Host "== $slug ($pkg) run $tag"
  $f = (Safe-Name $pkg) + ".$tag"
  $inner = "apt-get update -qq > /dev/null 2>&1 && apt-get install -y -qq nodejs > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=240 --tools-out=$dir/$f.tools.json '--environment=uv python3.12 image, $env_txt' $extraEnv -- $cmd"
  & docker run --rm $host_flag -v "${PWD}:/work" -w /work $uvImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$f.txt"
}
# La comparación también va dentro de Docker para no depender del Node del equipo.
function Compare-ToolsFiles($a, $b, $name, $flag) {
  $out = "$dir/DIFF-$name.txt"
  "### $a  vs  $b  $flag" | Out-File $out
  & docker run --rm -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs "$dir/$a.tools.json" "$dir/$b.tools.json" $flag 2>&1 | Tee-Object -FilePath $out -Append
}

# --- Par principal: dbhub. Orden intercalado (5, 6, 5, 6) para que cualquier deriva del entorno afecte a las dos por igual.
$p5 = "@bytebase/dbhub@0.22.5"; $p6 = "@bytebase/dbhub@0.22.6"
Probe-Npm "dbhub" $p5 "npx -y $p5 --demo" "a"
Probe-Npm "dbhub" $p6 "npx -y $p6 --demo" "a"
Probe-Npm "dbhub" $p5 "npx -y $p5 --demo" "b"
Probe-Npm "dbhub" $p6 "npx -y $p6 --demo" "b"
$f5 = Safe-Name $p5; $f6 = Safe-Name $p6
Compare-ToolsFiles "$f5.a" "$f5.b" "dbhub-control-0.22.5" ""     # misma versión dos veces: si difiere, es el entorno
Compare-ToolsFiles "$f6.a" "$f6.b" "dbhub-control-0.22.6" ""
Compare-ToolsFiles "$f5.a" "$f6.a" "dbhub-0.22.5-vs-0.22.6" ""   # la comparación del experimento
Compare-ToolsFiles "$f5.b" "$f6.b" "dbhub-0.22.5-vs-0.22.6-run-b" ""
Compare-ToolsFiles "$f5.a" "$f6.a" "dbhub-0.22.5-vs-0.22.6-normalized" "--normalize"   # solo se usa si el bruto difiere por un ID de contenedor; se declara como normalizado

# --- Segundo par: mysql-mcp-server (variables sintéticas; no existe ninguna base de datos detrás).
if (-not $SoloDbhub) {
  $m1 = "mysql-mcp-server@0.4.1"; $m2 = "mysql-mcp-server@0.4.2"
  $menv = "--env=MYSQL_HOST=127.0.0.1 --env=MYSQL_USER=probe --env=MYSQL_PASSWORD=probe --env=MYSQL_DATABASE=probe"
  Probe-Uv "mysql-mcp-server" $m1 "uvx --from mysql-mcp-server==0.4.1 mysql_mcp_server" "a" $menv
  Probe-Uv "mysql-mcp-server" $m2 "uvx --from mysql-mcp-server==0.4.2 mysql_mcp_server" "a" $menv
  Probe-Uv "mysql-mcp-server" $m1 "uvx --from mysql-mcp-server==0.4.1 mysql_mcp_server" "b" $menv
  Probe-Uv "mysql-mcp-server" $m2 "uvx --from mysql-mcp-server==0.4.2 mysql_mcp_server" "b" $menv
  $g1 = Safe-Name $m1; $g2 = Safe-Name $m2
  Compare-ToolsFiles "$g1.a" "$g1.b" "mysql-control-0.4.1" ""
  Compare-ToolsFiles "$g2.a" "$g2.b" "mysql-control-0.4.2" ""
  Compare-ToolsFiles "$g1.a" "$g2.a" "mysql-0.4.1-vs-0.4.2" ""
  Compare-ToolsFiles "$g1.a" "$g2.a" "mysql-0.4.1-vs-0.4.2-normalized" "--normalize"
}

Get-ChildItem "$dir/*.txt" -Exclude TODO.txt | Sort-Object Name | ForEach-Object { "######## $($_.Name)"; Get-Content $_ } | Set-Content "$dir/TODO.txt"
Write-Host "`nListo. Pega aquí el contenido de out\lote2\TODO.txt (o súbelo como archivo)."
