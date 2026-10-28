# Lote 3b (solo ASCII): repite los dos servidores del lote 3 que fallaron por el comando, no por el servidor.
# 1) mcp-server-motherduck: la base en memoria exige --read-write (lo dijo el propio servidor).
# 2) kubernetes-mcp-server: mostro su ayuda y salio. Se repite con un kubeconfig FALSO (cluster inexistente, token inventado) y se guarda su ayuda completa para ver que pide.
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-3b.ps1
# Resultado: out\lote3b\TODO.txt (envialo como archivo). Tarda menos de 15 minutos.
$ErrorActionPreference = "Continue"
$dir = "out/lote3b"
New-Item -ItemType Directory -Force -Path $dir, "calls" | Out-Null
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker no esta en marcha. Abre Docker Desktop, espera a que arranque del todo y vuelve a ejecutar el script."
  exit 1
}
$nodeImg = "node:22-slim"
$uvImg = "ghcr.io/astral-sh/uv:python3.12-bookworm-slim"
$env_txt = "Docker on Windows, no credentials, synthetic data, fixed hostname, resource limits"
$limits = @("--hostname=probe-host", "--memory=3g", "--cpus=2", "--pids-limit=1024", "--security-opt=no-new-privileges")
$tiempos = "$dir/TIEMPOS.csv"
"slug,paquete,pasada,inicio,fin,segundos" | Out-File $tiempos -Encoding ascii
function Safe-Name($pkg) { return ($pkg -replace '[^A-Za-z0-9._-]', '_') }

# kubeconfig inventado: apunta a un cluster que no existe y usa un token que no vale para nada.
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
  param($slug, $pkg, $kind, $cmd, $tag, $envs = @(), $timeout = 120)
  $name = (Safe-Name $pkg) + ".$tag"
  Write-Host ("== {0} ({1}) pasada {2}  [{3}]" -f $slug, $pkg, $tag, (Get-Date -Format "HH:mm:ss"))
  $t0 = Get-Date
  $envArgs = @()
  foreach ($e in $envs) { $envArgs += "--env=$e" }
  if ($kind -eq "npm") {
    $cmdArgs = $cmd -split " "
    & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/mcp-probe.mjs "--slug=$slug" "--package=$pkg" "--timeout=$timeout" "--tools-out=$dir/$name.tools.json" "--record-out=$dir/$name.record.json" @envArgs "--environment=$nodeImg, $env_txt" -- @cmdArgs 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  } else {
    $envStr = ""
    foreach ($e in $envArgs) { $envStr += "'" + $e + "' " }
    $inner = "apt-get update -qq > /dev/null 2>&1 && apt-get install -y -qq nodejs git > /dev/null 2>&1 && node scripts/mcp-probe.mjs --slug=$slug --package=$pkg --timeout=$timeout --tools-out=$dir/$name.tools.json --record-out=$dir/$name.record.json $envStr '--environment=uv python3.12 image, $env_txt' -- $cmd"
    & docker run --rm @limits -v "${PWD}:/work" -w /work $uvImg sh -c $inner 2>&1 | Tee-Object -FilePath "$dir/$name.txt"
  }
  $t1 = Get-Date
  ("{0},{1},{2},{3},{4},{5}" -f $slug, $pkg, $tag, $t0.ToString("s"), $t1.ToString("s"), [int]($t1 - $t0).TotalSeconds) | Add-Content $tiempos -Encoding ascii
}

# Ayuda completa de kubernetes-mcp-server, para saber que opciones pide.
Write-Host "== kubernetes-mcp-server --help"
& docker run --rm @limits $nodeImg npx -y kubernetes-mcp-server@0.0.69 --help 2>&1 | Tee-Object -FilePath "$dir/kubernetes-mcp-server.help.txt"

foreach ($pasada in @("a", "b")) {
  Run-Probe -slug "motherduck-mcp-server" -pkg "mcp-server-motherduck@1.1.0" -kind "uv" -cmd "uvx mcp-server-motherduck@1.1.0 --db-path :memory: --read-write" -tag $pasada
  Run-Probe -slug "kubernetes-mcp-server" -pkg "kubernetes-mcp-server@0.0.69" -kind "npm" -cmd "npx -y kubernetes-mcp-server@0.0.69" -tag $pasada -envs @("KUBECONFIG=/work/calls/kubeconfig-fake.yaml") -timeout 90
}

$todo = "$dir/TODO.txt"
"######## TIEMPOS" | Out-File $todo -Encoding ascii
Get-Content $tiempos | Add-Content $todo -Encoding ascii
foreach ($f in (Get-ChildItem "$dir/*.txt" | Where-Object { $_.Name -ne "TODO.txt" } | Sort-Object Name)) {
  ("######## " + $f.Name) | Add-Content $todo -Encoding ascii
  Get-Content $f.FullName | Add-Content $todo -Encoding ascii
}
("FIN: " + (Get-Date -Format "s")) | Add-Content $todo -Encoding ascii
Write-Host ""
Write-Host "Listo. Sube el archivo out\lote3b\TODO.txt."
