"use server";

import { prisma } from "@/lib/prisma";
import { parseScreamingFrogCsvs } from "@/lib/screamingFrog/parse";

export async function uploadCrawl(formData: FormData): Promise<{
  crawlUploadId: string;
  summary: {
    totalPages: number;
    indexable: number;
    nonIndexable: number;
    with4xx: number;
    with5xx: number;
    missingTitle: number;
    missingMeta: number;
  };
}> {
  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || !clientId) {
    throw new Error("clientId is required");
  }

  const files = formData.getAll("crawlFiles") as File[];
  if (files.length === 0) {
    throw new Error("At least one CSV file is required");
  }

  const contents = await Promise.all(files.map((f) => f.text()));
  const filesMeta = files.map((f) => ({ name: f.name, size: f.size }));

  const auditInput = parseScreamingFrogCsvs(contents);

  // JSON round-trip ensures values satisfy Prisma's InputJsonValue constraint
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const safeData = JSON.parse(JSON.stringify(auditInput));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const safeMeta = JSON.parse(JSON.stringify(filesMeta));

  const record = await prisma.crawlUpload.create({
    data: {
      clientId,
      source: "screaming-frog",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      filesMeta: safeMeta,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      parsedData: safeData,
    },
  });

  return { crawlUploadId: record.id, summary: auditInput.summary };
}
