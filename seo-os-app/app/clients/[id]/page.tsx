import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditProfileForm } from "./EditProfileForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: { profile: true },
  });

  if (!client) notFound();

  const profileData = client.profile?.profileData ?? {};

  return (
    <div>
      <p>
        <a href="/clients">← Back to Clients</a>
      </p>
      <h1>{client.name}</h1>
      <p>
        <small>ID: {client.id}</small>
        <br />
        <small>Created: {client.createdAt.toLocaleDateString()}</small>
      </p>

      <h2>Client Profile (JSON)</h2>
      <EditProfileForm clientId={client.id} initialProfileData={profileData} />
    </div>
  );
}
