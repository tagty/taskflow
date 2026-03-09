import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, listTasksByProject } from "@/lib/supabase/queries";
import { createTaskAction, changeTaskStatusAction } from "./actions";
import { TaskStatusButton } from "@/components/TaskStatusButton";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, tasks] = await Promise.all([getProject(id), listTasksByProject(id)]);

  if (!project) notFound();

  const todo = tasks.filter((t) => t.status === "todo");
  const doing = tasks.filter((t) => t.status === "doing");
  const done = tasks.filter((t) => t.status === "done");

  const createTaskForProject = createTaskAction.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          ← プロジェクト一覧
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <span
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: project.color ?? "#6b7280" }}
        />
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {project.description && (
          <span className="text-sm text-gray-400 dark:text-gray-500">{project.description}</span>
        )}
      </div>

      <form action={createTaskForProject} className="flex gap-2 mb-8">
        <input
          name="title"
          placeholder="タスクを追加..."
          required
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <input
          name="due_date"
          type="date"
          className="border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 text-gray-500 dark:text-gray-400"
        />
        <button
          type="submit"
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
        >
          追加
        </button>
      </form>

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
                    action={changeTaskStatusAction.bind(null, id, task.id, task.status)}
                  />
                  <span className="text-sm">{task.title}</span>
                  {task.due_date && (
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{task.due_date}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
