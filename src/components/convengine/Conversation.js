import React from "react";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="ce-chat-icon-svg">
      <circle cx="12" cy="8" r="4.1" fill="currentColor" />
      <path d="M4.5 19.3c0-3.9 3.4-6.3 7.5-6.3s7.5 2.4 7.5 6.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="ce-chat-icon-svg">
      <rect x="4" y="7" width="16" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="13" r="1.3" fill="currentColor" />
      <circle cx="15" cy="13" r="1.3" fill="currentColor" />
      <path d="M12 7V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Conversation({ title, children }) {
  return (
    <section className="ce-chat-shell">
      {title && <div className="ce-chat-shell-title">{title}</div>}
      <div className="ce-chat-body">{children}</div>
    </section>
  );
}

export function User({ children, name = "User" }) {
  return (
    <div className="ce-chat-row ce-chat-row-user">
      <div className="ce-chat-bubble-wrap ce-chat-bubble-wrap-user">
        <div className="ce-chat-bubble-meta">{name}</div>
        <div className="ce-chat-bubble ce-chat-bubble-user">{children}</div>
      </div>
      <div className="ce-chat-icon ce-chat-icon-user">
        <UserIcon />
      </div>
    </div>
  );
}

export function Assistant({ children, name = "ConvEngine" }) {
  return (
    <div className="ce-chat-row ce-chat-row-assistant">
      <div className="ce-chat-icon ce-chat-icon-assistant">
        <BotIcon />
      </div>
      <div className="ce-chat-bubble-wrap ce-chat-bubble-wrap-assistant">
        <div className="ce-chat-bubble-meta">{name}</div>
        <div className="ce-chat-bubble ce-chat-bubble-assistant">{children}</div>
      </div>
    </div>
  );
}
