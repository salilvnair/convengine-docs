import React from "react";

export function Highlight({ type = "info", title, children }) {
  return (
    <div className={`ce-callout ce-callout-${type}`}>
      {title && <div className="ce-callout-title">{title}</div>}
      <div className="ce-callout-body">{children}</div>
    </div>
  );
}
