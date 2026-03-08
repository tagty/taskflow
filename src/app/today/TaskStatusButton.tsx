"use client";

import { useTransition } from "react";
import { changeTaskStatusAction } from "./actions";
import type { Task } from "@/lib/supabase/queries";

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "未着手",
  doing: "進行中",
  done: "完了",
};

const STATUS_COLOR: Record<Task["status"], string> = {
  todo: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  doing: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  done: "bg-green-100 text-green-700 hover:bg-green-200",
};

export function TaskStatusButton({ taskId, status }: { taskId: string; status: Task["status"] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => changeTaskStatusAction(taskId, status))}
      disabled={isPending}
      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${STATUS_COLOR[status]} ${isPending ? "opacity-50" : ""}`}
    >
      {STATUS_LABEL[status]}
    </button>
  );
}
