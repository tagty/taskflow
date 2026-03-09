"use server";

import { revalidatePath } from "next/cache";
import { createTask, updateTask, updateTaskStatus, type Task } from "@/lib/supabase/queries";

export async function createTaskAction(projectId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const due_date = formData.get("due_date") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? [...new Set(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean))]
    : [];

  await createTask({
    project_id: projectId,
    title,
    due_date: due_date || undefined,
    tags,
  });

  revalidatePath(`/projects/${projectId}`);
}

const NEXT_STATUS: Record<Task["status"], Task["status"]> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

export async function updateTaskAction(
  projectId: string,
  taskId: string,
  formData: FormData
) {
  const title = (formData.get("title") as string).trim();
  if (!title) return;

  const due_date = (formData.get("due_date") as string) || null;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? [...new Set(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean))]
    : [];

  await updateTask(taskId, { title, due_date, tags });
  revalidatePath(`/projects/${projectId}`);
}

export async function changeTaskStatusAction(
  projectId: string,
  taskId: string,
  currentStatus: Task["status"]
) {
  await updateTaskStatus(taskId, NEXT_STATUS[currentStatus]);
  revalidatePath(`/projects/${projectId}`);
}
