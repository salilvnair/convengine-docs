import React from "react";
import CodeBlock from "@theme/CodeBlock";

export function SchemaBlock({ title, children }) {
    return (
        <div>
            <div className="ce-schema-header">
                📐 {title}
            </div>
            <CodeBlock language="json">
                {typeof children === "string" ? children.trim() : ""}
            </CodeBlock>
        </div>
    );
}
