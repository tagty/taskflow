"use client";

import { useTransition } from "react";
import type { Task } from "@/lib/supabase/queries";

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "未着手",
  doing: "進行中",
  done: "完了",
};

const STATUS_COLOR: Record<Task["status"], string> = {
  todo: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
  doing: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800",
  done: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800",
};

export function TaskStatusButton({
  status,
  action,
}: {
  status: Task["status"];
  action: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => action())}
      disabled={isPending}
      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${STATUS_COLOR[status]} ${isPending ? "opacity-50" : ""}`}
    >
      {STATUS_LABEL[status]}
    </button>
  );
}
