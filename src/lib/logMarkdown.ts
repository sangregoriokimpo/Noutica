import type { LogEntry } from "./logStorage";

function escapeYaml(s: string) {
  return s.replace(/"/g, '\\"');
}

export function logToMarkdown(log: LogEntry): string {
  const tags = log.tags ?? [];
  const created = new Date(log.createdAt).toISOString();

  const frontmatter =
`---
id: "${escapeYaml(log.id)}"
title: "${escapeYaml(log.title)}"
project: "${escapeYaml(log.project ?? "")}"
createdAt: "${created}"
tags: [${tags.map(t => `"${escapeYaml(t)}"`).join(", ")}]
---`;

  const body = (log.body ?? "").trim();

  return `${frontmatter}

# ${log.title}

${log.project ? `**Project:** ${log.project}\n` : ""}**Created:** ${created}
${tags.length ? `**Tags:** ${tags.join(", ")}\n` : ""}

---

${body ? body : "_(No notes yet.)_"}
`;
}
