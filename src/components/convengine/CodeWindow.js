import React, { useState } from "react";
import clsx from "clsx";

export function CodeWindow({ title, children, language = "text", defaultOpen = true }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="ce-code-window">
            <div className="ce-code-window-header">
                <div className="ce-window-controls">
                    <span className="ce-dot ce-dot-red"></span>
                    <span className="ce-dot ce-dot-yellow"></span>
                    <span className="ce-dot ce-dot-green"></span>
                </div>
                <div className="ce-window-title">
                    {title && <span className="ce-file-path">{title}</span>}
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="ce-window-toggle"
                    type="button"
                    aria-label={isOpen ? "Collapse code" : "Expand code"}
                >
                    {isOpen ? "Hide" : "Show"}
                </button>
            </div>
            {isOpen && (
                <div className="ce-code-window-body">
                    {children}
                </div>
            )}
        </div>
    );
}
