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
    "toolNames": ["browser_click", "browser_close", "browser_console_messages", "browser_drag", "browser_drop", "browser_emulate_media", "browser_evaluate", "browser_file_upload", "browser_fill_form", "browser_find", "browser_handle_dialog", "browser_hover", "browser_navigate", "browser_navigate_back", "browser_network_request", "browser_network_requests", "browser_press_key", "browser_resize", "browser_run_code_unsafe", "browser_select_option", "browser_snapshot", "browser_tabs", "browser_take_screenshot", "browser_type", "browser_wait_for"],
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
    "toolNames": ["click", "close_page", "drag", "emulate", "evaluate_script", "fill", "fill_form", "get_console_message", "get_css_styles", "get_network_request", "handle_dialog", "hover", "lighthouse_audit", "list_console_messages", "list_network_requests", "list_pages", "navigate_page", "new_page", "performance_analyze_insight", "performance_start_trace", "performance_stop_trace", "press_key", "resize_page", "screencast_start", "screencast_stop", "select_page", "take_heapsnapshot", "take_screenshot", "take_snapshot", "type_text", "upload_file", "wait_for"],
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
    "toolNames": ["check_index_coverage", "compare_graphs", "delete_project", "detect_changes", "get_architecture", "get_code_snippet", "get_file_outline", "get_graph_schema", "index_repository", "index_status", "ingest_traces", "list_projects", "manage_adr", "query_graph", "search_code", "search_graph", "trace_path"],
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
    "toolNames": ["query-docs", "resolve-library-id"],
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
    "toolNames": ["create_directory", "edit_block", "force_terminate", "get_config", "get_file_info", "get_more_search_results", "get_recent_tool_calls", "get_usage_stats", "give_feedback_to_desktop_commander", "interact_with_process", "kill_process", "list_directory", "list_processes", "list_searches", "list_sessions", "move_file", "read_file", "read_multiple_files", "read_process_output", "set_config_value", "start_process", "start_search", "stop_search", "write_file", "write_pdf"],
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
    "toolNames": ["add_conditional_format", "add_data_validation", "add_slicer", "add_sparklines", "clear_range", "copy_range", "copy_sheet", "create_chart", "create_pivot_table", "create_sheet", "create_workbook", "delete_chart", "delete_defined_name", "delete_image", "delete_note", "delete_pivot_table", "delete_rows_or_columns", "delete_sheet", "delete_slicer", "delete_sparklines", "describe_sheet", "describe_workbook", "export_csv", "export_workbook", "find_cells", "format_range", "goal_seek", "import_csv", "import_workbook", "insert_image", "insert_rows_or_columns", "list_workbooks", "merge_cells", "read_range", "read_vba", "rename_sheet", "replace_cells", "set_defined_name", "set_note", "set_sheet_layout", "set_table", "set_workbook_settings", "sort_range", "trace_formula", "transform_range", "write_range"],
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
    "toolNames": ["add_observations", "create_entities", "create_relations", "delete_entities", "delete_observations", "delete_relations", "open_nodes", "read_graph", "search_nodes"],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
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
    "notes": "Server reported: memory-server 2.0.0. One run."
  },
  {
    "slug": "mcp-reference-servers",
    "testedAt": "2026-10-25",
    "package": "@modelcontextprotocol/server-everything@2.0.0",
    "toolNames": ["echo", "get-annotated-message", "get-env", "get-header-params", "get-resource-links", "get-resource-reference", "get-structured-content", "get-sum", "get-tiny-image", "gzip-file-as-resource", "toggle-simulated-logging", "toggle-subscriber-updates", "trigger-list-changed", "trigger-log-messages", "trigger-long-running-operation", "trigger-resource-update"],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
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
    "notes": "Server reported: mcp-servers/everything 2.0.0. One run."
  },
  {
    "slug": "mcp-reference-servers",
    "testedAt": "2026-10-25",
    "package": "mcp-server-fetch@2026.10.19",
    "toolNames": ["fetch"],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
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
    "notes": "Server reported: mcp-fetch 2026.10.19. One run."
  },
  {
    "slug": "mcp-reference-servers",
    "testedAt": "2026-10-25",
    "package": "mcp-server-git@2026.10.19",
    "toolNames": ["git_add", "git_branch", "git_checkout", "git_commit", "git_create_branch", "git_diff", "git_diff_staged", "git_diff_unstaged", "git_log", "git_reset", "git_show", "git_status"],
    "client": "mcp-probe",
    "clientVersion": "scripts/mcp-probe.mjs (initialize + tools/list)",
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
    "notes": "Server reported: mcp-git 2026.10.19. One run. A first attempt without the git binary in the container did not start; the server needs git installed."
  }
];

export const testsFor = (slug: string): ProbeRecord[] => TESTS.filter((t) => t.slug === slug).sort((a, b) => b.testedAt.localeCompare(a.testedAt));
