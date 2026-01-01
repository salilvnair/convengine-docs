import React from "react";

export function FlowStep({ step, title, children }) {
    return (
        <div className="ce-flow-step">
            <div className="ce-flow-step-header">
                <span className="ce-step-number">{step}</span>
                <strong>{title}</strong>
            </div>
            <div className="ce-flow-step-body">{children}</div>
        </div>
    );
}
