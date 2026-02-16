import React from "react";
import { IconRobot, IconUser } from "@tabler/icons-react";
import clsx from "clsx";

export function ChatBubble({ role = "user", children }) {
  const isUser = role === "user";
  
  return (
    <div className={clsx("ce-chat-message", isUser ? "ce-chat-message-user" : "ce-chat-message-assistant")}>
      <div className="ce-chat-avatar">
        {isUser ? <IconUser size={20} /> : <IconRobot size={20} />}
      </div>
      <div className="ce-chat-bubble-content">
        {children}
      </div>
    </div>
  );
}

export function ChatContainer({ children }) {
    return (
        <div className="ce-chat-container">
            {children}
        </div>
    )
}
