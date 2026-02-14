import React from "react";

export function DbTable({ title, columns = [], rows = [], note }) {
  return (
    <section className="ce-table-card">
      {title && <h3 className="ce-table-card-title">{title}</h3>}
      <div className="ce-table-wrap">
        <table>
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
      </div>
      {note && <div className="ce-table-note">{note}</div>}
    </section>
  );
}
