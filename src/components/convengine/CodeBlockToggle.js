import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";

export function CodeBlockToggle({
  language = "text",
  title,
  packagePath,
  filePath,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

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
          <CodeBlock language={language}>{children}</CodeBlock>
        </div>
      )}
    </section>
  );
}
