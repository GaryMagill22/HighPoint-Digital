"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createClient(formData: FormData): Promise<void> {
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error("Client name is required");
  }
  const client = await prisma.client.create({
    data: { name: name.trim() },
  });
  await prisma.clientProfile.create({
    data: { clientId: client.id, profileData: {} },
  });
  revalidatePath("/clients");
}
