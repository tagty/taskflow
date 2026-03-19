export const dynamic = 'force-dynamic';

import Link from "next/link";
import { listTodayTasks, listStalledTasks } from "@/lib/supabase/queries";
import { TaskStatusButton } from "@/components/TaskStatusButton";
import { changeTaskStatusAction } from "./actions";

const OVERLOAD_THRESHOLD = 480; // 8h in minutes

function stalledDays(updatedAt: string): number {
  const diff = Date.now() - new Date(updatedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatEstimate(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
}

export default async function TodayPage() {
  const today = new Date().toISOString().split("T")[0];
  const [tasks, stalledTasks] = await Promise.all([
    listTodayTasks(today),
    listStalledTasks(3),
  ]);

  // 見積時間合計
  const totalMinutes = tasks.reduce((sum, t) => sum + (t.estimate_minutes ?? 0), 0);
  const hasEstimate = tasks.some((t) => t.estimate_minutes != null);
  const isOverloaded = totalMinutes > OVERLOAD_THRESHOLD;

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

      {stalledTasks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
            <span>⚠</span>
            <span>滞留中 ({stalledTasks.length})</span>
          </h2>
          <ul className="space-y-2">
            {stalledTasks.map((task) => {
              const days = stalledDays(task.updated_at);
              return (
                <li
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800"
                >
                  <TaskStatusButton
                    status={task.status}
                    action={changeTaskStatusAction.bind(null, task.id, task.status)}
                  />
                  <span className="text-sm flex-1">{task.title}</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                      {days}日滞留
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: task.projects.color ?? "#6b7280" }}
                    />
                    <span className="text-xs text-gray-400 dark:text-gray-500">{task.projects.name}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">今日のタスク</h2>
          {hasEstimate && (
            <span className={`text-xs font-medium ${isOverloaded ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}>
              合計 {formatEstimate(totalMinutes)}
              {isOverloaded && " ⚠ 過負荷"}
            </span>
          )}
        </div>
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
                  {task.priority != null && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      P{task.priority}
                    </span>
                  )}
                  {task.estimate_minutes != null && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatEstimate(task.estimate_minutes)}
                    </span>
                  )}
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
      </section>
    </div>
  );
}
