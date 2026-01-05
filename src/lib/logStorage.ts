export type LogEntry = {
  id: string;
  title: string;
  project?: string;
  tags: string[];
  body: string;
  attachments?: Attachment[];
  createdAt: string; 
};

export type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  createdAt: string;
};

const STORAGE_KEY = "lab_notebook_logs_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function listLogs(): LogEntry[] {
  const logs = safeParse<LogEntry[]>(localStorage.getItem(STORAGE_KEY), []);
  return logs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export const LOGS_CHANGED_EVENT = "lab_notebook_logs_changed";

export function saveAllLogs(logs: LogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  window.dispatchEvent(new Event(LOGS_CHANGED_EVENT));
}


export function addLog(input: Omit<LogEntry, "id" | "createdAt">): LogEntry {
  const logs = listLogs();

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now()) + "_" + Math.random().toString(16).slice(2);

  const newLog: LogEntry = {
    id,
    createdAt: new Date().toISOString(),
    ...input,
  };

  saveAllLogs([newLog, ...logs]);
  return newLog;
}

export function deleteLog(id: string) {
  const logs = listLogs().filter((l) => l.id !== id);
  saveAllLogs(logs);
}

export function getLog(id: string): LogEntry | undefined {
  return listLogs().find((l) => l.id === id);
}

export function updateLog(id: string, patch: Partial<Omit<LogEntry, "id">>) {
  const logs = listLogs().map((l) => (l.id === id ? { ...l, ...patch } : l));
  saveAllLogs(logs);
}
