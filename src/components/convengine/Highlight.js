import React from "react";

export function Highlight({ type, children }) {
    return (
        <div className={`ce-highlight ce-${type}`}>
            {children}
        </div>
    );
}
