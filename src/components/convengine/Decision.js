import React from "react";

export function Decision({ title, children }) {
  return (
    <section className="ce-decision-card">
      {title && <h4>{title}</h4>}
      <div>{children}</div>
    </section>
  );
}
