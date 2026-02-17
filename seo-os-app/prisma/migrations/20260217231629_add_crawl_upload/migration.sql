-- CreateTable
CREATE TABLE "CrawlUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "filesMeta" JSONB NOT NULL,
    "parsedData" JSONB NOT NULL,
    CONSTRAINT "CrawlUpload_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
