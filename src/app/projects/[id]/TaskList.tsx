"use client";

import { useState } from "react";
import { type Task } from "@/lib/supabase/queries";
import { TaskStatusButton } from "@/components/TaskStatusButton";
import { changeTaskStatusAction } from "./actions";

type Props = {
  tasks: Task[];
  projectId: string;
  allTags: string[];
};

export function TaskList({ tasks, projectId, allTags }: Props) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = selectedTag
    ? tasks.filter((t) => t.tags.includes(selectedTag))
    : tasks;

  const todo = filtered.filter((t) => t.status === "todo");
  const doing = filtered.filter((t) => t.status === "doing");
  const done = filtered.filter((t) => t.status === "done");

  return (
    <>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-2 py-1 rounded-full border transition-colors ${
              selectedTag === null
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent"
                : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400"
            }`}
          >
            すべて
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                selectedTag === tag
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {[
        { label: "進行中", items: doing },
        { label: "未着手", items: todo },
        { label: "完了", items: done },
      ].map(({ label, items }) => (
        <section key={label} className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{label}</h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-300 dark:text-gray-600 pl-1">なし</p>
          ) : (
            <ul className="space-y-2">
              {items.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <TaskStatusButton
                    status={task.status}
                    action={changeTaskStatusAction.bind(null, projectId, task.id, task.status)}
                  />
                  <span className="text-sm">{task.title}</span>
                  {task.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {task.due_date && (
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 shrink-0">{task.due_date}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
