import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";
import { renderInlineTokens } from "./renderInlineTokens";

function autoIndentBraceCode(snippet) {
  const lines = snippet.split("\n");
  let indentLevel = 0;
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return "";
      }

      let closes = (trimmed.match(/}/g) || []).length;
      const opens = (trimmed.match(/{/g) || []).length;

      if (/^}/.test(trimmed)) {
        indentLevel = Math.max(0, indentLevel - 1);
        if (closes > 0) {
          closes -= 1;
        }
      }

      const indented = `${"  ".repeat(indentLevel)}${trimmed}`;
      indentLevel = Math.max(0, indentLevel + opens - closes);
      return indented;
    })
    .join("\n");
}

function splitSqlColumns(selectList) {
  const cols = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < selectList.length; i += 1) {
    const ch = selectList[i];
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      cols.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) cols.push(current.trim());
  return cols;
}

function formatSqlSnippet(snippet) {
  if (typeof snippet !== "string") {
    return snippet;
  }
  const compact = snippet
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!compact) {
    return snippet;
  }

  let sql = compact;
  const selectMatch = compact.match(/^select\s+([\s\S]+?)\s+from\s+([\s\S]*)$/i);
  if (selectMatch) {
    const cols = splitSqlColumns(selectMatch[1]);
    const lines = ["select"];
    for (let i = 0; i < cols.length; i += 2) {
      const c1 = cols[i];
      const c2 = cols[i + 1];
      const isLastPair = i + 2 >= cols.length;
      if (c2) {
        lines.push(`  ${c1}, ${c2}${isLastPair ? "" : ","}`);
      } else {
        lines.push(`  ${c1}`);
      }
    }
    sql = `${lines.join("\n")}\nfrom ${selectMatch[2].trim()}`;
  }

  sql = sql
    .replace(/\s+(left\s+outer\s+join|left\s+join|right\s+outer\s+join|right\s+join|inner\s+join|full\s+outer\s+join|full\s+join|join)\s+/gi, "\n$1 ")
    .replace(/\s+on\s+/gi, "\n  on ")
    .replace(/\s+where\s+/gi, "\nwhere ")
    .replace(/\s+group\s+by\s+/gi, "\ngroup by ")
    .replace(/\s+having\s+/gi, "\nhaving ")
    .replace(/\s+order\s+by\s+/gi, "\norder by ")
    .replace(/\s+limit\s+/gi, "\nlimit ")
    .replace(/\s+offset\s+/gi, "\noffset ");

  return sql.trim();
}

function normalizeJson(snippet) {
  try {
    return JSON.stringify(JSON.parse(snippet), null, 2);
  } catch (_error) {
    return snippet;
  }
}

function normalizeYaml(snippet) {
  const lines = snippet
    .split("\n")
    .map((line) => line.replace(/\t/g, "  ").replace(/\s+$/g, ""));

  const isKeyOnly = (t) => /^[A-Za-z0-9_-]+:\s*$/.test(t);
  const isChildCandidate = (t) => /^[A-Za-z0-9_-]+:\s*.*$/.test(t) || /^-\s+/.test(t);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || !isKeyOnly(trimmed)) {
      continue;
    }
    const parentIndent = (line.match(/^\s*/) || [""])[0].length;

    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) {
      j += 1;
    }
    if (j >= lines.length) {
      continue;
    }

    const nextLine = lines[j];
    const nextTrimmed = nextLine.trim();
    const nextIndent = (nextLine.match(/^\s*/) || [""])[0].length;
    if (nextIndent > parentIndent || !isChildCandidate(nextTrimmed)) {
      continue;
    }

    for (let k = j; k < lines.length; k += 1) {
      const current = lines[k];
      const currentTrimmed = current.trim();
      if (!currentTrimmed) {
        break;
      }
      const currentIndent = (current.match(/^\s*/) || [""])[0].length;
      if (currentIndent < parentIndent) {
        break;
      }
      lines[k] = `  ${current}`;
    }
  }

  return lines.join("\n");
}

function normalizeCodeSnippet(children, language) {
  if (typeof children !== "string") {
    return children;
  }
  const normalizedLanguage = String(language || "").toLowerCase();
  const normalizedNewlines = children.replace(/\r\n/g, "\n");
  const trimmed = normalizedNewlines.replace(/^\n+|\n+$/g, "");
  if (normalizedLanguage === "yaml" || normalizedLanguage === "yml") {
    return normalizeYaml(trimmed);
  }
  const lines = trimmed.split("\n");
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  if (nonEmpty.length === 0) {
    return trimmed;
  }
  const minIndent = Math.min(
    ...nonEmpty.map((line) => {
      const match = line.match(/^[ \t]*/);
      return match ? match[0].length : 0;
    })
  );
  const base = lines
    .map((line) => line.slice(Math.min(minIndent, line.length)))
    .join("\n");

  const braceLanguages = new Set(["javascript", "js", "typescript", "ts", "tsx", "jsx"]);
  if (braceLanguages.has(normalizedLanguage)) {
    return autoIndentBraceCode(base);
  }
  if (normalizedLanguage === "json") {
    return normalizeJson(base);
  }
  if (normalizedLanguage === "sql") {
    return formatSqlSnippet(base);
  }
  return base;
}

function splitHttpJsonBody(snippet) {
  if (typeof snippet !== "string" || !snippet.trim()) {
    return { requestPart: snippet, jsonPart: null };
  }
  const sections = snippet.split(/\n\s*\n/);
  if (sections.length < 2) {
    return { requestPart: snippet, jsonPart: null };
  }
  const requestPart = sections[0].trimEnd();
  const bodyPart = sections.slice(1).join("\n\n").trim();
  if (!bodyPart.startsWith("{") && !bodyPart.startsWith("[")) {
    return { requestPart: snippet, jsonPart: null };
  }
  return {
    requestPart,
    jsonPart: normalizeJson(bodyPart),
  };
}

export function CodeBlockToggle({
  language = "text",
  title,
  packagePath,
  filePath,
  defaultOpen,
  children,
}) {
  const snippet = normalizeCodeSnippet(children, language);
  const isHttp = String(language || "").toLowerCase() === "http";
  const { requestPart, jsonPart } = isHttp ? splitHttpJsonBody(snippet) : { requestPart: snippet, jsonPart: null };
  const lineCount = typeof snippet === "string" ? snippet.split("\n").length : 0;
  const initialOpen = typeof defaultOpen === "boolean" ? defaultOpen : lineCount <= 50;
  const [open, setOpen] = useState(initialOpen);

  return (
    <section className="ce-code-panel">
      <header className="ce-code-panel-header" onClick={() => setOpen(!open)}>
        <div className="ce-code-panel-head-left">
          <div className="ce-code-panel-ide-strip" aria-hidden="true">
            <span className="ce-ide-dot ce-ide-dot-red" />
            <span className="ce-ide-dot ce-ide-dot-yellow" />
            <span className="ce-ide-dot ce-ide-dot-green" />
          </div>

          <div className="ce-code-panel-title">{renderInlineTokens(title || "Code Snippet")}</div>

          {(packagePath || filePath) && (
            <div className="ce-code-panel-path-wrap">
              {packagePath && (
                <span className="ce-code-panel-path ce-code-panel-path-package" title={packagePath}>
                  package: {packagePath}
                </span>
              )}
              {filePath && (
                <span className="ce-code-panel-path ce-code-panel-path-file" title={filePath}>
                  file: {filePath}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="ce-code-panel-head-right">
          <span className="ce-code-lang">{language.toUpperCase()}</span>
          <button className="ce-code-toggle-btn" type="button">
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </header>

      {open && (
        <div className="ce-code-panel-body">
          <CodeBlock language={language}>{requestPart}</CodeBlock>
          {jsonPart && (
            <CodeBlock language="json">{jsonPart}</CodeBlock>
          )}
        </div>
      )}
    </section>
  );
}
