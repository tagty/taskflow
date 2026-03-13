"use client";

import { useState } from "react";
import { type Task, type TaskNote } from "@/lib/supabase/queries";
import { TaskStatusButton } from "@/components/TaskStatusButton";
import { changeTaskStatusAction, createTaskNoteAction, deleteTaskAction, updateTaskAction } from "./actions";

type Props = {
  tasks: Task[];
  projectId: string;
  allTags: string[];
  notesByTaskId: Record<string, TaskNote[]>;
};

function TaskItem({
  task,
  projectId,
  notes,
}: {
  task: Task;
  projectId: string;
  notes: TaskNote[];
}) {
  const [editing, setEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  if (editing) {
    const action = async (formData: FormData) => {
      await updateTaskAction(projectId, task.id, formData);
      setEditing(false);
    };

    return (
      <li className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-blue-300 dark:border-blue-700">
        <form action={action} className="flex flex-col gap-2">
          <input
            name="title"
            defaultValue={task.title}
            required
            autoFocus
            className="w-full border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-400 dark:text-gray-100"
          />
          <div className="flex gap-2">
            <input
              name="due_date"
              type="date"
              title="期日"
              defaultValue={task.due_date ?? ""}
              className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 focus:outline-none"
            />
            <input
              name="tags"
              defaultValue={task.tags.join(", ")}
              placeholder="タグ（カンマ区切り）"
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 focus:outline-none dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2 justify-between">
            <button
              type="button"
              onClick={async () => {
                if (confirm(`「${task.title}」を削除しますか？`)) {
                  await deleteTaskAction(projectId, task.id);
                }
              }}
              className="text-xs px-3 py-1 rounded border border-red-200 dark:border-red-900 text-red-400 dark:text-red-500 hover:border-red-400 hover:text-red-600 transition-colors"
            >
              削除
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs px-3 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="text-xs px-3 py-1 rounded bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </li>
    );
  }

  const addNoteAction = createTaskNoteAction.bind(null, projectId, task.id);

  return (
    <li className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 group">
      <div className="flex items-center gap-3 p-3">
        <TaskStatusButton
          status={task.status}
          action={changeTaskStatusAction.bind(null, projectId, task.id, task.status)}
        />
        <span className="text-sm flex-1">{task.title}</span>
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
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{task.due_date}</span>
        )}
        <button
          onClick={() => setShowNotes((v) => !v)}
          className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          aria-label="メモ"
        >
          メモ{notes.length > 0 ? `(${notes.length})` : ""}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          aria-label="編集"
        >
          編集
        </button>
      </div>

      {showNotes && (
        <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-2 space-y-2">
          {notes.map((note) => (
            <p key={note.id} className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              <span className="text-gray-300 dark:text-gray-600 mr-2">
                {new Date(note.created_at).toLocaleDateString("ja-JP")}
              </span>
              {note.body}
            </p>
          ))}
          <form action={addNoteAction} className="flex gap-2 pt-1">
            <input
              name="body"
              placeholder="メモを追加..."
              required
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 focus:outline-none focus:border-gray-400 dark:text-gray-100 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              className="text-xs px-3 py-1 rounded bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
            >
              追加
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

export function TaskList({ tasks, projectId, allTags, notesByTaskId }: Props) {
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
                <TaskItem key={task.id} task={task} projectId={projectId} notes={notesByTaskId[task.id] ?? []} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
