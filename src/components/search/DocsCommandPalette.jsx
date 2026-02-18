import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHistory } from '@docusaurus/router';
import { searchDocs, docsCount } from '@site/src/utils/docsSearch';

function isShortcut(event) {
  const k = (event.key || '').toLowerCase();
  return (event.metaKey || event.ctrlKey) && (k === 'k' || k === ' ' || event.code === 'Space');
}

function toBadges(value) {
  return String(value || '')
    .split(/[\s:/().,_-]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v) => v.length >= 3)
    .slice(0, 4);
}

function resultBadges(result, query) {
  const source = [query, result.title, result.permalink, result.excerpt]
    .filter(Boolean)
    .join(' ');
  const tokens = source.match(/(?:ce_[a-z0-9_]+|@[A-Z][A-Za-z0-9_]+|[A-Z][A-Za-z0-9_$.]*(?:Step|Resolver|Factory|Controller|Service|Repository|Session|Config|Hook|Pipeline|Engine|Transformer|Interceptor|Provider)|[a-zA-Z_][a-zA-Z0-9_$.]*\([^)]*\)|[a-zA-Z0-9_.\/-]+\.(?:java|mdx|md|sql|yml|yaml|json|js|jsx|ts|tsx))/g) || [];
  return [...new Set(tokens.map((v) => v.trim()))].slice(0, 3);
}

export default function DocsCommandPalette() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState('closed');
  const [query, setQuery] = useState('');
  const history = useHistory();
  const cardRef = useRef(null);
  const originRectRef = useRef(null);
  const closeActionRef = useRef(null);

  const getTriggerRect = () => {
    if (typeof document === 'undefined') return null;
    const trigger = document.querySelector('.ce-navbar-search-trigger');
    return trigger ? trigger.getBoundingClientRect() : null;
  };

  const openPalette = () => {
    originRectRef.current = getTriggerRect();
    closeActionRef.current = null;
    setOpen(true);
    setPhase('opening');
  };

  const closePalette = (afterClose) => {
    if (!open || phase === 'closing') return;
    closeActionRef.current = afterClose || null;
    setPhase('closing');
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isShortcut(event)) return;
      event.preventDefault();
      openPalette();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, phase]);

  useEffect(() => {
    const onClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('.ce-navbar-search-trigger')) return;
      event.preventDefault();
      openPalette();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open, phase]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (event) => {
      if (event.key === 'Escape') closePalette();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, phase]);

  useEffect(() => {
    if (!open || !cardRef.current) return undefined;
    const card = cardRef.current;
    const finalRect = card.getBoundingClientRect();
    const origin = originRectRef.current;
    const finalCx = finalRect.left + finalRect.width / 2;
    const finalCy = finalRect.top + finalRect.height / 2;
    const originCx = origin ? origin.left + origin.width / 2 : finalCx;
    const originCy = origin ? origin.top + origin.height / 2 : finalCy;
    const dx = originCx - finalCx;
    const dy = originCy - finalCy;
    const sx = origin ? Math.max(0.16, Math.min(0.5, origin.width / finalRect.width)) : 0.9;
    const sy = origin ? Math.max(0.16, Math.min(0.5, origin.height / finalRect.height)) : 0.9;

    let anim = null;
    if (phase === 'opening') {
      anim = card.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.22, filter: 'blur(2px)' },
          { transform: 'translate(0px, 0px) scale(1, 1)', opacity: 1, filter: 'blur(0px)' },
        ],
        { duration: 340, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' }
      );
      anim.onfinish = () => setPhase('open');
    } else if (phase === 'closing') {
      anim = card.animate(
        [
          { transform: 'translate(0px, 0px) scale(1, 1)', opacity: 1, filter: 'blur(0px)' },
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.06, filter: 'blur(2px)' },
        ],
        { duration: 240, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      );
      anim.onfinish = () => {
        setOpen(false);
        setPhase('closed');
        const action = closeActionRef.current;
        closeActionRef.current = null;
        if (action) action();
      };
    }

    return () => {
      if (anim) anim.cancel();
    };
  }, [open, phase]);

  const results = useMemo(() => searchDocs(query, 200), [query]);
  const badges = useMemo(() => toBadges(query), [query]);

  const go = (permalink) => {
    closePalette(() => {
      setQuery('');
      history.push(permalink);
    });
  };

  const modal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div className="ce-search-overlay" role="dialog" aria-modal="true">
            <div ref={cardRef} className="ce-search-card ce-search-card--animated" onClick={(e) => e.stopPropagation()}>
              <div className="ce-search-head">
                <div className="ce-search-title">Search Docs</div>
                <div className="ce-search-head-right">
                  <div className="ce-search-count">{docsCount()} indexed pages</div>
                </div>
              </div>

              <input
                autoFocus
                className="ce-search-input"
                placeholder="Search classes, methods, tables, files..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {badges.length > 0 && (
                <div className="ce-search-badges ce-search-badges-query">
                  {badges.map((b) => (
                    <span key={`q-${b}`} className="ce-search-badge">{b}</span>
                  ))}
                </div>
              )}

              <div className="ce-search-results">
                {query && results.length === 0 && <div className="ce-search-empty">No results for “{query}”.</div>}
                {results.map((r) => {
                  const rowBadges = resultBadges(r, query);
                  return (
                    <button key={`${r.id}-${r.permalink}`} className="ce-search-item" type="button" onClick={() => go(r.permalink)}>
                      <span className="ce-search-item-title">{r.title}</span>
                      <span className="ce-search-item-path">{r.permalink}</span>
                      {rowBadges.length > 0 && (
                        <span className="ce-search-item-badges">
                          {rowBadges.map((b) => (
                            <span key={`${r.id}-${b}`} className="ce-search-item-badge">{b}</span>
                          ))}
                        </span>
                      )}
                      <span className="ce-search-item-excerpt">{r.excerpt}</span>
                    </button>
                  );
                })}
              </div>
              <div className="ce-search-foot">
                {!query && <div className="ce-search-close-hint">Type to search. Shortcut: Cmd/Ctrl + K</div>}
                <div className="ce-search-close-hint">Press Esc to close</div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return <>{modal}</>;
}
