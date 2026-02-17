// Server-side only — uses Node.js fs/path.
// Do not import this in client components.

import fs from "node:fs";
import path from "node:path";

export type InputFieldType = "text" | "number" | "date" | "textarea";

export interface RequiredInput {
  key: string;
  label: string;
  type: InputFieldType;
  placeholder?: string;
}

export interface ModuleDefinition {
  id: string;
  label: string;
  description?: string;
  required_inputs: RequiredInput[];
  prompt_template: string;
  output_schema: Record<string, unknown>;
}

function loadAllModules(): ModuleDefinition[] {
  const modulesDir = path.join(process.cwd(), "config", "modules");
  let files: string[];
  try {
    files = fs.readdirSync(modulesDir).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(modulesDir, file), "utf-8");
    return JSON.parse(raw) as ModuleDefinition;
  });
}

/**
 * Returns all module definitions loaded from /config/modules/*.json.
 * Returns an empty array if no files exist.
 */
export function listModules(): ModuleDefinition[] {
  return loadAllModules();
}

/**
 * Finds a module definition by its `id` field.
 * Returns undefined if no matching module is found.
 */
export function getModuleById(moduleId: string): ModuleDefinition | undefined {
  return loadAllModules().find((m) => m.id === moduleId);
}
