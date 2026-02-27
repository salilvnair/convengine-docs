import React from "react";
import { IconRobot, IconUser, IconBraces, IconTable, IconInfoCircle } from "@tabler/icons-react";
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

function toPrettyJson(value) {
  if (value == null) {
    return "{}";
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function TraceChatBubble({
  role = "assistant",
  name,
  message,
  children,
  json,
  tables = [],
  info = []
}) {
  const isUser = role === "user";
  const infoList = Array.isArray(info) ? info : [info];
  const hasFooter = json || (tables && tables.length > 0) || (infoList && infoList.filter(Boolean).length > 0);

  return (
    <div className={clsx("ce-chat-message", isUser ? "ce-chat-message-user" : "ce-chat-message-assistant")}>
      <div className="ce-chat-avatar">
        {isUser ? <IconUser size={20} /> : <IconRobot size={20} />}
      </div>
      <div className="ce-chat-bubble-content ce-chat-trace-content">
        {name ? <div className="ce-chat-trace-name">{name}</div> : null}
        <div className="ce-chat-trace-text">{children || message}</div>

        {hasFooter ? (
          <div className="ce-chat-trace-footer">
            {json ? (
              <details className="ce-chat-trace-details">
                <summary>
                  <IconBraces size={14} />
                  <span>{`{}`}</span>
                </summary>
                <pre>{toPrettyJson(json)}</pre>
              </details>
            ) : null}

            {tables && tables.length > 0 ? (
              <details className="ce-chat-trace-details">
                <summary>
                  <IconTable size={14} />
                  <span>Tables</span>
                </summary>
                <ul>
                  {tables.map((table) => (
                    <li key={table}>{table}</li>
                  ))}
                </ul>
              </details>
            ) : null}

            {infoList && infoList.filter(Boolean).length > 0 ? (
              <details className="ce-chat-trace-details">
                <summary>
                  <IconInfoCircle size={14} />
                  <span>Info</span>
                </summary>
                <ul>
                  {infoList.filter(Boolean).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
