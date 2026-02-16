import React from "react";
import { renderInlineTokens } from "./renderInlineTokens";

export function FlowStep({ step, title, children }) {
  return (
    <section className="ce-flow-step-card">
      <header className="ce-flow-step-header">
        <span className="ce-flow-step-index">{step}</span>
        <h4 className="ce-flow-step-title-ribbon">{renderInlineTokens(title)}</h4>
      </header>
      <div className="ce-flow-step-body">{children}</div>
    </section>
  );
}
