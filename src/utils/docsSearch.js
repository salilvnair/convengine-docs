import docsIndex from '@site/src/data/docs-index.json';

function normalize(value) {
  return String(value || '').toLowerCase();
}

function normalizeQuery(value) {
  return normalize(value).replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}

function occurrences(haystack, needle) {
  if (!haystack || !needle) return 0;
  let count = 0;
  let idx = 0;
  while (true) {
    idx = haystack.indexOf(needle, idx);
    if (idx === -1) break;
    count += 1;
    idx += needle.length;
  }
  return count;
}

function buildExcerpt(doc, query) {
  const raw = String(doc.rawContent || doc.content || '');
  if (!raw) return '';
  const q = normalizeQuery(query);
  if (!q) return prettifyExcerpt(doc.excerpt || raw.slice(0, 220));

  const lower = raw.toLowerCase();
  const at = lower.indexOf(q);
  if (at < 0) return prettifyExcerpt(doc.excerpt || raw.slice(0, 220));

  const start = Math.max(0, at - 70);
  const end = Math.min(raw.length, at + q.length + 130);
  const snippet = raw.slice(start, end).trim();
  return prettifyExcerpt(`${start > 0 ? '…' : ''}${snippet}${end < raw.length ? '…' : ''}`);
}

function prettifyExcerpt(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\b[A-Za-z_][A-Za-z0-9_.-]*=/g, ' ')
    .replace(/[{}[\]]/g, ' ')
    .replace(/`/g, ' ')
    .replace(/[#>*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreDoc(doc, q) {
  if (!q) return 0;

  const title = normalize(doc.title || '');
  const rawContent = normalize(doc.rawContent || doc.content || '');
  const content = normalize(doc.content || '');

  let score = 0;
  if (title === q) score += 250;
  if (title.includes(q)) score += 120;
  if (rawContent.includes(q)) score += 80;
  else if (content.includes(q)) score += 40;
  score += occurrences(rawContent, q) * 4;

  return score;
}

export function searchDocs(query, limit = Number.POSITIVE_INFINITY) {
  const q = normalizeQuery(query);
  if (!q) return [];

  const matched = docsIndex
    .map((doc) => ({ ...doc, _score: scoreDoc(doc, q) }))
    .filter((doc) => doc._score > 0)
    .sort((a, b) => b._score - a._score || a.title.localeCompare(b.title))
    .map(({ _score, ...doc }) => ({ ...doc, excerpt: buildExcerpt(doc, q) }));

  if (!Number.isFinite(limit)) return matched;
  return matched.slice(0, Math.max(0, limit));
}

export function docsCount() {
  return docsIndex.length;
}
