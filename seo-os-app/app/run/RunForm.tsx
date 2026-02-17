"use client";

import { useTransition, useState } from "react";
import type { RequiredInput } from "@/lib/configLoader";
import { runModule } from "./actions";
import { uploadCrawl } from "./uploadActions";

interface ClientOption {
  id: string;
  name: string;
}

interface ModuleOption {
  id: string;
  label: string;
  required_inputs: RequiredInput[];
}

interface RunFormProps {
  clients: ClientOption[];
  modules: ModuleOption[];
}

export function RunForm({ clients, modules }: RunFormProps) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [output, setOutput] = useState<unknown>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Crawl upload state (site-audit only)
  const [crawlUploadId, setCrawlUploadId] = useState<string | null>(null);
  const [crawlSummary, setCrawlSummary] = useState<{
    totalPages: number;
    statusCodeCounts: Record<string, number>;
    indexabilityCounts: Record<string, number>;
    missingTitleCount: number;
    missingMetaDescriptionCount: number;
    missingH1Count: number;
    non200Count: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedModule =
    modules.find((m) => m.id === selectedModuleId) ?? null;

  function handleModuleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedModuleId(e.target.value);
    setCrawlUploadId(null);
    setCrawlSummary(null);
    setUploadError(null);
  }

  async function handleCrawlUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fd = new FormData();
    fd.append("clientId", selectedClientId);
    for (const f of Array.from(files)) fd.append("crawlFiles", f);
    setIsUploading(true);
    setUploadError(null);
    setCrawlUploadId(null);
    setCrawlSummary(null);
    try {
      const result = await uploadCrawl(fd);
      setCrawlUploadId(result.crawlUploadId);
      setCrawlSummary(result.summary);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOutput(null);
    setRunError(null);
    setRunId(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await runModule(formData);
      if (result.success) {
        setOutput(result.outputs);
        setRunId(result.runId ?? null);
      } else {
        setRunError(result.error ?? "Run failed.");
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="clientId">Client</label>
          <br />
          <select
            id="clientId"
            name="clientId"
            required
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">— select a client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="moduleId">Module</label>
          <br />
          <select
            id="moduleId"
            name="moduleId"
            required
            value={selectedModuleId}
            onChange={handleModuleChange}
          >
            <option value="">— select a module —</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {selectedModule && selectedModule.required_inputs.length > 0 && (
          <fieldset>
            <legend>Inputs</legend>
            {selectedModule.required_inputs.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                <br />
                {field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    name={field.key}
                    placeholder={field.placeholder ?? ""}
                    rows={4}
                    cols={60}
                  />
                ) : (
                  <input
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    placeholder={field.placeholder ?? ""}
                  />
                )}
              </div>
            ))}
          </fieldset>
        )}

        {selectedModuleId === "site-audit" && (
          <fieldset>
            <legend>Screaming Frog Crawl Data</legend>
            <div>
              <label htmlFor="crawlFiles">Upload CSV export(s)</label>
              <br />
              <input
                id="crawlFiles"
                type="file"
                accept=".csv"
                multiple
                onChange={handleCrawlUpload}
                disabled={isUploading || !selectedClientId}
              />
            </div>
            {isUploading && <p>Uploading...</p>}
            {uploadError && (
              <p style={{ color: "red" }}>Upload error: {uploadError}</p>
            )}
            {crawlSummary && (
              <p>
                Uploaded: {crawlSummary.totalPages} pages &mdash;{" "}
                {crawlSummary.non200Count} non-200,{" "}
                {crawlSummary.missingTitleCount} missing title,{" "}
                {crawlSummary.missingMetaDescriptionCount} missing meta,{" "}
                {crawlSummary.missingH1Count} missing H1
              </p>
            )}
            {crawlUploadId && (
              <input type="hidden" name="crawlUploadId" value={crawlUploadId} />
            )}
          </fieldset>
        )}

        <div>
          <button
            type="submit"
            disabled={
              isPending ||
              selectedModuleId === "" ||
              (selectedModuleId === "site-audit" && crawlUploadId === null)
            }
          >
            {isPending ? "Running..." : "Run"}
          </button>
        </div>
      </form>

      {runError && (
        <p style={{ color: "red" }}>Error: {runError}</p>
      )}

      {output !== null && (
        <div>
          <h3>Output {runId ? <small>(run ID: {runId})</small> : null}</h3>
          <pre>{JSON.stringify(output, null, 2)}</pre>
          <p>
            <a href="/history">View all history →</a>
          </p>
        </div>
      )}
    </div>
  );
}
