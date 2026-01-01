import React from "react";

export function Decision({ type, children }) {
    const icon =
        type === "deterministic" ? "🧮" :
            type === "llm" ? "🤖" :
                "🛑";

    return (
        <div className={`ce-decision ce-${type}`}>
            <strong>{icon} {type.toUpperCase()}</strong>
            <div>{children}</div>
        </div>
    );
}
