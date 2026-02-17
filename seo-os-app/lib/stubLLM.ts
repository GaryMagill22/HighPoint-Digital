// Server-side only — stub LLM output generator.
// Walks output_schema.properties and returns typed placeholder values.

import type { ModuleDefinition } from "./configLoader";

function stubValueForType(type: string | undefined): unknown {
  switch (type) {
    case "string":
      return "[stub string]";
    case "number":
      return 0;
    case "array":
      return ["[stub item]"];
    case "object":
      return { stub: true };
    default:
      return null;
  }
}

/**
 * Generates a stub output object shaped to match the module's output_schema.
 * Used to simulate an LLM call without a real API.
 */
export function generateStubOutput(
  module: ModuleDefinition,
  inputs: Record<string, string>,
  clientProfile: unknown
): Record<string, unknown> {
  const schema = module.output_schema as {
    properties?: Record<string, { type?: string }>;
  };

  const result: Record<string, unknown> = {
    _stub: true,
    _moduleId: module.id,
    _inputs: inputs,
    _clientProfile: typeof clientProfile === "object" && clientProfile !== null
      ? "[profile injected]"
      : null,
  };

  if (schema.properties) {
    for (const [key, def] of Object.entries(schema.properties)) {
      result[key] = stubValueForType(def.type);
    }
  }

  return result;
}
