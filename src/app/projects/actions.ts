"use server";

import { revalidatePath } from "next/cache";
import { createProject } from "@/lib/supabase/queries";

export async function createProjectAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;

  await createProject({ name, description: description || undefined, color: color || undefined });
  revalidatePath("/projects");
}
