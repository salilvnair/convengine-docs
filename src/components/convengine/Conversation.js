import React from "react";
import { ChatContainer, TraceChatBubble } from "./ChatBubble";

export function Conversation({ title, children }) {
  return (
    <section className="ce-chat-shell">
      {title && <div className="ce-chat-shell-title">{title}</div>}
      <ChatContainer>{children}</ChatContainer>
    </section>
  );
}

export function User({ children, name = "User", json, tables, info }) {
  return (
    <TraceChatBubble
      role="user"
      name={name}
      json={json}
      tables={tables}
      info={info}
      message={typeof children === "string" ? children : undefined}
    >
      {children}
    </TraceChatBubble>
  );
}

export function Assistant({ children, name = "ConvEngine", json, tables, info }) {
  return (
    <TraceChatBubble
      role="assistant"
      name={name}
      json={json}
      tables={tables}
      info={info}
      message={typeof children === "string" ? children : undefined}
    >
      {children}
    </TraceChatBubble>
  );
}
