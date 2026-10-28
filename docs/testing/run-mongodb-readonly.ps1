# MongoDB MCP 3.1.0 (solo ASCII): lista de herramientas con la configuracion por defecto y con --readOnly, dos pasadas cada una.
# Objetivo: saber que herramientas anuncia sin y con el modo de solo lectura. No se llama a ninguna herramienta.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-mongodb-readonly.ps1
# Resultado: out\mongo-ro\TODO.txt (envialo como archivo). Tarda menos de 10 minutos.
# Seguridad: sin credenciales, sin cadena de conexion, sin montar carpetas personales (solo C:\probe), limites de memoria, CPU y procesos.
$ErrorActionPreference = "Continue"
$dir = "out/mongo-ro"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker no esta en marcha. Abre Docker Desktop, espera a que arranque del todo y vuelve a ejecutar el script."
  exit 1
}
$nodeImg = "node:22-slim"
$env_txt = "Docker on Windows, no credentials, no connection string, fixed hostname, resource limits"
$limits = @("--hostname=probe-host", "--memory=3g", "--cpus=2", "--pids-limit=1024", "--security-opt=no-new-privileges")
$pkg = "mongodb-mcp-server@3.1.0"

function Run-Probe {
  param($tag, $cmd)
  $name = "mongodb.$tag"
  Write-Host ("== {0}  [{1}]" -f $tag, (Get-Date -Format "HH:mm:ss"))
  $cmdArgs = $cmd -split " "
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/mcp-probe.mjs "--slug=mongodb-mcp-server" "--package=$pkg" "--timeout=120" "--tools-out=$dir/$name.tools.json" "--record-out=$dir/$name.record.json" "--environment=$nodeImg, $env_txt, $tag" -- @cmdArgs 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
}

foreach ($pasada in @("1", "2")) {
  Run-Probe -tag "default.$pasada" -cmd "npx -y mongodb-mcp-server@3.1.0"
  Run-Probe -tag "readonly.$pasada" -cmd "npx -y mongodb-mcp-server@3.1.0 --readOnly"
}

# Diferencia de herramientas entre los dos modos.
Write-Host "== diferencia default vs readOnly"
& docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs "$dir/mongodb.default.1.tools.json" "$dir/mongodb.readonly.1.tools.json" 2>&1 | Tee-Object -FilePath "$dir/DIFF-default-vs-readonly.txt"

$todo = "$dir/TODO.txt"
"######## RESULTADO" | Out-File $todo -Encoding ascii
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -ne "TODO.txt" } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\mongo-ro\TODO.txt."
