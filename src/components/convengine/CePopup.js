import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export function CePopup({ title, description, children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const trigger = useMemo(() => {
    if (!React.isValidElement(children)) {
      return (
        <button type="button" className="ce-popup-trigger" onClick={() => setOpen(true)}>
          {children}
        </button>
      );
    }

    const originalOnClick = children.props.onClick;
    const originalOnKeyDown = children.props.onKeyDown;
    const existingClass = children.props.className || "";

    return React.cloneElement(children, {
      role: "button",
      tabIndex: 0,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      className: `${existingClass} ce-step-badge-item-clickable`.trim(),
      onClick: (event) => {
        if (typeof originalOnClick === "function") {
          originalOnClick(event);
        }
        setOpen(true);
      },
      onKeyDown: (event) => {
        if (typeof originalOnKeyDown === "function") {
          originalOnKeyDown(event);
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      },
    });
  }, [children, open]);

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="ce-popup-overlay" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
            <div className="ce-popup-card" onClick={(event) => event.stopPropagation()}>
              <div className="ce-popup-head">
                <h4>{title}</h4>
                <button type="button" className="ce-popup-close" onClick={() => setOpen(false)} aria-label="Close">
                  ×
                </button>
              </div>
              <p>{description}</p>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {trigger}
      {modal}
    </>
  );
}
