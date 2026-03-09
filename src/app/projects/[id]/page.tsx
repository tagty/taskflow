import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, listTasksByProject } from "@/lib/supabase/queries";
import { createTaskAction } from "./actions";
import { TaskList } from "./TaskList";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, tasks] = await Promise.all([getProject(id), listTasksByProject(id)]);

  if (!project) notFound();

  const allTags = [...new Set(tasks.flatMap((t) => t.tags))].sort();
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

      <form action={createTaskForProject} className="flex flex-col gap-2 mb-8">
        <div className="flex gap-2">
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
        </div>
        <input
          name="tags"
          placeholder="タグ（カンマ区切り、例: bug, urgent）"
          className="border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </form>

      <TaskList tasks={tasks} projectId={id} allTags={allTags} />
    </div>
  );
}
