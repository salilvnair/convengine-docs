import fs from 'fs';
import path from 'path';

const docsDir = path.resolve(process.cwd(), 'docs');
const outFile = path.resolve(process.cwd(), 'src/data/docs-index.json');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function stripFrontmatter(src) {
  return src.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function parseTitle(src, fallback) {
  const match = src.match(/^---\n[\s\S]*?\ntitle:\s*(.+?)\n[\s\S]*?\n---\n/m);
  if (match) return match[1].replace(/^['"]|['"]$/g, '').trim();
  return fallback;
}

function toPermalink(relativePath) {
  const withoutExt = relativePath.replace(/\.(md|mdx)$/i, '');
  const normalized = withoutExt.replace(/\\/g, '/');
  const noIndex = normalized.endsWith('/index') ? normalized.slice(0, -('/index'.length)) : normalized;
  return noIndex ? `/docs/${noIndex}` : '/docs';
}

function cleanupContent(src) {
  return src
    .replace(/^import\s.+$/gm, ' ')
    .replace(/^export\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\[[^\]]+\]\([^\)]+\)/g, ' ')
    .replace(/`/g, ' ')
    .replace(/[#>*\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rawSearchContent(src) {
  return src
    .replace(/^import\s.+$/gm, ' ')
    .replace(/^export\s.+$/gm, ' ')
    .replace(/`/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerpt(content, max = 220) {
  if (!content) return '';
  return content.slice(0, max) + (content.length > max ? '…' : '');
}

const files = walk(docsDir);
const records = files.map((abs) => {
  const rel = path.relative(docsDir, abs);
  const raw = fs.readFileSync(abs, 'utf8');
  const titleFallback = path.basename(rel, path.extname(rel)).replace(/[-_]/g, ' ');
  const title = parseTitle(raw, titleFallback);
  const noFm = stripFrontmatter(raw);
  const plain = cleanupContent(noFm);
  const rawContent = rawSearchContent(noFm);
  return {
    id: rel.replace(/\\/g, '/'),
    title,
    permalink: toPermalink(rel),
    content: plain,
    rawContent,
    excerpt: excerpt(plain),
  };
});

fs.writeFileSync(outFile, JSON.stringify(records, null, 2));
console.log(`Generated docs index: ${records.length} documents -> ${path.relative(process.cwd(), outFile)}`);
