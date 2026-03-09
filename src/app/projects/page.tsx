import Link from "next/link";
import { listProjects } from "@/lib/supabase/queries";
import { createProjectAction } from "./actions";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">プロジェクト</h1>

      <ul className="space-y-2 mb-8">
        {projects.length === 0 && (
          <p className="text-gray-400 text-sm">プロジェクトがまだありません</p>
        )}
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color ?? "#6b7280" }}
              />
              <span className="font-medium">{project.name}</span>
              {project.description && (
                <span className="text-sm text-gray-400 dark:text-gray-500 truncate">{project.description}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <details className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <summary className="cursor-pointer font-medium text-sm">+ 新しいプロジェクト</summary>
        <form action={createProjectAction} className="mt-4 space-y-3">
          <input
            name="name"
            placeholder="プロジェクト名"
            required
            className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <input
            name="description"
            placeholder="説明（任意）"
            className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">色:</span>
            {COLORS.map((color) => (
              <label key={color} className="cursor-pointer">
                <input type="radio" name="color" value={color} className="sr-only" />
                <span
                  className="block w-6 h-6 rounded-full border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500"
                  style={{ backgroundColor: color }}
                />
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            作成
          </button>
        </form>
      </details>
    </div>
  );
}
