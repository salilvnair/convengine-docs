import React from "react";

export function FlowStep({ step, title, children }) {
  return (
    <section className="ce-flow-step-card">
      <header>
        <span className="ce-flow-step-index">{step}</span>
        <h4>{title}</h4>
      </header>
      <div>{children}</div>
    </section>
  );
}
