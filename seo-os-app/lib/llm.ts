// Server-side only — Claude API integration.
// Do not import this in client components.

import { getAnthropicClient } from "./anthropic";
import type { ModuleDefinition } from "./configLoader";

const SYSTEM_PROMPT = `Return ONLY valid JSON. No markdown. No prose.
If you cannot comply, return a JSON object with {"error": "<reason>"}.`;

interface RunClaudeModuleOptions {
  module: ModuleDefinition;
  inputs: Record<string, string>;
  clientProfile: unknown;
}

/**
 * Calls the Claude API to execute a module, injecting the client profile and
 * user-supplied inputs into the module's prompt_template.
 *
 * Returns a parsed JSON object shaped to match module.output_schema.
 * Throws on API failure or if the response cannot be parsed as JSON.
 */
export async function runClaudeModule({
  module,
  inputs,
  clientProfile,
}: RunClaudeModuleOptions): Promise<Record<string, unknown>> {
  const userContent = [
    `Module: ${module.id}`,
    ``,
    `Prompt:`,
    module.prompt_template,
    ``,
    `Client Profile:`,
    JSON.stringify(clientProfile, null, 2),
    ``,
    `Inputs:`,
    JSON.stringify(inputs, null, 2),
    ``,
    `Output Schema:`,
    JSON.stringify(module.output_schema, null, 2),
  ].join("\n");

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: module.max_tokens ?? 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude API response.");
  }

  // Primary attempt: parse the full response as JSON
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(textBlock.text) as Record<string, unknown>;
  } catch {
    // Fallback: extract the first {...} block and parse that
    const match = textBlock.text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(
        `Claude did not return valid JSON. Preview: ${textBlock.text.slice(0, 200)}`
      );
    }
    parsed = JSON.parse(match[0]) as Record<string, unknown>;
  }

  return parsed;
}
