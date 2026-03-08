import Link from "next/link";
import { listRecentCompleted } from "@/lib/supabase/queries";

export default async function HistoryPage() {
  const tasks = await listRecentCompleted();

  const grouped = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    const date = task.completed_at
      ? task.completed_at.split("T")[0]
      : "不明";
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">完了履歴</h1>
      </div>

      <nav className="flex gap-4 text-sm mb-8">
        <Link href="/projects" className="text-gray-400 hover:text-gray-600">プロジェクト</Link>
        <Link href="/today" className="text-gray-400 hover:text-gray-600">Today</Link>
        <span className="font-medium">履歴</span>
      </nav>

      {tasks.length === 0 ? (
        <p className="text-gray-400 text-sm">完了したタスクはありません</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <section key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-2">{date}</h2>
              <ul className="space-y-2">
                {items.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      完了
                    </span>
                    <span className="text-sm flex-1 text-gray-500 line-through">{task.title}</span>
                    <div className="flex items-center gap-2 ml-auto">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: task.projects.color ?? "#6b7280" }}
                      />
                      <span className="text-xs text-gray-400">{task.projects.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
