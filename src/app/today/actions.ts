"use server";

import { revalidatePath } from "next/cache";
import { updateTaskStatus, type Task } from "@/lib/supabase/queries";

const NEXT_STATUS: Record<Task["status"], Task["status"]> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

export async function changeTaskStatusAction(taskId: string, currentStatus: Task["status"]) {
  await updateTaskStatus(taskId, NEXT_STATUS[currentStatus]);
  revalidatePath("/today");
}
