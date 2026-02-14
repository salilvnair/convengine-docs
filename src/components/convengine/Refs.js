import React from "react";

export function FileRef({ children }) {
  return <span className="ce-file-ref">{children}</span>;
}

export function MethodRef({ children }) {
  return <span className="ce-method-ref">{children}</span>;
}
