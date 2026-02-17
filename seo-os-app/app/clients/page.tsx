import { prisma } from "@/lib/prisma";
import { CreateClientForm } from "./CreateClientForm";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>Clients</h1>

      <h2>Create New Client</h2>
      <CreateClientForm />

      <h2>All Clients ({clients.length})</h2>
      {clients.length === 0 ? (
        <p>No clients yet. Create one above.</p>
      ) : (
        <ul>
          {clients.map((client) => (
            <li key={client.id}>
              <a href={`/clients/${client.id}`}>{client.name}</a>
              <small> — {client.createdAt.toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
