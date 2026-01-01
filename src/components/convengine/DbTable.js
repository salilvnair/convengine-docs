import React from "react";

export function DbTable({ name, purpose, children }) {
    return (
        <div className="ce-db-table">
            <h4>🗄️ {name}</h4>
            <p><em>{purpose}</em></p>
            <ul>{children}</ul>
        </div>
    );
}
