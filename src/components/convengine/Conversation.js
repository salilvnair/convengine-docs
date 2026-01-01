import React, { useState } from "react";

/* -----------------------------
   Conversation
----------------------------- */

export function Conversation({ engineStatus, engineDetails, children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="ce-conversation">
            {engineStatus && (
                <div
                    className="ce-engine-header"
                    onClick={() => setOpen(!open)}
                >
          <span className={`ce-engine-badge ce-engine-${engineStatus.toLowerCase()}`}>
            ⚙ ENGINE · {engineStatus}
          </span>
                    {engineDetails && <span className="ce-engine-toggle">{open ? "▾" : "▸"}</span>}
                </div>
            )}

            {engineDetails && open && (
                <div className="ce-engine-details">
                    {engineDetails}
                </div>
            )}

            <div className="ce-chat">
                {children}
            </div>
        </div>
    );
}

/* -----------------------------
   Chat Messages with Avatar
----------------------------- */

export function User({ children }) {
    return (
        <div className="ce-chat-row ce-chat-end">
            <div className="ce-chat-bubble ce-chat-bubble-user">
                {children}
            </div>
            <div className="ce-avatar ce-avatar-user">👤</div>
        </div>
    );
}

export function Assistant({ children }) {
    return (
        <div className="ce-chat-row ce-chat-start">
            <div className="ce-avatar ce-avatar-assistant">🤖</div>
            <div className="ce-chat-bubble ce-chat-bubble-assistant">
                {children}
            </div>
        </div>
    );
}
