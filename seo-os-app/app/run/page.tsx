import { prisma } from "@/lib/prisma";
import { listModules } from "@/lib/configLoader";
import { RunForm } from "./RunForm";

export default async function RunPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const modules = listModules().map((m) => ({
    id: m.id,
    label: m.label,
    required_inputs: m.required_inputs,
  }));

  return (
    <div>
      <h1>Run Module</h1>

      {clients.length === 0 && (
        <p>
          No clients found.{" "}
          <a href="/clients">Create a client first.</a>
        </p>
      )}

      {modules.length === 0 && (
        <p>No modules found. Add JSON files to config/modules/.</p>
      )}

      <RunForm clients={clients} modules={modules} />
    </div>
  );
}
