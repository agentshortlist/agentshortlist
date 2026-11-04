# Lote 5 (solo ASCII): 16 servidores de las fichas verificadas que aun no tienen prueba nuestra, sin credenciales reales.
# Una pasada de cada uno (versiones fijadas el 4 nov 2026, las ultimas en npm/PyPI ese dia) y una segunda pasada de las 3 parejas con flag.
# Un fallo al arrancar es un resultado: se registra tal cual (algunos servidores validan la clave al arrancar).
# Uso (PowerShell, desde C:\probe):  powershell -ExecutionPolicy Bypass -File .\run-lote-5.ps1
# Reanudable: si se corta, vuelve a ejecutarlo y salta lo hecho (marcas .done en out\lote5). Para repetir todo, borra out\lote5.
# Resultado: out\lote5\TODO.txt (envialo como archivo). Deberia tardar unos 25 a 40 minutos.
# Seguridad: sin credenciales reales (valores "filler"), sin montar carpetas personales (solo C:\probe), limites de memoria, CPU y procesos, hostname fijo.
$ErrorActionPreference = "Continue"
$dir = "out/lote5"
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


# ---- Pasada 1: un servidor por ficha (version fijada) ----
$p = "1"
Run-Probe -slug "firecrawl-mcp-server" -pkg "firecrawl-mcp@3.36.1" -variant "default" -kind "node" -cmd "npx -y firecrawl-mcp@3.36.1" -tag $p -envs @("FIRECRAWL_API_KEY=filler-not-a-real-key")
Run-Probe -slug "apify-mcp-server" -pkg "@apify/actors-mcp-server@0.20.1" -variant "default" -kind "node" -cmd "npx -y @apify/actors-mcp-server@0.20.1 --telemetry-enabled=false" -tag $p -envs @("APIFY_TOKEN=filler-not-a-real-key")
Run-Probe -slug "tavily-mcp" -pkg "tavily-mcp@0.2.22" -variant "default" -kind "node" -cmd "npx -y tavily-mcp@0.2.22" -tag $p -envs @("TAVILY_API_KEY=filler-not-a-real-key")
Run-Probe -slug "exa-mcp-server" -pkg "exa-mcp-server@3.4.3" -variant "default" -kind "node" -cmd "npx -y exa-mcp-server@3.4.3" -tag $p -envs @("EXA_API_KEY=filler-not-a-real-key")
Run-Probe -slug "perplexity-mcp-server" -pkg "@perplexity-ai/mcp-server@1.3.0" -variant "default" -kind "node" -cmd "npx -y @perplexity-ai/mcp-server@1.3.0" -tag $p -envs @("PERPLEXITY_API_KEY=filler-not-a-real-key")
Run-Probe -slug "bright-data-mcp" -pkg "@brightdata/mcp@4.3.0" -variant "default" -kind "node" -cmd "npx -y @brightdata/mcp@4.3.0" -tag $p -envs @("API_TOKEN=filler-not-a-real-key")
Run-Probe -slug "framelink-mcp-for-figma" -pkg "figma-developer-mcp@0.13.2" -variant "default" -kind "node" -cmd "npx -y figma-developer-mcp@0.13.2 --stdio" -tag $p -envs @("FIGMA_API_KEY=filler-not-a-real-key")
Run-Probe -slug "notion-mcp-server" -pkg "@notionhq/notion-mcp-server@2.6.1" -variant "default" -kind "node" -cmd "npx -y @notionhq/notion-mcp-server@2.6.1" -tag $p -envs @("NOTION_TOKEN=filler-not-a-real-key")
Run-Probe -slug "stripe-agent-toolkit" -pkg "@stripe/mcp@0.3.3" -variant "tools-all" -kind "node" -cmd "npx -y @stripe/mcp@0.3.3 --tools=all" -tag $p -envs @("STRIPE_SECRET_KEY=rk_test_filler_not_a_real_key")
Run-Probe -slug "neon-mcp-server" -pkg "@neondatabase/mcp-server-neon@0.6.5" -variant "default" -kind "node" -cmd "npx -y @neondatabase/mcp-server-neon@0.6.5 start filler-not-a-real-key" -tag $p
Run-Probe -slug "microsoft-mcp-catalog" -pkg "@azure/mcp@4.0.0-beta.4" -variant "azure-mcp-server" -kind "node" -cmd "npx -y @azure/mcp@4.0.0-beta.4 server start" -tag $p -envs @("AZURE_MCP_COLLECT_TELEMETRY=false")
Run-Probe -slug "google-workspace-mcp" -pkg "workspace-mcp@2.3.0" -variant "default" -kind "uv" -cmd "uvx workspace-mcp@2.3.0" -tag $p -envs @("GOOGLE_OAUTH_CLIENT_ID=filler-not-a-real-id", "GOOGLE_OAUTH_CLIENT_SECRET=filler-not-a-real-key")
Run-Probe -slug "home-assistant-mcp-server" -pkg "ha-mcp@9.1.0" -variant "default" -kind "uv" -cmd "uvx ha-mcp@9.1.0" -tag $p -envs @("HOMEASSISTANT_URL=http://localhost:8123", "HOMEASSISTANT_TOKEN=filler-not-a-real-key")

# ---- Parejas con flag (dos variantes, dos pasadas) ----
foreach ($p in @("1", "2")) {
  # supabase: por defecto y solo lectura
  Run-Probe -slug "supabase-mcp" -pkg "@supabase/mcp-server-supabase@0.15.0" -variant "default" -kind "node" -cmd "npx -y @supabase/mcp-server-supabase@0.15.0 --access-token=filler-not-a-real-key" -tag $p
  Run-Probe -slug "supabase-mcp" -pkg "@supabase/mcp-server-supabase@0.15.0" -variant "read-only" -kind "node" -cmd "npx -y @supabase/mcp-server-supabase@0.15.0 --access-token=filler-not-a-real-key --read-only" -tag $p
  # sentry: por defecto y sin la habilidad de gestion de proyectos
  Run-Probe -slug "sentry-mcp" -pkg "@sentry/mcp-server@0.42.0" -variant "default" -kind "node" -cmd "npx -y @sentry/mcp-server@0.42.0 --access-token=filler-not-a-real-key" -tag $p
  Run-Probe -slug "sentry-mcp" -pkg "@sentry/mcp-server@0.42.0" -variant "disable-project-management" -kind "node" -cmd "npx -y @sentry/mcp-server@0.42.0 --access-token=filler-not-a-real-key --disable-skills=project-management" -tag $p
  # mcp-atlassian: escritura permitida y modo de solo lectura (URL e identidades de relleno)
  Run-Probe -slug "mcp-atlassian" -pkg "mcp-atlassian@0.23.1" -variant "read-only-false" -kind "uv" -cmd "uvx mcp-atlassian@0.23.1" -tag $p -envs @("JIRA_URL=https://filler.invalid", "JIRA_USERNAME=filler@example.invalid", "JIRA_API_TOKEN=filler-not-a-real-key", "CONFLUENCE_URL=https://filler.invalid/wiki", "CONFLUENCE_USERNAME=filler@example.invalid", "CONFLUENCE_API_TOKEN=filler-not-a-real-key", "READ_ONLY_MODE=false")
  Run-Probe -slug "mcp-atlassian" -pkg "mcp-atlassian@0.23.1" -variant "read-only-true" -kind "uv" -cmd "uvx mcp-atlassian@0.23.1" -tag $p -envs @("JIRA_URL=https://filler.invalid", "JIRA_USERNAME=filler@example.invalid", "JIRA_API_TOKEN=filler-not-a-real-key", "CONFLUENCE_URL=https://filler.invalid/wiki", "CONFLUENCE_USERNAME=filler@example.invalid", "CONFLUENCE_API_TOKEN=filler-not-a-real-key", "READ_ONLY_MODE=true")
}

# Comparaciones de las variantes con y sin flag.
function Compare-Pair($a, $b, $label) {
  "######## $label" | Add-Content "$dir/COMPARACIONES.txt" -Encoding ascii
  & docker run --rm @limits -v "${PWD}:/work" -w /work $nodeImg node scripts/tools-diff.mjs "$dir/$a" "$dir/$b" 2>&1 | Add-Content "$dir/COMPARACIONES.txt" -Encoding ascii
}
Remove-Item "$dir/COMPARACIONES.txt" -ErrorAction SilentlyContinue
Compare-Pair "supabase-mcp.default.1.tools.json" "supabase-mcp.read-only.1.tools.json" "SUPABASE: por defecto frente a --read-only"
Compare-Pair "sentry-mcp.default.1.tools.json" "sentry-mcp.disable-project-management.1.tools.json" "SENTRY: por defecto frente a --disable-skills=project-management"
Compare-Pair "mcp-atlassian.read-only-false.1.tools.json" "mcp-atlassian.read-only-true.1.tools.json" "ATLASSIAN: READ_ONLY_MODE false frente a true"

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
Write-Host "Listo. Sube el archivo out\lote5\TODO.txt."
