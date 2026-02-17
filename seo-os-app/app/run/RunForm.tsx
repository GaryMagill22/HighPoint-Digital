"use client";

import { useTransition, useState } from "react";
import type { RequiredInput } from "@/lib/configLoader";
import { runModule } from "./actions";

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
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [output, setOutput] = useState<unknown>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedModule =
    modules.find((m) => m.id === selectedModuleId) ?? null;

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
          <select id="clientId" name="clientId" required>
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
            onChange={(e) => setSelectedModuleId(e.target.value)}
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

        <div>
          <button
            type="submit"
            disabled={isPending || selectedModuleId === ""}
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
