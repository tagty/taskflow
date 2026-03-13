"use server";

import { revalidatePath } from "next/cache";
import { createTask, createTaskNote, deleteTask, updateTask, updateTaskStatus, type Task } from "@/lib/supabase/queries";

export async function createTaskAction(projectId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || undefined;
  const due_date = formData.get("due_date") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? [...new Set(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean))]
    : [];

  const priorityRaw = formData.get("priority") as string;
  const priorityParsed = priorityRaw ? parseInt(priorityRaw, 10) : undefined;
  const priority = priorityParsed !== undefined && !isNaN(priorityParsed) && priorityParsed >= 1 && priorityParsed <= 5 ? priorityParsed : undefined;
  const estimateRaw = formData.get("estimate_minutes") as string;
  const estimateParsed = estimateRaw ? parseInt(estimateRaw, 10) : undefined;
  const estimate_minutes = estimateParsed !== undefined && !isNaN(estimateParsed) && estimateParsed >= 0 ? estimateParsed : undefined;

  await createTask({
    project_id: projectId,
    title,
    description,
    due_date: due_date || undefined,
    tags,
    priority,
    estimate_minutes,
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

  const description = (formData.get("description") as string) || null;
  const due_date = (formData.get("due_date") as string) || null;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? [...new Set(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean))]
    : [];
  const priorityRaw = formData.get("priority") as string;
  const priorityParsed = priorityRaw ? parseInt(priorityRaw, 10) : null;
  const priority = priorityParsed !== null && !isNaN(priorityParsed) && priorityParsed >= 1 && priorityParsed <= 5 ? priorityParsed : null;
  const estimateRaw = formData.get("estimate_minutes") as string;
  const estimateParsed = estimateRaw ? parseInt(estimateRaw, 10) : null;
  const estimate_minutes = estimateParsed !== null && !isNaN(estimateParsed) && estimateParsed >= 0 ? estimateParsed : null;

  await updateTask(taskId, { title, description, due_date, tags, priority, estimate_minutes });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTaskAction(projectId: string, taskId: string) {
  await deleteTask(taskId);
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

export async function createTaskNoteAction(
  projectId: string,
  taskId: string,
  formData: FormData
) {
  const body = (formData.get("body") as string).trim();
  if (!body) return;

  await createTaskNote({ task_id: taskId, body });
  revalidatePath(`/projects/${projectId}`);
}
