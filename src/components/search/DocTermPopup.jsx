import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHistory } from '@docusaurus/router';
import { searchDocs } from '@site/src/utils/docsSearch';

function toBadges(value) {
  return String(value || '')
    .split(/[\s:/().,_-]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v) => v.length >= 3)
    .slice(0, 4);
}

export function DocTermPopup({ term, children }) {
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const results = useMemo(() => searchDocs(term, 200), [term]);
  const badges = useMemo(() => toBadges(term), [term]);
  const hasMultiplePages = results.length > 1;

  const go = (path) => {
    setOpen(false);
    history.push(path);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  return (
    <>
      {hasMultiplePages ? (
        <button type="button" className="ce-term-trigger" onClick={() => setOpen(true)}>
          {children || term}
        </button>
      ) : (
        <span>{children || term}</span>
      )}
      {hasMultiplePages && open && typeof document !== 'undefined'
        ? createPortal(
            <div className="ce-search-overlay" role="dialog" aria-modal="true">
              <div className="ce-search-card ce-term-card" onClick={(e) => e.stopPropagation()}>
                <div className="ce-search-head">
                  <div className="ce-search-title">References: {term}</div>
                  <div className="ce-search-close-hint">Press Esc to close</div>
                </div>
                {badges.length > 0 && (
                  <div className="ce-search-badges">
                    {badges.map((b) => (
                      <span key={`${term}-${b}`} className="ce-search-badge">{b}</span>
                    ))}
                  </div>
                )}
                <div className="ce-search-results">
                  {results.length === 0 ? (
                    <div className="ce-search-empty">No matching pages found.</div>
                  ) : (
                    results.map((r) => (
                      <button
                        key={`${term}-${r.id}`}
                        className="ce-search-item"
                        type="button"
                        onClick={() => go(r.permalink)}
                      >
                        <span className="ce-search-item-title">{r.title}</span>
                        <span className="ce-search-item-path">{r.permalink}</span>
                        <span className="ce-search-item-excerpt">{r.excerpt}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
