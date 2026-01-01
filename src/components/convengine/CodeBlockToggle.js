import React, { useState } from "react";
import CodeBlock from "@theme/CodeBlock";

export function CodeBlockToggle({
  language = "text",
  title,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="ce-codeblock-toggle">
      <div
        className="ce-codeblock-header"
        onClick={() => setOpen(!open)}
      >
        <div className="ce-codeblock-title">
          🧩 {title || `${language.toUpperCase()} code`}
        </div>
        <button className="ce-codeblock-btn">
          {open ? "Hide ▲" : "Show ▼"}
        </button>
      </div>

      {open && (
        <div className="ce-codeblock-body">
          <CodeBlock language={language}>
            {children}
          </CodeBlock>
        </div>
      )}
    </div>
  );
}
