import { useEffect, useState } from "react";
import { addLog, deleteLog, listLogs, type LogEntry, LOGS_CHANGED_EVENT } from "./logStorage";

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const refresh = () => setLogs(listLogs());

  useEffect(() => {
    refresh();

    const onChanged = () => refresh();
    window.addEventListener(LOGS_CHANGED_EVENT, onChanged);
    window.addEventListener("storage", onChanged);

    return () => {
      window.removeEventListener(LOGS_CHANGED_EVENT, onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, []);

  const create = (data: Omit<LogEntry, "id" | "createdAt">) => {
    const created = addLog(data);
    refresh();
    return created;
  };

  const remove = (id: string) => {
    deleteLog(id);
    refresh();
  };

  return { logs, refresh, create, remove };
}
