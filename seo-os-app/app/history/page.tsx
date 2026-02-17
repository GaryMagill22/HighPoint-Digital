import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const runs = await prisma.moduleRun.findMany({
    orderBy: [{ clientId: "asc" }, { createdAt: "desc" }],
    include: { client: { select: { name: true } } },
  });

  // Group by clientId
  const grouped = new Map<string, typeof runs>();
  for (const run of runs) {
    const existing = grouped.get(run.clientId) ?? [];
    existing.push(run);
    grouped.set(run.clientId, existing);
  }

  return (
    <div>
      <h1>Run History</h1>

      {grouped.size === 0 && (
        <p>
          No runs yet. <a href="/run">Run a module.</a>
        </p>
      )}

      {Array.from(grouped.entries()).map(([clientId, clientRuns]) => (
        <div key={clientId}>
          <h2>{clientRuns[0].client.name}</h2>
          {clientRuns.map((run) => (
            <details key={run.id}>
              <summary>
                <strong>{run.moduleId}</strong> — {run.status} —{" "}
                {new Date(run.createdAt).toLocaleString()}
              </summary>
              <div style={{ marginLeft: "1rem" }}>
                <h4>Inputs</h4>
                <pre>{JSON.stringify(run.inputs, null, 2)}</pre>
                <h4>Outputs</h4>
                <pre>
                  {run.outputs !== null
                    ? JSON.stringify(run.outputs, null, 2)
                    : "(no outputs)"}
                </pre>
              </div>
            </details>
          ))}
        </div>
      ))}
    </div>
  );
}
