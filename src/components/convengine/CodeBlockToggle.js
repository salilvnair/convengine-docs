import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";

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

  // Safety net for docs snippets: if "convengine:" appears as a root key,
  // ensure immediately-following peer keys are nested under it.
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^(\s*)convengine:\s*$/);
    if (!match) {
      continue;
    }

    const baseIndent = match[1].length;
    for (let j = i + 1; j < lines.length; j += 1) {
      const next = lines[j];
      if (!next.trim()) {
        continue;
      }
      const nextIndent = (next.match(/^\s*/) || [""])[0].length;
      if (nextIndent < baseIndent) {
        break;
      }

      // Keep already-indented children as-is.
      if (nextIndent > baseIndent) {
        continue;
      }

      // Same-level key after convengine => treat as child key.
      if (/^[A-Za-z0-9_-]+\s*:/.test(next.trim())) {
        lines[j] = `  ${next}`;
        continue;
      }

      // Non-key tokens at same level end this block.
      break;
    }
  }

  return lines.join("\n");
}

function normalizeCodeSnippet(children, language) {
  if (typeof children !== "string") {
    return children;
  }
  const normalizedNewlines = children.replace(/\r\n/g, "\n");
  const trimmed = normalizedNewlines.replace(/^\n+|\n+$/g, "");
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

  const braceLanguages = new Set(["java", "javascript", "js", "typescript", "ts", "tsx", "jsx", "c", "cpp"]);
  const normalizedLanguage = String(language || "").toLowerCase();
  if (braceLanguages.has(normalizedLanguage)) {
    return autoIndentBraceCode(base);
  }
  if (normalizedLanguage === "json") {
    return normalizeJson(base);
  }
  if (normalizedLanguage === "yaml" || normalizedLanguage === "yml") {
    return normalizeYaml(base);
  }
  return base;
}

export function CodeBlockToggle({
  language = "text",
  title,
  packagePath,
  filePath,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const snippet = normalizeCodeSnippet(children, language);

  return (
    <section className="ce-code-panel">
      <header className="ce-code-panel-header" onClick={() => setOpen(!open)}>
        <div className="ce-code-panel-head-left">
          <div className="ce-code-panel-ide-strip" aria-hidden="true">
            <span className="ce-ide-dot ce-ide-dot-red" />
            <span className="ce-ide-dot ce-ide-dot-yellow" />
            <span className="ce-ide-dot ce-ide-dot-green" />
          </div>

          <div className="ce-code-panel-title">{title || "Code Snippet"}</div>

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
          <CodeBlock language={language}>{snippet}</CodeBlock>
        </div>
      )}
    </section>
  );
}
