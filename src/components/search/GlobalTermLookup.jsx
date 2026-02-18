import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHistory } from '@docusaurus/router';
import { searchDocs } from '@site/src/utils/docsSearch';

function cleanTerm(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/^`|`$/g, '')
    .replace(/^package:\s*/i, '')
    .replace(/^file:\s*/i, '')
    .replace(/^[\s"'`([{]+/, '')
    .replace(/[\s"'`)\]}:;,.!?]+$/, '')
    .trim();
}

function toBadges(value) {
  return cleanTerm(value)
    .split(/[\s:/().,_-]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v) => v.length >= 3)
    .slice(0, 4);
}

function isInterestingTerm(term) {
  if (!term || term.length < 3 || term.length > 140) return false;

  // ConvEngine DB/control tokens
  if (/^ce_[a-z0-9_*]+$/i.test(term)) return true;
  if (/^CE_[A-Z0-9_]+$/.test(term)) return true;

  // ConvEngine package/class references
  if (/convengine/i.test(term)) return true;
  if (/\b(com\.github\.salilvnair\.convengine)\b/.test(term)) return true;

  // Framework classes and components
  if (/^[A-Z][A-Za-z0-9_$.]*(Step|Resolver|Factory|Controller|Service|Repository|Session|Config|Hook|Pipeline|Engine|Transformer|Interceptor|Provider|Client)$/.test(term)) return true;
  if (/^[A-Z][A-Za-z0-9_$.]{3,}$/.test(term)) return true;

  // Methods and chains
  if (/^[a-zA-Z_][a-zA-Z0-9_$.]*\([^)]*\)(\.[a-zA-Z_][a-zA-Z0-9_$.]*\([^)]*\))*$/.test(term)) return true;

  // File/path references
  if (/^[a-zA-Z0-9_.-]+\.(java|mdx|md|sql|yml|yaml|json|js|jsx|ts|tsx)$/.test(term)) return true;
  if (/[\/][a-zA-Z0-9_.\/-]+\.(java|mdx|md|sql|yml|yaml|json|js|jsx|ts|tsx)$/.test(term)) return true;

  // Framework annotations
  if (/^@[A-Z][A-Za-z0-9_]+$/.test(term)) return true;

  return false;
}

function extractTerm(target) {
  if (!target) return null;
  const el = target.closest(
    '.ce-file-ref, .ce-method-ref, .ce-table-cell-content, code'
  );
  if (!el) return null;

  if (el.closest('pre, .theme-code-block')) return null;

  const term = cleanTerm(el.textContent);
  return term || null;
}

function hasMultiPageMatch(term) {
  return searchDocs(term, 3).length > 1;
}

function findBestSearchTerm(rawText) {
  const direct = cleanTerm(rawText);
  if (direct && hasMultiPageMatch(direct)) return direct;

  const candidates = new Set();
  const add = (v) => {
    const c = cleanTerm(v);
    if (c && c.length >= 3) candidates.add(c);
  };

  add(direct);
  String(rawText || '')
    .split(/[\s,;|]+/)
    .forEach(add);

  const tokenMatches = String(rawText || '').match(
    /(?:ce_[a-zA-Z0-9_*]+|@[A-Z][A-Za-z0-9_]+|[A-Za-z_][A-Za-z0-9_$.]*\([^)]*\)|[A-Z][A-Za-z0-9_$.]{3,}|[a-zA-Z0-9_.\/-]+\.(?:java|mdx|md|sql|yml|yaml|json|js|jsx|ts|tsx))/g
  ) || [];
  tokenMatches.forEach(add);

  const ranked = [...candidates].sort((a, b) => b.length - a.length);
  for (const candidate of ranked) {
    if (!isInterestingTerm(candidate) && !hasMultiPageMatch(candidate)) continue;
    if (hasMultiPageMatch(candidate)) return candidate;
  }
  return null;
}

function resultBadges(result, term) {
  const source = [term, result.title, result.permalink, result.excerpt]
    .filter(Boolean)
    .join(' ');
  const tokens = source.match(/(?:ce_[a-z0-9_]+|@[A-Z][A-Za-z0-9_]+|[A-Z][A-Za-z0-9_$.]*(?:Step|Resolver|Factory|Controller|Service|Repository|Session|Config|Hook|Pipeline|Engine|Transformer|Interceptor|Provider)|[a-zA-Z_][a-zA-Z0-9_$.]*\([^)]*\)|[a-zA-Z0-9_.\/-]+\.(?:java|mdx|md|sql|yml|yaml|json|js|jsx|ts|tsx))/g) || [];
  return [...new Set(tokens.map((v) => v.trim()))].slice(0, 3);
}

export default function GlobalTermLookup() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const history = useHistory();

  useEffect(() => {
    const onClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('a, button, .ce-search-card')) return;

      const extracted = extractTerm(target);
      if (!extracted) return;
      const resolvedTerm = findBestSearchTerm(extracted);
      if (!resolvedTerm) return;

      event.preventDefault();
      setTerm(resolvedTerm);
      setOpen(true);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open]);

  const results = useMemo(() => searchDocs(term, 200), [term]);
  const badges = useMemo(() => toBadges(term), [term]);

  const go = (path) => {
    setOpen(false);
    history.push(path);
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="ce-search-overlay" role="dialog" aria-modal="true">
      <div className="ce-search-card ce-term-card" onClick={(e) => e.stopPropagation()}>
        <div className="ce-search-head">
          <div className="ce-search-title">References</div>
          <div className="ce-search-close-hint">Press Esc to close</div>
        </div>
        <div className="ce-search-term">{term}</div>
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
            results.map((r) => {
              const rowBadges = resultBadges(r, term);
              return (
                <button key={`${term}-${r.id}`} className="ce-search-item" type="button" onClick={() => go(r.permalink)}>
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
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
