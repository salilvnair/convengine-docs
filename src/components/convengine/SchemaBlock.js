import React from "react";
import CodeBlock from "@theme/CodeBlock";

export function SchemaBlock({ title, children }) {
  return (
    <section className="ce-schema-card">
      {title && <div className="ce-schema-title">{title}</div>}
      <CodeBlock language="json">{typeof children === "string" ? children.trim() : ""}</CodeBlock>
    </section>
  );
}
