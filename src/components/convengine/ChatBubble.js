import React from "react";
import { IconRobot, IconUser, IconBraces, IconTable, IconInfoCircle } from "@tabler/icons-react";
import clsx from "clsx";
import { DbTable } from "./DbTable";

export function ChatBubble({ role = "user", children }) {
  const isUser = role === "user";
  
  return (
    <div className={clsx("ce-chat-message", isUser ? "ce-chat-message-user" : "ce-chat-message-assistant")}>
      <div className="ce-chat-avatar">
        {isUser ? <IconUser size={20} /> : <IconRobot size={20} />}
      </div>
      <div className="ce-chat-bubble-content">
        {children}
      </div>
    </div>
  );
}

export function ChatContainer({ children }) {
    return (
        <div className="ce-chat-container">
            {children}
        </div>
    )
}

function toPrettyJson(value, explicitSql) {
  if (value == null) {
    return "{}";
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    const displayValue = enrichJsonForDisplay(value, explicitSql);
    if (displayValue && typeof displayValue === "object" && typeof displayValue.sql === "string" && displayValue.sql.trim()) {
      const sqlToken = "__CE_SQL_BLOCK__";
      const withToken = { ...displayValue, sql: sqlToken };
      const base = JSON.stringify(withToken, null, 2);
      const renderedSql = displayValue.sql
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n");
      return base.replace(`"sql": "${sqlToken}"`, `"sql":\n${renderedSql}`);
    }
    return JSON.stringify(displayValue, null, 2);
  } catch {
    return String(value);
  }
}

function resolveSqlForDisplay(value, explicitSql) {
  const sqlFromProp = typeof explicitSql === "string" ? explicitSql.trim() : "";
  if (sqlFromProp) return sqlFromProp;
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const existingSql = typeof value.sql === "string" ? value.sql.trim() : "";
  if (existingSql) return existingSql;
  const nestedSql =
    (value._db && typeof value._db.sql === "string" && value._db.sql.trim()) ||
    (value._meta && value._meta._db && typeof value._meta._db.sql === "string" && value._meta._db.sql.trim()) ||
    "";
  return nestedSql || "";
}

function formatSqlForDisplay(rawSql) {
  const sql = typeof rawSql === "string" ? rawSql.trim() : "";
  if (!sql) return "";
  const normalized = sql
    // Display-only readability: remove identifier quoting.
    .replace(/"([^"]+)"/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/\s+(FROM)\s+/gi, "\n$1 ")
    .replace(/\s+(LEFT OUTER JOIN)\s+/gi, "\n$1 ")
    .replace(/\s+(LEFT JOIN)\s+/gi, "\n$1 ")
    .replace(/\s+(RIGHT OUTER JOIN)\s+/gi, "\n$1 ")
    .replace(/\s+(RIGHT JOIN)\s+/gi, "\n$1 ")
    .replace(/\s+(INNER JOIN)\s+/gi, "\n$1 ")
    .replace(/\s+(JOIN)\s+/gi, "\n$1 ")
    .replace(/\s+(WHERE)\s+/gi, "\n$1 ")
    .replace(/\s+(GROUP BY)\s+/gi, "\n$1 ")
    .replace(/\s+(HAVING)\s+/gi, "\n$1 ")
    .replace(/\s+(ORDER BY)\s+/gi, "\n$1 ")
    .replace(/\s+(LIMIT)\s+/gi, "\n$1 ")
    .replace(/\s+(OFFSET)\s+/gi, "\n$1 ")
    .replace(/\s+(UNION ALL)\s+/gi, "\n$1 ")
    .replace(/\s+(UNION)\s+/gi, "\n$1 ")
    .replace(/\s+(ON)\s+/gi, "\n  $1 ")
    .replace(/\s+(AND)\s+/gi, "\n  $1 ")
    .replace(/\s+(OR)\s+/gi, "\n  $1 ")
    .trim();
  return wrapSelectColumns(normalized);
}

function splitSqlCsv(expr) {
  const out = [];
  let buf = "";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < expr.length; i += 1) {
    const ch = expr[i];
    const prev = i > 0 ? expr[i - 1] : "";
    if (ch === "'" && !inDouble && prev !== "\\") {
      inSingle = !inSingle;
      buf += ch;
      continue;
    }
    if (ch === '"' && !inSingle && prev !== "\\") {
      inDouble = !inDouble;
      buf += ch;
      continue;
    }
    if (!inSingle && !inDouble) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (ch === "," && depth === 0) {
        out.push(buf.trim());
        buf = "";
        continue;
      }
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function wrapSelectColumns(sql) {
  const match = sql.match(/^\s*select\s+([\s\S]+?)\nfrom\s+([\s\S]+)$/i);
  if (!match) return sql;
  const selectExpr = match[1].trim();
  const fromTail = match[2];
  const columns = splitSqlCsv(selectExpr);
  if (columns.length <= 2) return sql;

  const chunkSize = 2;
  const chunks = [];
  for (let i = 0; i < columns.length; i += chunkSize) {
    chunks.push(columns.slice(i, i + chunkSize));
  }

  const lines = chunks.map((chunk, idx) => {
    const isLast = idx === chunks.length - 1;
    const head = idx === 0 ? "select " : "       ";
    const body = chunk.join(", ");
    return `${head}${body}${isLast ? "" : ","}`;
  });
  return `${lines.join("\n")}\nfrom ${fromTail}`;
}

function enrichJsonForDisplay(value, explicitSql) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  const resolvedSql = resolveSqlForDisplay(value, explicitSql);
  const formattedSql = formatSqlForDisplay(resolvedSql);
  if (!formattedSql) return value;
  return {
    ...value,
    sql: formattedSql,
  };
}

function isMarkdownTableSeparator(line) {
  const trimmed = line.trim();
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(trimmed);
}

function splitMarkdownRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function prettifyMarkdownHeader(header) {
  const raw = typeof header === "string" ? header.trim() : String(header ?? "").trim();
  if (!raw) return "";
  const withSpaces = raw
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  const acronym = new Map([
    ["id", "ID"],
    ["ui", "UI"],
    ["aso", "ASO"],
    ["don", "DON"],
    ["sql", "SQL"],
  ]);
  return withSpaces
    .split(" ")
    .map((token) => {
      const lower = token.toLowerCase();
      if (acronym.has(lower)) return acronym.get(lower);
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function parseMarkdownTableSegments(text) {
  const source = typeof text === "string" ? text : String(text ?? "");
  const lines = source.split(/\r?\n/);
  const segments = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const next = i + 1 < lines.length ? lines[i + 1] : "";
    if (!line.includes("|") || !isMarkdownTableSeparator(next)) {
      let start = i;
      i += 1;
      while (i < lines.length) {
        const maybeHeader = lines[i];
        const maybeSep = i + 1 < lines.length ? lines[i + 1] : "";
        if (maybeHeader.includes("|") && isMarkdownTableSeparator(maybeSep)) break;
        i += 1;
      }
      const block = lines.slice(start, i).join("\n").trim();
      if (block) segments.push({ type: "text", text: block });
      continue;
    }

    const headers = splitMarkdownRow(line);
    const rows = [];
    i += 2;
    while (i < lines.length) {
      const rowLine = lines[i];
      if (!rowLine.includes("|") || !rowLine.trim()) break;
      rows.push(splitMarkdownRow(rowLine));
      i += 1;
    }
    segments.push({ type: "table", headers, rows });
    while (i < lines.length && !lines[i].trim()) i += 1;
  }

  return segments.length ? segments : [{ type: "text", text: source }];
}

function renderTraceMessageContent(message) {
  const segments = parseMarkdownTableSegments(message);
  return segments.map((segment, idx) => {
    if (segment.type === "table") {
      return (
        <div key={`tbl-${idx}`} style={{ margin: "10px 0" }}>
          <DbTable columns={segment.headers.map(prettifyMarkdownHeader)} rows={segment.rows} />
        </div>
      );
    }
    return (
      <pre key={`txt-${idx}`} style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
        {segment.text}
      </pre>
    );
  });
}

export function TraceChatBubble({
  role = "assistant",
  name,
  message,
  children,
  intent,
  state,
  json,
  sql,
  tables = [],
  info = []
}) {
  const isUser = role === "user";
  const infoList = Array.isArray(info) ? info : [info];
  const hasFooter = json || (tables && tables.length > 0) || (infoList && infoList.filter(Boolean).length > 0);
  const hasTraceChips = !isUser && (intent || state);

  return (
    <div className={clsx("ce-chat-message", isUser ? "ce-chat-message-user" : "ce-chat-message-assistant")}>
      <div className="ce-chat-avatar">
        {isUser ? <IconUser size={20} /> : <IconRobot size={20} />}
      </div>
      <div className="ce-chat-bubble-content ce-chat-trace-content">
        {(name || hasTraceChips) ? (
          <div className="ce-chat-trace-header">
            {name ? <div className="ce-chat-trace-name">{name}</div> : <div />}
            {hasTraceChips ? (
              <div className="ce-chat-trace-chip-row">
                {intent ? (
                  <span className="ce-doc-version-chip ce-chat-trace-chip ce-chat-trace-chip-intent">
                    {`intent: ${intent}`}
                  </span>
                ) : null}
                {state ? (
                  <span className="ce-doc-version-chip ce-chat-trace-chip ce-chat-trace-chip-state">
                    {`state: ${state}`}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="ce-chat-trace-text">{children || renderTraceMessageContent(message)}</div>

        {hasFooter ? (
          <div className="ce-chat-trace-footer">
            {json ? (
              <details className="ce-chat-trace-details">
                <summary>
                  <IconBraces size={14} />
                  <span>{`{}`}</span>
                </summary>
                <pre>{toPrettyJson(json, sql)}</pre>
              </details>
            ) : null}

            {tables && tables.length > 0 ? (
              <details className="ce-chat-trace-details">
                <summary>
                  <IconTable size={14} />
                  <span>Tables</span>
                </summary>
                <ul>
                  {tables.map((table) => (
                    <li key={table}>{table}</li>
                  ))}
                </ul>
              </details>
            ) : null}

            {infoList && infoList.filter(Boolean).length > 0 ? (
              <details className="ce-chat-trace-details">
                <summary>
                  <IconInfoCircle size={14} />
                  <span>Info</span>
                </summary>
                <ul>
                  {infoList.filter(Boolean).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
