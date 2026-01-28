import React from "react";

export function DbTable({
  name,
  purpose,
  title,
  columns,
  rows,
  children,
}) {
  const tableName = name || title;

  return (
    <div className="ce-db-table">
      {tableName && <h4>🗄️ {tableName}</h4>}
      {purpose && <p><em>{purpose}</em></p>}

      {/* ✅ Structured table mode */}
      {columns && rows ? (
        <table className="ce-db-table-grid">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {/* ✅ Narrative list mode (backward compatible) */}
      {!columns && !rows && children ? (
        <ul>{children}</ul>
      ) : null}
    </div>
  );
}

export default DbTable;
