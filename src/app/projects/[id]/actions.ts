"use server";

import { revalidatePath } from "next/cache";
import { createTask, updateTaskStatus, type Task } from "@/lib/supabase/queries";

export async function createTaskAction(projectId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const due_date = formData.get("due_date") as string;

  await createTask({
    project_id: projectId,
    title,
    due_date: due_date || undefined,
  });

  revalidatePath(`/projects/${projectId}`);
}

const NEXT_STATUS: Record<Task["status"], Task["status"]> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

export async function changeTaskStatusAction(
  projectId: string,
  taskId: string,
  currentStatus: Task["status"]
) {
  await updateTaskStatus(taskId, NEXT_STATUS[currentStatus]);
  revalidatePath(`/projects/${projectId}`);
}
