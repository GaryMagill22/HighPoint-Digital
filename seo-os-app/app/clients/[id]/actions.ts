"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateProfile(
  clientId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const raw = formData.get("profileData");
  if (typeof raw !== "string") {
    return { success: false, error: "Invalid form data" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { success: false, error: "Invalid JSON — please check your syntax." };
  }
  await prisma.clientProfile.update({
    where: { clientId },
    data: { profileData: parsed as object },
  });
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}
