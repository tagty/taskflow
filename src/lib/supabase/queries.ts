import { supabaseAdmin } from "./admin";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "todo" | "doing" | "done";
  priority: number | null;
  due_date: string | null;
  estimate_minutes: number | null;
  scheduled_for: string | null;
  completed_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export async function listTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateTaskStatus(
  taskId: string,
  status: Task["status"]
): Promise<void> {
  const updates: Partial<Task> = { status };
  if (status === "done") updates.completed_at = new Date().toISOString();
  else updates.completed_at = null;

  const { error } = await supabaseAdmin
    .from("tasks")
    .update(updates)
    .eq("id", taskId);

  if (error) throw error;
}

export async function createTask(input: {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  tags?: string[];
}): Promise<Task> {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw error;
}

export async function updateTask(
  taskId: string,
  input: { title: string; description: string | null; due_date: string | null; tags: string[] }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("tasks")
    .update(input)
    .eq("id", taskId);

  if (error) throw error;
}

export type TaskWithProject = Task & { projects: Pick<Project, "name" | "color"> };

export async function listTodayTasks(today: string): Promise<TaskWithProject[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error("Invalid date format");

  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*, projects(name, color)")
    .neq("status", "done")
    .or(`scheduled_for.eq.${today},due_date.eq.${today}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function listStalledTasks(thresholdDays = 3): Promise<TaskWithProject[]> {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - thresholdDays);

  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*, projects(name, color)")
    .eq("status", "doing")
    .lt("updated_at", threshold.toISOString())
    .order("updated_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function listRecentCompleted(limit = 30): Promise<TaskWithProject[]> {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*, projects(name, color)")
    .eq("status", "done")
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export type TaskNote = {
  id: string;
  task_id: string;
  body: string;
  created_at: string;
};

export async function listTaskNotesByProject(projectId: string): Promise<TaskNote[]> {
  const taskIds = await supabaseAdmin
    .from("tasks")
    .select("id")
    .eq("project_id", projectId);

  if (taskIds.error) throw taskIds.error;
  if (taskIds.data.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from("task_notes")
    .select("*")
    .in("task_id", taskIds.data.map((t) => t.id))
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTaskNote(input: {
  task_id: string;
  body: string;
}): Promise<TaskNote> {
  const { data, error } = await supabaseAdmin
    .from("task_notes")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(input: {
  name: string;
  description?: string;
  color?: string;
}): Promise<Project> {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}
