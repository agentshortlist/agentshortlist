// Capacidades deducidas SOLO de los nombres de herramientas que devolvió tools/list en nuestras pruebas.
// Dicen qué tipo de herramientas expone un servidor, no lo que hacen por dentro ni si están limitadas.
// Una herramienta puede entrar en varias categorías. Sin nombres medidos no se muestra nada.
export type CapabilityId = "shell" | "code-exec" | "filesystem-write" | "filesystem-read" | "network" | "browser" | "git-write" | "git-read" | "env" | "config" | "data-write";

export type Capability = { id: CapabilityId; label: string; level: "high" | "medium" | "low"; meaning: string };

export const CAPABILITIES: Capability[] = [
  { id: "shell", label: "Runs commands", level: "high", meaning: "Tools to start, talk to or stop processes on the machine." },
  { id: "code-exec", label: "Runs code", level: "high", meaning: "Tools that evaluate code, in a page or in the server." },
  { id: "filesystem-write", label: "Writes files", level: "medium", meaning: "Tools to create, edit, move or export files and folders." },
  { id: "filesystem-read", label: "Reads files", level: "medium", meaning: "Tools to read, list, search or upload local files." },
  { id: "network", label: "Reaches the network", level: "medium", meaning: "Tools that fetch URLs or open pages." },
  { id: "browser", label: "Drives a browser", level: "medium", meaning: "Tools that click, type, inspect or capture pages." },
  { id: "git-write", label: "Changes git history", level: "medium", meaning: "Tools that stage, commit, switch branches or reset." },
  { id: "git-read", label: "Reads git", level: "low", meaning: "Tools that show status, diffs or logs." },
  { id: "env", label: "Reads environment variables", level: "medium", meaning: "Tools whose name says they return environment variables." },
  { id: "config", label: "Reads or changes its own config", level: "low", meaning: "Tools to read or set the server's settings." },
  { id: "data-write", label: "Changes stored data", level: "low", meaning: "Tools whose names start with create, delete, add, set, insert or similar." },
];

const R: Record<CapabilityId, (n: string) => boolean> = {
  shell: (n) => /^(start_process|interact_with_process|kill_process|force_terminate|list_processes|read_process_output|list_sessions)$/.test(n),
  "code-exec": (n) => /(^|_)(evaluate|evaluate_script|run_code(_unsafe)?)$/.test(n) || n === "browser_evaluate",
  "filesystem-write": (n) => /^(write_file|edit_block|create_directory|move_file|write_pdf|export_csv|export_workbook|write_range|create_workbook)$/.test(n),
  "filesystem-read": (n) => /^(read_file|read_multiple_files|list_directory|get_file_info|start_search|upload_file|browser_file_upload|import_csv|import_workbook|list_workbooks|read_vba)$/.test(n) || n === "gzip-file-as-resource",
  network: (n) => /^(fetch|browser_navigate|navigate_page|new_page)$/.test(n),
  browser: (n) => /^browser_/.test(n) || /^(click|hover|drag|fill|fill_form|type_text|press_key|emulate|handle_dialog|wait_for|take_screenshot|take_snapshot|take_heapsnapshot|select_page|new_page|navigate_page|resize_page|close_page|list_pages|lighthouse_audit|get_css_styles)$/.test(n) || /^(performance_|screencast_)/.test(n) || /^(get|list)_(console|network)/.test(n),
  "git-write": (n) => /^git_(add|commit|checkout|create_branch|reset)$/.test(n),
  "git-read": (n) => /^git_(status|diff|diff_staged|diff_unstaged|log|show|branch)$/.test(n),
  env: (n) => /^get[-_]env$/.test(n),
  config: (n) => /^(get_config|set_config_value|set_workbook_settings)$/.test(n),
  "data-write": (n) => /^(create|delete|add|set|insert|write|replace|clear|merge|rename|copy|sort|transform|import|format)_/.test(n),
};

export type CapabilityHit = Capability & { tools: string[] };

export function capabilitiesFromTools(names: string[] | undefined): CapabilityHit[] {
  if (!names?.length) return [];
  const order = { high: 0, medium: 1, low: 2 } as const;
  return CAPABILITIES.map((c) => ({ ...c, tools: names.filter(R[c.id]) }))
    .filter((c) => c.tools.length > 0)
    .sort((a, b) => order[a.level] - order[b.level]);
}
