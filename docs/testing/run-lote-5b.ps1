# Lote 5b (solo ASCII): github-mcp-server y terraform-mcp-server, que se distribuyen como imagen de Docker.
# La sonda no ejecuta Docker dentro de Docker, asi que se extrae el binario de la imagen oficial (docker create + docker cp) y se ejecuta
# en el contenedor de la sonda (node:22-slim) con los mismos limites que el resto. Las dos imagenes se fijan por DIGEST el dia de la prueba
# (el digest queda en el nombre del paquete y en TODO.txt); la version la declara el propio servidor en serverInfo.
# Pasadas: github por defecto x2 y con --read-only x2 (pareja con flag); terraform por defecto x2. Sin credenciales reales (valores "filler").
# Un fallo al arrancar es un resultado: se registra tal cual.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-5b.ps1
# Necesita en C:\probe\scripts los mcp-probe.mjs y tools-diff.mjs ACTUALES (hash normalizado de listas; los de hoy 5 nov).
# Reanudable: marcas .done en out\lote5b. Para repetir todo, borra out\lote5b y bin. Resultado: out\lote5b\TODO.txt (unos 10 minutos).
$ErrorActionPreference = "Continue"
$dir = "out/lote5b"
$bin = "bin"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
New-Item -ItemType Directory -Force -Path $bin | Out-Null
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker no esta en marcha. Abre Docker Desktop, espera a que arranque del todo y vuelve a ejecutar el script."
  exit 1
}
$nodeImg = "node:22-slim"
$env_txt = "Docker on Windows, no real credentials, filler values, fixed hostname, resource limits"
$limits = @("--hostname=probe-host", "--memory=3g", "--cpus=2", "--pids-limit=1024", "--security-opt=no-new-privileges")
$tiempos = "$dir/TIEMPOS.csv"
if (-not (Test-Path $tiempos)) { "slug,variante,pasada,inicio,fin,segundos" | Out-File $tiempos -Encoding ascii }
function Safe-Name($s) { return ($s -replace '[^A-Za-z0-9._-]', '_') }

# ---- Extraer el binario de una imagen y devolver su digest ----
function Extract-Binary {
  param($image, $pathInImage, $outName)
  $target = "$bin/$outName"
  & docker pull $image 2>&1 | Out-Null
  $digest = (& docker image inspect $image --format '{{index .RepoDigests 0}}' 2>$null)
  if (-not $digest) { $digest = "$image (sin digest)" }
  if (-not (Test-Path $target)) {
    $cid = (& docker create $image 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $cid) { Write-Host "No se pudo crear el contenedor de $image"; return $digest }
    & docker cp "${cid}:${pathInImage}" $target 2>&1 | Out-Null
    & docker rm $cid 2>&1 | Out-Null
  }
  if (-not (Test-Path $target)) { Write-Host "No se pudo extraer $pathInImage de $image"; }
  # Anotar con que se ha hecho, para TODO.txt
  ("{0} -> {1} ({2}), digest {3}, {4} bytes" -f $image, $target, $pathInImage, $digest, $(if (Test-Path $target) { (Get-Item $target).Length } else { "NO EXTRAIDO" })) | Add-Content "$dir/EXTRACCION.txt" -Encoding ascii
  return $digest
}
Remove-Item "$dir/EXTRACCION.txt" -ErrorAction SilentlyContinue
$ghDigest = Extract-Binary -image "ghcr.io/github/github-mcp-server" -pathInImage "/server/github-mcp-server" -outName "github-mcp-server"
$tfDigest = Extract-Binary -image "hashicorp/terraform-mcp-server" -pathInImage "/bin/terraform-mcp-server" -outName "terraform-mcp-server"

function Run-Probe {
  param($slug, $pkg, $variant, $binName, $binArgs, $tag, $envs = @())
  $name = (Safe-Name $slug) + "." + (Safe-Name $variant) + "." + $tag
  if (Test-Path "$dir/$name.done") { Write-Host "(ya hecho) $name"; return }
  if (-not (Test-Path "$bin/$binName")) { Write-Host "(sin binario) $name"; "sin binario: $bin/$binName" | Out-File "$dir/$name.txt" -Encoding ascii; return }
  Write-Host ("== {0} [{1}] pasada {2}  [{3}]" -f $slug, $variant, $tag, (Get-Date -Format "HH:mm:ss"))
  $t0 = Get-Date
  $envStr = ""
  foreach ($e in $envs) { $envStr += "'--env=" + $e + "' " }
  # El binario se copia dentro del contenedor y se marca ejecutable (NTFS no conserva el bit de ejecucion).
  $inner = "cp /work/$bin/$binName /tmp/$binName && chmod +x /tmp/$binName && node scripts/mcp-probe.mjs --slug=$slug '--package=$pkg' --timeout=90 --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json $envStr '--environment=$nodeImg + binary extracted from the official image, $env_txt, variant: $variant' -- /tmp/$binName $binArgs"
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  $t1 = Get-Date
  ("{0},{1},{2},{3},{4},{5}" -f $slug, $variant, $tag, $t0.ToString("s"), $t1.ToString("s"), [int]($t1 - $t0).TotalSeconds) | Add-Content $tiempos -Encoding ascii
  "ok" | Out-File "$dir/$name.done" -Encoding ascii
}

$ghTok = @("GITHUB_PERSONAL_ACCESS_TOKEN=filler-not-a-real-key")
foreach ($p in @("1", "2")) {
  Run-Probe -slug "github-mcp-server" -pkg $ghDigest -variant "default" -binName "github-mcp-server" -binArgs "stdio" -tag $p -envs $ghTok
  Run-Probe -slug "github-mcp-server" -pkg $ghDigest -variant "read-only" -binName "github-mcp-server" -binArgs "stdio --read-only" -tag $p -envs $ghTok
  Run-Probe -slug "terraform-mcp-server" -pkg $tfDigest -variant "default" -binName "terraform-mcp-server" -binArgs "" -tag $p
}

# ---- Comparaciones (en bruto y con listas normalizadas) ----
function Compare-Pair($a, $b, $label) {
  "######## $label" | Add-Content "$dir/COMPARACIONES.txt" -Encoding ascii
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs "$dir/$a" "$dir/$b" 2>&1 | Add-Content "$dir/COMPARACIONES.txt" -Encoding ascii
}
Remove-Item "$dir/COMPARACIONES.txt" -ErrorAction SilentlyContinue
Compare-Pair "github-mcp-server.default.1.tools.json" "github-mcp-server.default.2.tools.json" "GITHUB: por defecto, pasada 1 frente a 2"
Compare-Pair "github-mcp-server.default.1.tools.json" "github-mcp-server.read-only.1.tools.json" "GITHUB: por defecto frente a --read-only"
Compare-Pair "github-mcp-server.read-only.1.tools.json" "github-mcp-server.read-only.2.tools.json" "GITHUB: --read-only, pasada 1 frente a 2"
Compare-Pair "terraform-mcp-server.default.1.tools.json" "terraform-mcp-server.default.2.tools.json" "TERRAFORM: por defecto, pasada 1 frente a 2"

$todo = "$dir/TODO.txt"
"######## EXTRACCION (imagen, digest y tamano del binario)" | Out-File $todo -Encoding ascii
if (Test-Path "$dir/EXTRACCION.txt") { Get-Content "$dir/EXTRACCION.txt" | Add-Content $todo -Encoding ascii }
"######## TIEMPOS" | Add-Content $todo -Encoding ascii
Get-Content $tiempos | Add-Content $todo -Encoding ascii
if (Test-Path "$dir/COMPARACIONES.txt") { Get-Content "$dir/COMPARACIONES.txt" | Add-Content $todo -Encoding ascii }
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -notin @("TODO.txt", "COMPARACIONES.txt", "EXTRACCION.txt") } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\lote5b\TODO.txt."
