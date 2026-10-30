// Pruebas que hemos ejecutado nosotros. Cada registro describe una combinación exacta; una ficha sin registros muestra "Tested by us: Not yet".
// Se rellena a mano con el JSON que imprime scripts/mcp-probe.mjs. No se infiere nada: si no hay registro, no hay prueba.
export type ProbeStatus = "pass" | "fail" | "not-run";

export type ProbeRecord = {
  slug: string;
  testedAt: string; // AAAA-MM-DD
  package: string; // paquete y versión exactos, p. ej. "@playwright/mcp@0.0.83"
  client: string; // "mcp-probe" cuando es el script; o Claude Code, Cursor… cuando se prueba en un cliente real
  clientVersion: string;
  os: string; // sistema anfitrión
  environment: string; // p. ej. "Docker node:22-slim, no credentials, synthetic data"
  command?: string; // comando de arranque exacto, con sus flags, tal como se lanzó
  protocol?: { era: "modern" | "legacy" | "unknown"; discover: string; versionAnswered: string | null; supportedVersions?: string[] | null; checkedAt?: string }; // era del protocolo que habló el servidor; la sonda prueba server/discover (2026-07-28) y, si no, initialize
  envSet?: string[]; // nombres (nunca valores) de las variables de entorno que se pasaron al servidor
  install: ProbeStatus;
  handshake: ProbeStatus; // initialize respondido con un protocolo válido
  toolsList: { status: ProbeStatus; count: number | null };
  toolNames?: string[]; // nombres devueltos por tools/list en esa ejecución; de aquí salen las capacidades de la ficha
  call?: { tool: string; status: ProbeStatus; note: string }; // llamada inocua, solo si se pudo aislar
  hashes?: { descriptions: string; schemas: string; all: string }; // sha256 del tools/list canónico (ordenado por nombre y por claves)
  notes: string;
};

export const TESTS: ProbeRecord[] = [
  {
    "slug": "playwright-mcp",
    "testedAt": "2026-10-25",
    "package": "@playwright/mcp@0.0.83",
    "command": "npx -y @playwright/mcp@0.0.83",
    "protocol": { "era": "legacy", "discover": "error -32601", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "browser_click",
      "browser_close",
      "browser_console_messages",
      "browser_drag",
      "browser_drop",
      "browser_emulate_media",
      "browser_evaluate",
      "browser_file_upload",
      "browser_fill_form",
      "browser_find",
      "browser_handle_dialog",
      "browser_hover",
      "browser_navigate",
      "browser_navigate_back",
      "browser_network_request",
      "browser_network_requests",
      "browser_press_key",
      "browser_resize",
      "browser_run_code_unsafe",
      "browser_select_option",
      "browser_snapshot",
      "browser_tabs",
      "browser_take_screenshot",
      "browser_type",
      "browser_wait_for"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 25
    },
    "hashes": {
      "descriptions": "990f2fbd5224d395364e968689183e94256d1292dd8cef1d6d3889de16324b49",
      "schemas": "315827a3da1734dc5a5df8ad695477aedec293664ca7b2fe12c1c0ab4ae5f81e",
      "all": "031d2a957c439e17981835b0f5cb29aecbc24f322331ddecb4a42d416094120f"
    },
    "notes": "Server reported: Playwright 1.64.0-alpha-1790635538000. Default tool set only; the README lists more under optional --caps groups."
  },
  {
    "slug": "chrome-devtools-mcp",
    "testedAt": "2026-10-25",
    "package": "chrome-devtools-mcp@1.12.0",
    "command": "npx -y chrome-devtools-mcp@1.12.0",
    "protocol": { "era": "legacy", "discover": "error -32601", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "click",
      "close_page",
      "drag",
      "emulate",
      "evaluate_script",
      "fill",
      "fill_form",
      "get_console_message",
      "get_css_styles",
      "get_network_request",
      "handle_dialog",
      "hover",
      "lighthouse_audit",
      "list_console_messages",
      "list_network_requests",
      "list_pages",
      "navigate_page",
      "new_page",
      "performance_analyze_insight",
      "performance_start_trace",
      "performance_stop_trace",
      "press_key",
      "resize_page",
      "screencast_start",
      "screencast_stop",
      "select_page",
      "take_heapsnapshot",
      "take_screenshot",
      "take_snapshot",
      "type_text",
      "upload_file",
      "wait_for"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 32
    },
    "hashes": {
      "descriptions": "2f6805e7735e9b7808f39bcf7a062f64ad1fc6d72ac5e455c66ddd395f7003a2",
      "schemas": "8bdf9130d45fb00dbe097d3f3e291c957f8359d97557c12d5de279fc2f51789e",
      "all": "578944f444981fbc65fabf1d9bd9fc808ecab0007eec73a3295d7fe37fc88fd8"
    },
    "notes": "Server reported: chrome_devtools 1.12.0. Two independent runs gave identical hashes."
  },
  {
    "slug": "codebase-memory-mcp",
    "testedAt": "2026-10-25",
    "package": "codebase-memory-mcp@0.12.1",
    "command": "npx -y codebase-memory-mcp@0.12.1",
    "protocol": { "era": "legacy", "discover": "error -32601", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "check_index_coverage",
      "compare_graphs",
      "delete_project",
      "detect_changes",
      "get_architecture",
      "get_code_snippet",
      "get_file_outline",
      "get_graph_schema",
      "index_repository",
      "index_status",
      "ingest_traces",
      "list_projects",
      "manage_adr",
      "query_graph",
      "search_code",
      "search_graph",
      "trace_path"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 17
    },
    "hashes": {
      "descriptions": "f625d60959ad9cdec133a4750141e39da9973d7f66ef1b0d10216441c34d9978",
      "schemas": "a4baf321fc0558cc068ef956d58b2c7b68d7bcf44767119875e7d06edcdd4587",
      "all": "1e736f63bea251b70ba4a36988f9aab249d64a23798ad4ce9adb13c1bc7822b8"
    },
    "notes": "Server reported: codebase-memory-mcp 0.12.1. Two independent runs gave identical hashes."
  },
  {
    "slug": "context7",
    "testedAt": "2026-10-25",
    "package": "@upstash/context7-mcp@4.4.4",
    "command": "npx -y @upstash/context7-mcp@4.4.4",
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "query-docs",
      "resolve-library-id"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 2
    },
    "hashes": {
      "descriptions": "ebaa0fde057eae0fead5b36acbed1c13944230d880a56268b00a5e7ad6138bed",
      "schemas": "f44858276e856937467ee3133207ba9eac15b3aea79eb5e2074a8449c638a786",
      "all": "36dee0f3fbf80c4ed815e2b82cdfeb444188e7e941177d3124e31a3e0d6d91d6"
    },
    "notes": "Server reported: Context7 4.4.4. Two independent runs gave identical hashes."
  },
  {
    "slug": "desktop-commander-mcp",
    "testedAt": "2026-10-25",
    "package": "@wonderwhy-er/desktop-commander@0.3.1",
    "command": "npx -y @wonderwhy-er/desktop-commander@0.3.1",
    "protocol": { "era": "legacy", "discover": "no answer within 20 s", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "create_directory",
      "edit_block",
      "force_terminate",
      "get_config",
      "get_file_info",
      "get_more_search_results",
      "get_recent_tool_calls",
      "get_usage_stats",
      "give_feedback_to_desktop_commander",
      "interact_with_process",
      "kill_process",
      "list_directory",
      "list_processes",
      "list_searches",
      "list_sessions",
      "move_file",
      "read_file",
      "read_multiple_files",
      "read_process_output",
      "set_config_value",
      "start_process",
      "start_search",
      "stop_search",
      "write_file",
      "write_pdf"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 25
    },
    "hashes": {
      "descriptions": "c68a36f6153834e856985cacc4df35e07bdb46ea7030d1339cb667afac6381bb",
      "schemas": "ae547cc215bc65c292355be625dab7f418a12c22728d7e37e026f6ba7d15a46f",
      "all": "adcf108b6a681c95074acaaff6b76e80ffe98166f0d4e32a0694b904a3a2eacb"
    },
    "notes": "Server reported: desktop-commander 0.3.1. Across two runs of the same version only the description of start_process changed, and the only difference is the container ID that the server embeds in that text (Docker container hostname). Schemas and every other description were identical. The description hash is therefore environment-dependent for this server. The card counts 24 tool names in the source at review time; the server listed 25."
  },
  {
    "slug": "excel-mcp-server",
    "testedAt": "2026-10-25",
    "package": "excel-mcp-server@2.2.2",
    "command": "uvx excel-mcp-server@2.2.2 stdio",
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "add_conditional_format",
      "add_data_validation",
      "add_slicer",
      "add_sparklines",
      "clear_range",
      "copy_range",
      "copy_sheet",
      "create_chart",
      "create_pivot_table",
      "create_sheet",
      "create_workbook",
      "delete_chart",
      "delete_defined_name",
      "delete_image",
      "delete_note",
      "delete_pivot_table",
      "delete_rows_or_columns",
      "delete_sheet",
      "delete_slicer",
      "delete_sparklines",
      "describe_sheet",
      "describe_workbook",
      "export_csv",
      "export_workbook",
      "find_cells",
      "format_range",
      "goal_seek",
      "import_csv",
      "import_workbook",
      "insert_image",
      "insert_rows_or_columns",
      "list_workbooks",
      "merge_cells",
      "read_range",
      "read_vba",
      "rename_sheet",
      "replace_cells",
      "set_defined_name",
      "set_note",
      "set_sheet_layout",
      "set_table",
      "set_workbook_settings",
      "sort_range",
      "trace_formula",
      "transform_range",
      "write_range"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker uv + Python 3.12 image on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 46
    },
    "hashes": {
      "descriptions": "43d25765e2b4a91c2df0b1e7a477981eb6743b46743c6aba1913a777adcf27df",
      "schemas": "3cac06d49c23dabe1fc4dd9ed1f75b57dcee9765eb508bd65070bcfa7b1a9ae3",
      "all": "448648db90a640f336e736195cba7146c79bca3a550d67df4929f4489d1edeb8"
    },
    "notes": "Server reported: excel-mcp-server 2.2.2. Two independent runs gave identical hashes."
  },
  {
    "slug": "mcp-reference-servers",
    "testedAt": "2026-10-25",
    "package": "@modelcontextprotocol/server-memory@2.0.0",
    "command": "npx -y @modelcontextprotocol/server-memory@2.0.0",
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "add_observations",
      "create_entities",
      "create_relations",
      "delete_entities",
      "delete_observations",
      "delete_relations",
      "open_nodes",
      "read_graph",
      "search_nodes"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list + tools/call)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 9
    },
    "hashes": {
      "descriptions": "a87ffed14beded92944e41bbdce5999268cbf0baf5ee6a590714e900dbaf2644",
      "schemas": "1c5a6ed89cfa7258bbbfd3ded235dff77334c7400ea21fcab118520c51a12610",
      "all": "11b7c9f3ec06f0140a6a7d06ae31b34c8f6f486be8f70eb0c5bb67ee7fd0749c"
    },
    "notes": "Server reported: memory-server 2.0.0. One run. A second run the same day added the harmless call below, with synthetic data and nothing read from or written to the host; its description, schema and combined hashes were identical to the first run.",
    "call": {
      "tool": "create_entities then read_graph",
      "status": "pass",
      "note": "create_entities: pass (returned 1 content item(s)); read_graph: pass (returned 1 content item(s))"
    }
  },
  {
    "slug": "mcp-reference-servers",
    "testedAt": "2026-10-25",
    "package": "@modelcontextprotocol/server-everything@2.0.0",
    "command": "npx -y @modelcontextprotocol/server-everything@2.0.0",
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "echo",
      "get-annotated-message",
      "get-env",
      "get-header-params",
      "get-resource-links",
      "get-resource-reference",
      "get-structured-content",
      "get-sum",
      "get-tiny-image",
      "gzip-file-as-resource",
      "toggle-simulated-logging",
      "toggle-subscriber-updates",
      "trigger-list-changed",
      "trigger-log-messages",
      "trigger-long-running-operation",
      "trigger-resource-update"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list + tools/call)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 16
    },
    "hashes": {
      "descriptions": "c7fddaf32ebb05d4300d687e087b8f763d1be898972b95da4de867469bf74760",
      "schemas": "84c6a3b67b3c57e29b2add934bef43a3be9eca5b825a06d38b2974106797699e",
      "all": "fb20b3b223e9f2cf913161894e9483c516a08f5e5b8c30d09b639c44ffa15bc9"
    },
    "notes": "Server reported: mcp-servers/everything 2.0.0. One run. A second run the same day added the harmless call below, with synthetic data and nothing read from or written to the host; its description, schema and combined hashes were identical to the first run.",
    "call": {
      "tool": "echo then get-sum",
      "status": "pass",
      "note": "echo: pass (returned 1 content item(s)); get-sum: pass (returned 1 content item(s))"
    }
  },
  {
    "slug": "mcp-reference-servers",
    "testedAt": "2026-10-25",
    "package": "mcp-server-fetch@2026.10.19",
    "command": "uvx mcp-server-fetch@2026.10.19",
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "fetch"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list + tools/call)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker uv + Python 3.12 image on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 1
    },
    "hashes": {
      "descriptions": "f213135d2a1436e49d241fdc3a378abe8f3c73ea53a2ac3e12586a8879fdd469",
      "schemas": "e186538bc766e3337c0e8ff9af437fc72545d7a191901de2800888b895b05f2f",
      "all": "0fadc3fc5bc81144ddf787b1b9d71d372283360df210d1d1ce160f42c5b45d4f"
    },
    "notes": "Server reported: mcp-fetch 2026.10.19. One run. A second run the same day added the harmless call below, with synthetic data and nothing read from or written to the host; its description, schema and combined hashes were identical to the first run.",
    "call": {
      "tool": "fetch",
      "status": "pass",
      "note": "fetch: pass (returned 1 content item(s)), reading https://example.com, a static page"
    }
  },
  {
    "slug": "mcp-reference-servers",
    "testedAt": "2026-10-25",
    "package": "mcp-server-git@2026.10.19",
    "command": "uvx mcp-server-git@2026.10.19",
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "git_add",
      "git_branch",
      "git_checkout",
      "git_commit",
      "git_create_branch",
      "git_diff",
      "git_diff_staged",
      "git_diff_unstaged",
      "git_log",
      "git_reset",
      "git_show",
      "git_status"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list + tools/call)",
    "os": "Linux (Docker on Windows, WSL2) x64",
    "environment": "Docker uv + Python 3.12 image with git installed, on Windows (WSL2), no credentials, synthetic data",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 12
    },
    "hashes": {
      "descriptions": "62fdd2360ddfc89a0dc0576f12f322fab29daeb95dc04f549353aabebf40b762",
      "schemas": "3f2a4ebcbdaf7834d212cf0d435b1c1ad71d18cf160c6d02c4808776c3ffb3d1",
      "all": "d3d90e48478d7f468753d7705d582b311d1ed1bb48281281bd0a81d54ad1dc26"
    },
    "notes": "Server reported: mcp-git 2026.10.19. One run. A first attempt without the git binary in the container did not start; the server needs git installed. A second run the same day added the harmless call below, with synthetic data and nothing read from or written to the host; its description, schema and combined hashes were identical to the first run.",
    "call": {
      "tool": "git_status",
      "status": "pass",
      "note": "git_status: pass (returned 1 content item(s)), on an empty repository created inside the container"
    }
  },
  {
    "slug": "dbhub",
    "testedAt": "2026-10-25",
    "package": "@bytebase/dbhub@0.22.5",
    "command": "npx -y @bytebase/dbhub@0.22.5 --demo",
    "protocol": { "era": "legacy", "discover": "no answer within 20 s", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "execute_sql",
      "search_objects"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data, fixed hostname, --demo (in-memory SQLite)",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 2
    },
    "hashes": {
      "descriptions": "a629bd6a8da832f300d929e1081a0930e16545185427c51ee535f9a2919a7fb5",
      "schemas": "910f0162e31290227691de94570ec1bb836f6da284bb1740666474eded6e8f89",
      "all": "5fc028095d37345773c12f6cdb5381116fb53b521b73ee106d1d5c4150c1ee88"
    },
    "notes": "Server reported: DBHub MCP Server 0.22.5. Two independent runs gave identical hashes. This release is affected by GHSA-mwwr-p57h-56pf (read-only mode did not prevent writes). The two releases announced a byte-identical tools/list (same description, schema and combined hashes), so a check that only reads tool definitions cannot tell them apart."
  },
  {
    "slug": "dbhub",
    "testedAt": "2026-10-25",
    "package": "@bytebase/dbhub@0.22.6",
    "command": "npx -y @bytebase/dbhub@0.22.6 --demo",
    "protocol": { "era": "legacy", "discover": "no answer within 20 s", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "execute_sql",
      "search_objects"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data, fixed hostname, --demo (in-memory SQLite)",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 2
    },
    "hashes": {
      "descriptions": "a629bd6a8da832f300d929e1081a0930e16545185427c51ee535f9a2919a7fb5",
      "schemas": "910f0162e31290227691de94570ec1bb836f6da284bb1740666474eded6e8f89",
      "all": "5fc028095d37345773c12f6cdb5381116fb53b521b73ee106d1d5c4150c1ee88"
    },
    "notes": "Server reported: DBHub MCP Server 0.22.6. Two independent runs gave identical hashes. This release fixes GHSA-mwwr-p57h-56pf. The two releases announced a byte-identical tools/list (same description, schema and combined hashes), so a check that only reads tool definitions cannot tell them apart."
  },
  {
    "slug": "mysql-mcp-server",
    "testedAt": "2026-10-25",
    "package": "mysql-mcp-server@0.4.4",
    "command": "uvx --from mysql-mcp-server==0.4.4 mysql_mcp_server",
    "envSet": ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"],
    "protocol": { "era": "legacy", "discover": "error -32602", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "execute_sql",
      "get_schema_info",
      "get_table_sample"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker uv + Python 3.12 image on Windows (WSL2), no credentials, synthetic data, fixed hostname; MYSQL_* variables set to dummy values, no database behind them",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 3
    },
    "hashes": {
      "descriptions": "5953cebbcbcc5dba5a04865778b0a04053bae9c615c02087bdf2844687961c5e",
      "schemas": "a77b9cfb2cf24996ed91984116e8b54d7bf36c2616018c45a7114ee4cd077f46",
      "all": "619fb717bec506d87b6738da824333c7718499667b343b9751ad7ea7d2fdfb2b"
    },
    "notes": "Server reported: mysql_mcp_server 1.30.0. One run. In the same environment, releases 0.4.1 and 0.4.2 did not start from a clean install; we did not record them as runs of this card, which reviews 0.4.4."
  },
  {
    "slug": "mcp-server-kubernetes",
    "testedAt": "2026-10-25",
    "package": "mcp-server-kubernetes@4.1.9",
    "command": "npx -y mcp-server-kubernetes@4.1.9",
    "protocol": { "era": "legacy", "discover": "no answer within 20 s", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "cleanup",
      "kubectl_get",
      "kubectl_describe",
      "kubectl_apply",
      "kubectl_delete",
      "kubectl_create",
      "kubectl_logs",
      "kubectl_scale",
      "kubectl_patch",
      "kubectl_rollout",
      "kubectl_context",
      "kubectl_reconnect",
      "explain_resource",
      "install_helm_chart",
      "upgrade_helm_chart",
      "uninstall_helm_chart",
      "node_management",
      "port_forward",
      "stop_port_forward",
      "exec_in_pod",
      "list_api_resources",
      "kubectl_generic",
      "ping"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 23
    },
    "hashes": {
      "descriptions": "6f41638f50d674603b5ea955bc3b4ed04fc228f9fc6a5c1261f318eeffa437d7",
      "schemas": "42edfa23d99b4444435696c4353dbe1e2010876e356e205b87176421fa9e4458",
      "all": "1ca57931370f2b71439acd42c1dcb3e419a4d0d740118bc359cb29a7dcdfb7ff"
    },
    "notes": "Server reported: kubernetes 4.1.9. Two independent runs gave identical hashes. No kubeconfig or cluster in the container; the tools were listed and none was called."
  },
  {
    "slug": "browser-tools-mcp",
    "testedAt": "2026-10-25",
    "package": "@agentdeskai/browser-tools-mcp@2.0.2",
    "command": "npx -y @agentdeskai/browser-tools-mcp@2.0.2",
    "protocol": { "era": "legacy", "discover": "no answer within 5 s (the server was slow to start; checked again with 20 s: failed on an npm error)", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "listBrowserTabs",
      "getConsoleLogs",
      "getConsoleErrors",
      "getNetworkLogs",
      "getNetworkErrors",
      "getSelectedElement",
      "getPageInfo",
      "getConnectionStatus",
      "takeScreenshot",
      "refreshBrowser",
      "getBrowserStorage",
      "wipeLogs",
      "runAccessibilityAudit",
      "runPerformanceAudit",
      "runSEOAudit",
      "runBestPracticesAudit"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 16
    },
    "hashes": {
      "descriptions": "12d4d9f2d4147eec4674306de3bc204472131e23f16346e6f47d96bf102fc019",
      "schemas": "a7599682ca11ec626f0bf308019157e88ab0b0d9da8936127f50fb088faa63ca",
      "all": "5b2be528a140d98d749c369bf720e5c73d85282e72568c543a3588e410d41386"
    },
    "notes": "Server reported: browser-tools-mcp 2.0.0. Two independent runs gave identical hashes. Listed with no browser extension connected; none of the tools was called."
  },
  {
    "slug": "context-mode",
    "testedAt": "2026-10-25",
    "package": "context-mode@1.0.169",
    "command": "npx -y context-mode@1.0.169",
    "protocol": { "era": "legacy", "discover": "error -32601", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "ctx_execute",
      "ctx_execute_file",
      "ctx_index",
      "ctx_search",
      "ctx_fetch_and_index",
      "ctx_batch_execute",
      "ctx_stats",
      "ctx_doctor",
      "ctx_upgrade",
      "ctx_purge",
      "ctx_insight"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 11
    },
    "hashes": {
      "descriptions": "d0ca0a4473cfd4489d08b7f1eebc3f8be744a7048ab2b70bb588d38da9e279c0",
      "schemas": "b4ae344444ee9ded4a01b909e10985ec9f4d839fc53937c9e39bec7e7427ecb5",
      "all": "d89f7a43985121db7c3dd438c08b233d7c976988f0ea4b0f608e2bb5c3cc221f"
    },
    "notes": "Server reported: context-mode 1.0.169. Two independent runs gave identical hashes. The tools were listed and none was called."
  },
  {
    "slug": "n8n-mcp",
    "testedAt": "2026-10-25",
    "package": "n8n-mcp@2.99.1",
    "command": "npx -y n8n-mcp@2.99.1",
    "envSet": ["MCP_MODE", "LOG_LEVEL"],
    "protocol": { "era": "legacy", "discover": "error -32601", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "tools_documentation",
      "search_nodes",
      "get_node",
      "validate_node",
      "get_template",
      "search_templates",
      "validate_workflow"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 7
    },
    "hashes": {
      "descriptions": "5842676c39bfb4123a2544018967260384345e7c24c1ba916660e220171ae63a",
      "schemas": "11b0c8ceffe0276cb69a59528d896f8b3e2a93a381fc0a5b7c6e9414514f1f8c",
      "all": "66df076e5e34d5b2a6643de483dcfdd93f7b843c2759747e9979f180fc523db5"
    },
    "notes": "Server reported: n8n-documentation-mcp 2.99.1. Two independent runs gave identical hashes. Started with MCP_MODE=stdio and no n8n instance configured: seven documentation and validation tools. The project's README also documents n8n_test_workflow, which is not in this list, so the tool list depends on configuration."
  },
  {
    "slug": "mongodb-mcp-server",
    "testedAt": "2026-10-25",
    "package": "mongodb-mcp-server@3.1.0",
    "command": "npx -y mongodb-mcp-server@3.1.0",
    "protocol": { "era": "legacy", "discover": "no answer within 20 s", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "aggregate-db",
      "aggregate",
      "collection-indexes",
      "collection-schema",
      "collection-storage-size",
      "connect",
      "count",
      "create-collection",
      "create-index",
      "db-stats",
      "delete-many",
      "disconnect",
      "drop-collection",
      "drop-database",
      "drop-index",
      "explain",
      "export",
      "find",
      "insert-many",
      "list-collections",
      "list-connections",
      "list-databases",
      "mongodb-logs",
      "rename-collection",
      "update-many",
      "search-knowledge",
      "list-knowledge-sources"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 27
    },
    "hashes": {
      "descriptions": "895ccb165617d1a866f37e9f2c8d26ca8dc76dd083124f63422ed59c432ae477",
      "schemas": "05c1cde4137990c74b07fb37aa7fab34042cc5f883978d28bd1b745bf98163f2",
      "all": "4037a0b578ecd3e8b13c59f9108cc2fb1aa70d721348b7b4770475e53849e8b2"
    },
    "notes": "Server reported: MongoDB MCP Server 3.1.0. Started without --readOnly. Two independent runs on 25 October and two more on 26 October gave identical hashes. No connection string was given; the tools were listed and none was called."
  },
  {
    "slug": "mongodb-mcp-server",
    "testedAt": "2026-10-26",
    "package": "mongodb-mcp-server@3.1.0 --readOnly",
    "command": "npx -y mongodb-mcp-server@3.1.0 --readOnly",
    "protocol": { "era": "legacy", "discover": "no answer within 20 s", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "aggregate-db",
      "aggregate",
      "collection-indexes",
      "collection-schema",
      "collection-storage-size",
      "connect",
      "count",
      "db-stats",
      "disconnect",
      "explain",
      "export",
      "find",
      "list-collections",
      "list-connections",
      "list-databases",
      "mongodb-logs",
      "search-knowledge",
      "list-knowledge-sources"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, no connection string, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 18
    },
    "hashes": {
      "descriptions": "772deef783babfc79c1af03abad4791d80514d42667c9bacb968332223e8d12a",
      "schemas": "d8616e9719fe82a542440de3870779cc65c0b7b27da3d6d3cc0221b260d78ab4",
      "all": "efaf6efa0bc7d70ddcb5a0b2319eb572ca1a4d5f888dd4db1de155edf4303cbc"
    },
    "notes": "Started with --readOnly. Server reported: MongoDB MCP Server 3.1.0. Two independent runs gave identical hashes. Compared with the same version started without the flag (27 tools), 9 tools are no longer listed: create-collection, create-index, delete-many, drop-collection, drop-database, drop-index, insert-many, rename-collection and update-many. Descriptions and schemas of the remaining 18 are unchanged. The tools were listed and none was called, so this shows what the server announces, not that writes are blocked."
  },
  {
    "slug": "redis-mcp-server",
    "testedAt": "2026-10-25",
    "package": "redis-mcp-server@0.5.1",
    "command": "uvx redis-mcp-server@0.5.1 --url redis://127.0.0.1:6379/0",
    "protocol": { "era": "legacy", "discover": "error -32602", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "hset",
      "hget",
      "hdel",
      "hgetall",
      "hexists",
      "set_vector_in_hash",
      "get_vector_from_hash",
      "json_set",
      "json_get",
      "json_del",
      "lpush",
      "rpush",
      "lpop",
      "rpop",
      "lrange",
      "llen",
      "lrem",
      "delete",
      "type",
      "expire",
      "rename",
      "scan_keys",
      "scan_all_keys",
      "search_redis_documents",
      "publish",
      "subscribe",
      "psubscribe",
      "read_messages",
      "unsubscribe",
      "get_indexes",
      "get_index_info",
      "get_indexed_keys_number",
      "create_vector_index_hash",
      "vector_search_hash",
      "hybrid_search",
      "dbsize",
      "info",
      "client_list",
      "sadd",
      "srem",
      "smembers",
      "zadd",
      "zrange",
      "zrem",
      "xadd",
      "xrange",
      "xdel",
      "xgroup_create",
      "xgroup_destroy",
      "xreadgroup",
      "xack",
      "set",
      "get"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker uv + Python 3.12 image on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 53
    },
    "hashes": {
      "descriptions": "60965bd8d67359b0f51755fae3cf363293d84dd0f3c9c43de9e3cdad03ab8f1c",
      "schemas": "33072f0e7b58b2fd5000661e074d1228c08cd0c4aa7063732c0b7d429aedccad",
      "all": "de671fa7675e933c86cd9cf96a859b858db4a3472404330d70eec8d285d32120"
    },
    "notes": "Server reported: Redis MCP Server 1.30.0. Two independent runs gave identical hashes. The Redis URL pointed to a server that does not exist; the tools were listed and none was called."
  },
  {
    "slug": "qdrant-mcp-server",
    "testedAt": "2026-10-25",
    "package": "mcp-server-qdrant@0.8.1",
    "command": "uvx mcp-server-qdrant@0.8.1",
    "envSet": ["QDRANT_LOCAL_PATH", "COLLECTION_NAME"],
    "protocol": { "era": "legacy", "discover": "error -32602", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "qdrant-find",
      "qdrant-store"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker uv + Python 3.12 image on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 2
    },
    "hashes": {
      "descriptions": "448fe3f2ad20b90e10833db7e18de4835042401d75f58fcf0ea54dbd0db6d406",
      "schemas": "ed8a7f23422807e772314cb1189805f70b6966d306206fd5f5a337c2b675b1ad",
      "all": "e12c7670c9627c5b1f3210842257f768f8538338b93d6bd02b83c3feb6ad176c"
    },
    "notes": "Server reported: mcp-server-qdrant 1.30.0. Two independent runs gave identical hashes. Started with a local storage path inside the container and a test collection name; the tools were listed and none was called."
  },
  {
    "slug": "motherduck-mcp-server",
    "testedAt": "2026-10-25",
    "package": "mcp-server-motherduck@1.1.0",
    "command": "uvx mcp-server-motherduck@1.1.0 --db-path :memory: --read-write",
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "execute_query",
      "list_databases",
      "list_tables",
      "list_columns"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker uv + Python 3.12 image on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 4
    },
    "hashes": {
      "descriptions": "e2c6b52d0d16e7599c8aeb467977e881ece704b72a58efd4b38283bd1ebc6be3",
      "schemas": "32357bce1216b392faf5240463b86c995cd17ca7692025885887d39c98214cf1",
      "all": "c70e5e6885c468ceb5c4f53d43961cc18f22f5e65992351e1a6aa9c90d7e0a6a"
    },
    "notes": "Server reported: mcp-server-motherduck 1.1.0. Two independent runs gave identical hashes. Started with --db-path :memory: --read-write: in an earlier attempt without --read-write the server refused to start and said in-memory databases require that flag. No MotherDuck token was given; the tools were listed and none was called."
  },
  {
    "slug": "kubernetes-mcp-server",
    "testedAt": "2026-10-25",
    "package": "kubernetes-mcp-server@0.0.69",
    "command": "npx -y kubernetes-mcp-server@0.0.69",
    "envSet": ["KUBECONFIG"],
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"] },
    "toolNames": [
      "configuration_view",
      "events_list",
      "namespaces_list",
      "nodes_log",
      "nodes_stats_summary",
      "nodes_top",
      "pods_delete",
      "pods_exec",
      "pods_get",
      "pods_list",
      "pods_list_in_namespace",
      "pods_log",
      "pods_run",
      "pods_top",
      "projects_list",
      "resources_create_or_update",
      "resources_delete",
      "resources_get",
      "resources_list",
      "resources_scale"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no credentials, synthetic data, fixed hostname, resource limits; KUBECONFIG pointing to an invented file (a cluster that does not exist and a made-up token)",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 20
    },
    "hashes": {
      "descriptions": "f0d10c2dc4b34a019ee2a2bfd41f4c3ca919bb75453def119cc37ce42b0d4709",
      "schemas": "c6c013a3dbd82261eb230a32ab3bf0aa6c372f0562d730492779e1c2988efecb",
      "all": "1221332f580b27240c4a7a7198bd1f7cc1bc049b62b2400a51edd7b49f5b4e7e"
    },
    "notes": "Server reported: kubernetes-mcp-server v0.0.69. Two independent runs gave identical hashes. With the invented kubeconfig the server answered in about 3 s and listed its tools; none was called. In an earlier attempt with no kubeconfig it did not answer within 240 s."
  },
  {
    "slug": "serena",
    "testedAt": "2026-10-28",
    "package": "serena-agent@2.1.0",
    "command": "uvx --from serena-agent==2.1.0 serena start-mcp-server",
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "activate_project",
      "initial_instructions",
      "serena_repl"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "uv python3.12 image, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 3
    },
    "hashes": {
      "descriptions": "c2e55b904a20ab0f8898f453c74eea493fde9d1da672c5283dd0e57796f9f665",
      "schemas": "eac6e203635942a03c5a151bcbd0cea279d8f6be1f1600c5bcce63b38b9d3c3e",
      "all": "93d8fb0d77fd63fdb145f2ec526dcc78d1649ad8b3f82d39e2655935e90061e2"
    },
    "notes": "Server reported: Serena 2.1.0. Two independent runs gave identical hashes. Started with no project active, so the list may grow once a project is activated (not tested). The tools were listed and none was called."
  },
  {
    "slug": "blender-mcp",
    "testedAt": "2026-10-28",
    "package": "mcp-for-blender@2.2.4 (BLENDER_MCP_SAFE_MODE=1)",
    "command": "uvx mcp-for-blender@2.2.4",
    "envSet": [
      "BLENDER_MCP_SAFE_MODE",
      "DISABLE_TELEMETRY"
    ],
    "protocol": { "era": "legacy", "discover": "error -32602", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "get_addon_status",
      "disable_telemetry",
      "get_scene_info",
      "execute_blender_code",
      "record_trajectory_feedback",
      "look",
      "generate_3d",
      "search_assets",
      "import_asset"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "uv python3.12 image, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 9
    },
    "hashes": {
      "descriptions": "117eac15f080c8e4902baf0d05308288ca59b452cb8fd362cf03174fc8be81d2",
      "schemas": "6b6d388e82932e19db52b5bc4d7c404fd07fbeedac69067a8c8f920bb6e43ae7",
      "all": "573132035ee2e44b4efd4a644229ce1420c77077cca548865eaf7f01547fff5c"
    },
    "notes": "Server reported: MCP for Blender 1.30.0. Two independent runs gave identical hashes. Started without Blender running. The tool list was identical with and without BLENDER_MCP_SAFE_MODE=1 (same hashes), so the setting does not show in what the server announces. The tools were listed and none was called."
  },
  {
    "slug": "blender-mcp",
    "testedAt": "2026-10-28",
    "package": "mcp-for-blender@2.2.4",
    "command": "uvx mcp-for-blender@2.2.4",
    "envSet": [
      "DISABLE_TELEMETRY"
    ],
    "protocol": { "era": "legacy", "discover": "error -32602", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "get_addon_status",
      "disable_telemetry",
      "get_scene_info",
      "execute_blender_code",
      "record_trajectory_feedback",
      "look",
      "generate_3d",
      "search_assets",
      "import_asset"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "uv python3.12 image, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 9
    },
    "hashes": {
      "descriptions": "117eac15f080c8e4902baf0d05308288ca59b452cb8fd362cf03174fc8be81d2",
      "schemas": "6b6d388e82932e19db52b5bc4d7c404fd07fbeedac69067a8c8f920bb6e43ae7",
      "all": "573132035ee2e44b4efd4a644229ce1420c77077cca548865eaf7f01547fff5c"
    },
    "notes": "Server reported: MCP for Blender 1.30.0. Two independent runs gave identical hashes. Started without Blender running and without BLENDER_MCP_SAFE_MODE. Identical tool list to the run with it. The tools were listed and none was called."
  },
  {
    "slug": "grafana-mcp-server",
    "testedAt": "2026-10-28",
    "package": "mcp-grafana@2.1.1 --disable-write",
    "command": "uvx mcp-grafana@2.1.1 --disable-write",
    "envSet": [
      "GRAFANA_URL",
      "GRAFANA_SERVICE_ACCOUNT_TOKEN"
    ],
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"] },
    "toolNames": [
      "alerting_manage_routing",
      "alerting_rules_read",
      "alerting_silences_read",
      "analyze_loki_labels",
      "check_datasources_health",
      "diff_tempo_traces",
      "generate_deeplink",
      "get_alert_group",
      "get_annotation_tags",
      "get_annotations",
      "get_assertions",
      "get_current_oncall_users",
      "get_dashboard_by_uid",
      "get_dashboard_panel_queries",
      "get_dashboard_property",
      "get_dashboard_summary",
      "get_datasource",
      "get_doc",
      "get_incident",
      "get_oncall_shift",
      "get_panel_image",
      "get_plugin",
      "get_snapshot",
      "get_tempo_trace",
      "get_tempo_traceql_docs",
      "grafana_api_request",
      "list_alert_groups",
      "list_dashboard_versions",
      "list_datasources",
      "list_incident_custom_fields",
      "list_incidents",
      "list_loki_label_names",
      "list_loki_label_values",
      "list_oncall_schedules",
      "list_oncall_teams",
      "list_oncall_users",
      "list_prometheus_label_names",
      "list_prometheus_label_values",
      "list_prometheus_metric_metadata",
      "list_prometheus_metric_names",
      "list_provisioning_repositories",
      "list_pyroscope_label_names",
      "list_pyroscope_label_values",
      "list_pyroscope_profile_types",
      "list_snapshots",
      "list_tempo_attribute_names",
      "list_tempo_attribute_values",
      "query_loki_logs",
      "query_loki_patterns",
      "query_loki_stats",
      "query_prometheus",
      "query_prometheus_histogram",
      "query_pyroscope",
      "query_tempo_metrics",
      "search_dashboards",
      "search_docs",
      "search_folders",
      "search_plugin_information",
      "search_tempo_traces",
      "suggest_loki_alloy_label_config",
      "user_info",
      "validate_provisioning_file"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "uv python3.12 image, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 62
    },
    "hashes": {
      "descriptions": "5582cadcd971708237fd50b10fe12199d775c930d8d6c7b66b2c7c74760e1b3e",
      "schemas": "63d24951095a7cdf4ec7797bb9507a3270542de62e0b05c31d836babccdbb82d",
      "all": "01511c6d60aaf90f8ad989cc3a9f3d84ce3999300fa35f9c10b857a261801571"
    },
    "notes": "Server reported: mcp-grafana v2.1.1. Two independent runs gave identical hashes. Started with --disable-write and a filler service account token; no Grafana was running. 62 tools; 17 fewer than without the flag, all with names that create, update or delete. The list still contains grafana_api_request; we did not test what it can do under --disable-write. The tools were listed and none was called."
  },
  {
    "slug": "grafana-mcp-server",
    "testedAt": "2026-10-28",
    "package": "mcp-grafana@2.1.1",
    "command": "uvx mcp-grafana@2.1.1",
    "envSet": [
      "GRAFANA_URL",
      "GRAFANA_SERVICE_ACCOUNT_TOKEN"
    ],
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"] },
    "toolNames": [
      "add_activity_to_incident",
      "alerting_manage_routing",
      "alerting_routing_write",
      "alerting_rules_read",
      "alerting_rules_write",
      "alerting_silences_read",
      "alerting_silences_write",
      "analyze_loki_labels",
      "check_datasources_health",
      "create_annotation",
      "create_datasource",
      "create_folder",
      "create_incident",
      "create_snapshot",
      "delete_annotation",
      "delete_snapshot",
      "diff_tempo_traces",
      "generate_deeplink",
      "get_alert_group",
      "get_annotation_tags",
      "get_annotations",
      "get_assertions",
      "get_current_oncall_users",
      "get_dashboard_by_uid",
      "get_dashboard_panel_queries",
      "get_dashboard_property",
      "get_dashboard_summary",
      "get_datasource",
      "get_doc",
      "get_incident",
      "get_oncall_shift",
      "get_panel_image",
      "get_plugin",
      "get_snapshot",
      "get_tempo_trace",
      "get_tempo_traceql_docs",
      "grafana_api_request",
      "install_plugin",
      "list_alert_groups",
      "list_dashboard_versions",
      "list_datasources",
      "list_incident_custom_fields",
      "list_incidents",
      "list_loki_label_names",
      "list_loki_label_values",
      "list_oncall_schedules",
      "list_oncall_teams",
      "list_oncall_users",
      "list_prometheus_label_names",
      "list_prometheus_label_values",
      "list_prometheus_metric_metadata",
      "list_prometheus_metric_names",
      "list_provisioning_repositories",
      "list_pyroscope_label_names",
      "list_pyroscope_label_values",
      "list_pyroscope_profile_types",
      "list_snapshots",
      "list_tempo_attribute_names",
      "list_tempo_attribute_values",
      "query_loki_logs",
      "query_loki_patterns",
      "query_loki_stats",
      "query_prometheus",
      "query_prometheus_histogram",
      "query_pyroscope",
      "query_tempo_metrics",
      "search_dashboards",
      "search_docs",
      "search_folders",
      "search_plugin_information",
      "search_tempo_traces",
      "suggest_loki_alloy_label_config",
      "update_alert_group",
      "update_annotation",
      "update_dashboard",
      "update_datasource",
      "update_incident",
      "user_info",
      "validate_provisioning_file"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "uv python3.12 image, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 79
    },
    "hashes": {
      "descriptions": "ff80a05035a4533c2aabe875c575cb81a870322b8e5cffe0425f8ba4d33711a8",
      "schemas": "bad3eac8232c99b3ccf022a4432a19c21ec09eac6979341c1af94eb6c1ebe31e",
      "all": "e354103ae2a2722be8eed9663f267b72105e156739b1b952f0f8af8983a07f22"
    },
    "notes": "Server reported: mcp-grafana v2.1.1. Two independent runs gave identical hashes. Started without --disable-write and with a filler token; no Grafana was running. 79 tools, 17 more than with --disable-write (names that create, update or delete). The tools were listed and none was called."
  },
  {
    "slug": "clickhouse-mcp-server",
    "testedAt": "2026-10-28",
    "package": "mcp-clickhouse@0.7.0 (CLICKHOUSE_ALLOW_WRITE_ACCESS=false)",
    "command": "uvx mcp-clickhouse@0.7.0",
    "envSet": [
      "CLICKHOUSE_HOST",
      "CLICKHOUSE_USER",
      "CLICKHOUSE_PASSWORD",
      "CLICKHOUSE_ALLOW_WRITE_ACCESS"
    ],
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "list_databases",
      "list_tables",
      "run_query"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "uv python3.12 image, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 3
    },
    "hashes": {
      "descriptions": "e72221b87b44151a6dcab29f3caf1bf9a2829e68c6fa25c53f1226984f11a839",
      "schemas": "0777e156732b9d1d282bbc6953ab164f00aba6ca614aee275b56fa557250611f",
      "all": "9f80c06c5d61f129e2e34f010ed96472834bf17ab948d757b2fb7dd8aa22f9cd"
    },
    "notes": "Server reported: mcp-clickhouse 0.7.0. Two independent runs gave identical hashes. Started with filler connection values and no ClickHouse server running. The tool list was identical with CLICKHOUSE_ALLOW_WRITE_ACCESS set to true (same hashes), so the setting does not show in what the server announces. Its start-up log shows a request to pypi.org. The tools were listed and none was called."
  },
  {
    "slug": "clickhouse-mcp-server",
    "testedAt": "2026-10-28",
    "package": "mcp-clickhouse@0.7.0 (CLICKHOUSE_ALLOW_WRITE_ACCESS=true)",
    "command": "uvx mcp-clickhouse@0.7.0",
    "envSet": [
      "CLICKHOUSE_HOST",
      "CLICKHOUSE_USER",
      "CLICKHOUSE_PASSWORD",
      "CLICKHOUSE_ALLOW_WRITE_ACCESS"
    ],
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2026-07-28"] },
    "toolNames": [
      "list_databases",
      "list_tables",
      "run_query"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "uv python3.12 image, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 3
    },
    "hashes": {
      "descriptions": "e72221b87b44151a6dcab29f3caf1bf9a2829e68c6fa25c53f1226984f11a839",
      "schemas": "0777e156732b9d1d282bbc6953ab164f00aba6ca614aee275b56fa557250611f",
      "all": "9f80c06c5d61f129e2e34f010ed96472834bf17ab948d757b2fb7dd8aa22f9cd"
    },
    "notes": "Server reported: mcp-clickhouse 0.7.0. Two independent runs gave identical hashes. Started with filler connection values and no ClickHouse server running. Identical tool list to the run with the setting at false. The tools were listed and none was called."
  },
  {
    "slug": "mcp-toolbox-for-databases",
    "testedAt": "2026-10-28",
    "package": "@toolbox-sdk/server@1.15.0 --prebuilt=sqlite",
    "command": "npx -y @toolbox-sdk/server@1.15.0 --prebuilt=sqlite --stdio",
    "envSet": [
      "SQLITE_DATABASE"
    ],
    "protocol": { "era": "modern", "discover": "result", "versionAnswered": "2026-07-28", "checkedAt": "2026-10-29", "supportedVersions": ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25", "2026-07-28"] },
    "toolNames": [
      "execute_sql",
      "list_tables"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "node:22-slim, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 2
    },
    "hashes": {
      "descriptions": "a65fa0852629b5c5e32e954605d0638283254b7ff26f444ae56c16d6d2363826",
      "schemas": "b00003a7851118c872d435bf4274f6ad0647e1fff17e6153759ef01846300a9f",
      "all": "116e1edf37a48dfa7633c9537ed9a0801b6109b15d8b196485da4c20d9482d72"
    },
    "notes": "Server reported: Toolbox 1.15.0+binary.linux.amd64.8e8e569+prebuilt.sqlite. Two independent runs gave identical hashes. Started with the prebuilt sqlite configuration over stdio and a filler database path. Other prebuilt sources were not tried. The tools were listed and none was called."
  },
  {
    "slug": "talk-to-figma-mcp",
    "testedAt": "2026-10-28",
    "package": "cursor-talk-to-figma-mcp@0.3.5",
    "command": "bunx cursor-talk-to-figma-mcp@0.3.5",
    "protocol": { "era": "legacy", "discover": "error -32601", "versionAnswered": "2025-03-26", "checkedAt": "2026-10-29" },
    "toolNames": [
      "get_document_info",
      "get_selection",
      "read_my_design",
      "get_node_info",
      "get_nodes_info",
      "create_rectangle",
      "create_frame",
      "create_text",
      "set_fill_color",
      "set_stroke_color",
      "move_node",
      "clone_node",
      "resize_node",
      "delete_node",
      "delete_multiple_nodes",
      "export_node_as_image",
      "set_text_content",
      "get_styles",
      "get_local_components",
      "get_annotations",
      "set_annotation",
      "set_multiple_annotations",
      "create_component_instance",
      "get_instance_overrides",
      "set_instance_overrides",
      "set_corner_radius",
      "scan_text_nodes",
      "scan_nodes_by_types",
      "set_multiple_text_contents",
      "set_layout_mode",
      "set_padding",
      "set_axis_align",
      "set_layout_sizing",
      "set_item_spacing",
      "get_reactions",
      "set_default_connector",
      "create_connections",
      "set_focus",
      "set_selections",
      "join_channel"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "node:22-slim + bun, Docker on Windows, no real credentials, filler values for any setting that needs one, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 40
    },
    "hashes": {
      "descriptions": "20b5e5973fd3b39a8f592945cc55d7bf1abf5c5658fd7dcebe502d43a7196928",
      "schemas": "ca5191013b0ab70c3a82269df371a42226fbe91592d8c5988e8cae6f2ff36b6a",
      "all": "729eb8ad958afc6724c15130ab33b6d70092a658bf29d1b44ed67f778592207f"
    },
    "notes": "Server reported: TalkToFigmaMCP 1.0.0. Two independent runs gave identical hashes. Needs Bun. Started without the Figma WebSocket server: it kept retrying ws://localhost:3055 and still listed 40 tools. The tools were listed and none was called."
  },
  {
    "slug": "mcp-reference-servers",
    "testedAt": "2026-10-29",
    "package": "@modelcontextprotocol/server-everything@2.0.0 (protocol 2026-07-28)",
    "command": "npx -y @modelcontextprotocol/server-everything@2.0.0",
    "protocol": {
      "era": "modern",
      "discover": "result",
      "versionAnswered": "2026-07-28",
      "checkedAt": "2026-10-29",
      "supportedVersions": [
        "2026-07-28"
      ]
    },
    "toolNames": [
      "echo",
      "get-annotated-message",
      "get-env",
      "get-header-params",
      "get-resource-links",
      "get-resource-reference",
      "get-structured-content",
      "get-sum",
      "get-tiny-image",
      "gzip-file-as-resource",
      "trigger-list-changed",
      "trigger-log-messages",
      "trigger-long-running-operation",
      "trigger-resource-update",
      "get-roots-list",
      "trigger-elicitation-request",
      "trigger-multi-step-elicitation",
      "trigger-url-elicitation",
      "trigger-sampling-request",
      "simulate-research-query",
      "trigger-sampling-request-async",
      "trigger-elicitation-request-async"
    ],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (server/discover, initialize if needed, tools/list)",
    "os": "Linux 6.18.54.1-microsoft-standard-WSL2 x64",
    "environment": "Docker node:22-slim on Windows (WSL2), no real credentials, fixed hostname, resource limits",
    "install": "pass",
    "handshake": "pass",
    "toolsList": {
      "status": "pass",
      "count": 22
    },
    "hashes": {
      "descriptions": "00dce439b058df456b6408f26d16c4d7b9ecfcd3c12c857914e60ee792736d05",
      "schemas": "99559498024342b71e9d0c70f15987445b1fea79fdf38ceaebf22ef7296158f1",
      "all": "c2538eb571def953eb09d4914a9d67a49629763aa9bb32aa510e0ce906347bd3"
    },
    "notes": "Same version as the other server-everything record, but asked the new way: server/discover and per-request metadata (revision 2026-07-28). It lists 22 tools instead of 16: 8 added (get-roots-list, simulate-research-query, trigger-elicitation-request, trigger-elicitation-request-async, trigger-multi-step-elicitation, trigger-sampling-request, trigger-sampling-request-async, trigger-url-elicitation) and 2 left out (toggle-simulated-logging, toggle-subscriber-updates). One run. The tools were listed and none was called."
  }
];
export const testsFor = (slug: string): ProbeRecord[] => TESTS.filter((t) => t.slug === slug).sort((a, b) => b.testedAt.localeCompare(a.testedAt));
