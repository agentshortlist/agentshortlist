# Lote 2b (ASCII): repite lo que fallo del lote 2.
# 1) Compara con tools-diff los tools/list de dbhub que ya estan guardados en out\lote2 (el lote 2 no pudo compararlos: la funcion Diff chocaba con el alias diff de PowerShell).
# 2) mysql-mcp-server 0.4.1 y 0.4.2 no arrancan con uvx en un entorno limpio: falta la dependencia python-dotenv en sus metadatos. Se repite anadiendola con --with para poder comparar sus tools/list, y se prueba la 0.4.4 (que si la declara) sin anadir nada.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-2b.ps1
# Resultado: out\lote2b\TODO.txt para pegar.
$ErrorActionPreference = "Continue"
$dir = "out/lote2b"
$src = "out/lote2"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$nodeImg = "node:22-slim"
$uvImg = "ghcr.io/astral-sh/uv:python3.12-bookworm-slim"
$env_txt = "Docker on Windows, no credentials, synthetic data, fixed hostname"
$host_flag = "--hostname=probe-host"
function Safe-Name($pkg) { return ($pkg -replace '[^A-Za-z0-9._-]', '_') }
function Probe-Uv($slug, $pkg, $cmd, $tag, $extraEnv) {
  Write-Host "== $slug ($pkg) run $tag"
  $f = (Safe-Name $pkg) + ".$tag"
  $inner = "apt-get update -qq > /dev/null 2>&1 && apt-get install -y -qq nodejs > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=90 --tools-out=$dir/$f.tools.json '--environment=uv python3.12 image, $env_txt' $extraEnv -- $cmd"
  & docker run --rm $host_flag -v "${PWD}:/work" -w /work $uvImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$f.txt"
}
function Compare-ToolsFiles($da, $a, $db, $b, $name, $flag) {
  $out = "$dir/DIFF-$name.txt"
  "### $a  vs  $b  $flag" | Out-File $out
  & docker run --rm -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs "$da/$a.tools.json" "$db/$b.tools.json" $flag 2>&1 | Tee-Object -FilePath $out -Append
}

# 1) dbhub: comparaciones sobre los ficheros ya medidos
$f5 = Safe-Name "@bytebase/dbhub@0.22.5"; $f6 = Safe-Name "@bytebase/dbhub@0.22.6"
Compare-ToolsFiles $src "$f5.a" $src "$f5.b" "dbhub-control-0.22.5" ""
Compare-ToolsFiles $src "$f6.a" $src "$f6.b" "dbhub-control-0.22.6" ""
Compare-ToolsFiles $src "$f5.a" $src "$f6.a" "dbhub-0.22.5-vs-0.22.6" ""

# 2) mysql con python-dotenv anadido (0.4.1, 0.4.2) y la 0.4.4 tal cual; orden intercalado
$menv = "--env=MYSQL_HOST=127.0.0.1 --env=MYSQL_USER=probe --env=MYSQL_PASSWORD=probe --env=MYSQL_DATABASE=probe"
$m1 = "mysql-mcp-server@0.4.1+dotenv"; $m2 = "mysql-mcp-server@0.4.2+dotenv"; $m4 = "mysql-mcp-server@0.4.4"
Probe-Uv "mysql-mcp-server" $m1 "uvx --with python-dotenv --from mysql-mcp-server==0.4.1 mysql_mcp_server" "a" $menv
Probe-Uv "mysql-mcp-server" $m2 "uvx --with python-dotenv --from mysql-mcp-server==0.4.2 mysql_mcp_server" "a" $menv
Probe-Uv "mysql-mcp-server" $m4 "uvx --from mysql-mcp-server==0.4.4 mysql_mcp_server" "a" $menv
Probe-Uv "mysql-mcp-server" $m1 "uvx --with python-dotenv --from mysql-mcp-server==0.4.1 mysql_mcp_server" "b" $menv
Probe-Uv "mysql-mcp-server" $m2 "uvx --with python-dotenv --from mysql-mcp-server==0.4.2 mysql_mcp_server" "b" $menv
$g1 = Safe-Name $m1; $g2 = Safe-Name $m2
Compare-ToolsFiles $dir "$g1.a" $dir "$g1.b" "mysql-control-0.4.1" ""
Compare-ToolsFiles $dir "$g2.a" $dir "$g2.b" "mysql-control-0.4.2" ""
Compare-ToolsFiles $dir "$g1.a" $dir "$g2.a" "mysql-0.4.1-vs-0.4.2" ""
Compare-ToolsFiles $dir "$g1.a" $dir "$g2.a" "mysql-0.4.1-vs-0.4.2-normalized" "--normalize"

Get-ChildItem "$dir/*.txt" -Exclude TODO.txt | Sort-Object Name | ForEach-Object { "######## $($_.Name)"; Get-Content $_ } | Set-Content "$dir/TODO.txt"
Write-Host ""
Write-Host "Listo. Pega aqui el contenido de out\lote2b\TODO.txt (o subelo como archivo)."
