// Server-side only — uses csv-parse (Node.js).
// Do not import this in client components.

import { parse } from "csv-parse/sync";

export interface AuditPage {
  url: string;
  statusCode: number | null;
  indexability: string | null;
  title: string | null;
  titleLength: number | null;
  metaDescription: string | null;
  metaDescriptionLength: number | null;
  h1: string | null;
  canonical: string | null;
  wordCount: number | null;
}

export interface AuditInput {
  pages: AuditPage[];
  summary: {
    totalPages: number;
    indexable: number;
    nonIndexable: number;
    with4xx: number;
    with5xx: number;
    missingTitle: number;
    missingMeta: number;
  };
}

/** Case-insensitive, trimmed column lookup. Returns null if not found or empty. */
function col(
  lowerRow: Record<string, string>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const val = lowerRow[key.toLowerCase()];
    if (val !== undefined && val !== "") return val;
  }
  return null;
}

function toInt(v: string | null): number | null {
  if (v === null) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

/**
 * Parses one or more Screaming Frog CSV export strings into a normalised AuditInput.
 * Pages are deduplicated by URL (last-seen wins when multiple CSVs overlap).
 */
export function parseScreamingFrogCsvs(contents: string[]): AuditInput {
  const byUrl = new Map<string, AuditPage>();

  for (const content of contents) {
    const rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
    }) as Record<string, string>[];

    for (const row of rows) {
      // Normalise all header keys once per row
      const lowerRow: Record<string, string> = {};
      for (const k of Object.keys(row)) {
        lowerRow[k.toLowerCase().trim()] = row[k];
      }

      const url = col(lowerRow, "address", "url");
      if (!url) continue;

      const page: AuditPage = {
        url,
        statusCode: toInt(col(lowerRow, "status code")),
        indexability: col(lowerRow, "indexability"),
        title: col(lowerRow, "title 1"),
        titleLength: toInt(col(lowerRow, "title 1 length")),
        metaDescription: col(lowerRow, "meta description 1"),
        metaDescriptionLength: toInt(col(lowerRow, "meta description 1 length")),
        h1: col(lowerRow, "h1-1"),
        canonical: col(lowerRow, "canonical link element 1"),
        wordCount: toInt(col(lowerRow, "word count")),
      };

      byUrl.set(url, page);
    }
  }

  const pages = Array.from(byUrl.values());
  const summary = {
    totalPages: pages.length,
    indexable: pages.filter(
      (p) => p.indexability?.toLowerCase() === "indexable"
    ).length,
    nonIndexable: pages.filter(
      (p) =>
        p.indexability !== null &&
        p.indexability?.toLowerCase() !== "indexable"
    ).length,
    with4xx: pages.filter(
      (p) => p.statusCode !== null && p.statusCode >= 400 && p.statusCode < 500
    ).length,
    with5xx: pages.filter(
      (p) => p.statusCode !== null && p.statusCode >= 500
    ).length,
    missingTitle: pages.filter((p) => !p.title).length,
    missingMeta: pages.filter((p) => !p.metaDescription).length,
  };

  return { pages, summary };
}
