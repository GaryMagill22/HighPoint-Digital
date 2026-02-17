"use server";

import { prisma } from "@/lib/prisma";
import { getModuleById } from "@/lib/configLoader";
import { generateStubOutput } from "@/lib/stubLLM";

export async function runModule(formData: FormData): Promise<{
  success: boolean;
  outputs?: unknown;
  error?: string;
  runId?: string;
}> {
  const clientId = formData.get("clientId");
  const moduleId = formData.get("moduleId");

  if (typeof clientId !== "string" || clientId.trim() === "") {
    return { success: false, error: "Please select a client." };
  }
  if (typeof moduleId !== "string" || moduleId.trim() === "") {
    return { success: false, error: "Please select a module." };
  }

  const moduleDef = getModuleById(moduleId);
  if (!moduleDef) {
    return { success: false, error: `Module "${moduleId}" not found in config/modules/.` };
  }

  // Collect dynamic inputs from formData using the module's required_inputs keys
  const inputs: Record<string, string> = {};
  for (const field of moduleDef.required_inputs) {
    const val = formData.get(field.key);
    inputs[field.key] = typeof val === "string" ? val : "";
  }

  // Load client profile for context injection
  const profile = await prisma.clientProfile.findUnique({
    where: { clientId },
  });
  const clientProfile = profile?.profileData ?? {};

  // Create the run record with "running" status
  const run = await prisma.moduleRun.create({
    data: {
      clientId,
      moduleId,
      inputs,
      status: "running",
    },
  });

  // Generate stub output (simulates LLM call)
  const outputs = generateStubOutput(moduleDef, inputs, clientProfile);

  // JSON round-trip ensures the value satisfies Prisma's InputJsonValue constraint
  // (Record<string, unknown> is too wide; JSON.parse returns `any`)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const safeOutputs = JSON.parse(JSON.stringify(outputs));

  // Update run to "complete" with outputs
  await prisma.moduleRun.update({
    where: { id: run.id },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    data: { outputs: safeOutputs, status: "complete" },
  });

  return { success: true, outputs, runId: run.id };
}
