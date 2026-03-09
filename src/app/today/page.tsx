import Link from "next/link";
import { listTodayTasks } from "@/lib/supabase/queries";
import { TaskStatusButton } from "@/components/TaskStatusButton";
import { changeTaskStatusAction } from "./actions";

export default async function TodayPage() {
  const today = new Date().toISOString().split("T")[0];
  const tasks = await listTodayTasks(today);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Today</h1>
        <span className="text-sm text-gray-400 dark:text-gray-500">{today}</span>
      </div>

      <nav className="flex gap-4 text-sm mb-8">
        <Link href="/projects" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">プロジェクト</Link>
        <span className="font-medium">Today</span>
      </nav>

      {tasks.length === 0 ? (
        <p className="text-gray-400 text-sm">今日のタスクはありません</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <TaskStatusButton
                status={task.status}
                action={changeTaskStatusAction.bind(null, task.id, task.status)}
              />
              <span className="text-sm flex-1">{task.title}</span>
              <div className="flex items-center gap-2 ml-auto">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.projects.color ?? "#6b7280" }}
                />
                <span className="text-xs text-gray-400 dark:text-gray-500">{task.projects.name}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
