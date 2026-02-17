// Server-side only — Anthropic client factory.
// Do not import this in client components.

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | undefined;

/**
 * Returns a singleton Anthropic client.
 * Throws a clear error if ANTHROPIC_API_KEY is not set in the environment.
 * The check is deferred to first call so missing keys don't crash the server at startup.
 */
export function getAnthropicClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to seo-os-app/.env."
      );
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}
