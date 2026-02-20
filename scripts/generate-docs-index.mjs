import fs from 'fs';
import path from 'path';

const docsDir = path.resolve(process.cwd(), 'docs/v2');
const v1DocsDir = path.resolve(process.cwd(), 'docs/v1');
const outFileV2 = path.resolve(process.cwd(), 'src/data/docs-index-v2.json');
const outFileV1 = path.resolve(process.cwd(), 'src/data/docs-index-v1.json');
const outFileCompat = path.resolve(process.cwd(), 'src/data/docs-index.json');

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

function buildRecords(rootDir, version) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }
  const files = walk(rootDir);
  return files.map((abs) => {
    const rel = path.relative(rootDir, abs);
    const raw = fs.readFileSync(abs, 'utf8');
    const titleFallback = path.basename(rel, path.extname(rel)).replace(/[-_]/g, ' ');
    const title = parseTitle(raw, titleFallback);
    const noFm = stripFrontmatter(raw);
    const plain = cleanupContent(noFm);
    const rawContent = rawSearchContent(noFm);
    const permalink = toPermalink(rel);
    return {
      id: rel.replace(/\\/g, '/'),
      version,
      title,
      permalink:
        version === 'v1'
          ? permalink.replace(/^\/docs\b/, '/docs/v1')
          : permalink.replace(/^\/docs\b/, '/docs/v2'),
      content: plain,
      rawContent,
      excerpt: excerpt(plain),
    };
  });
}

const recordsV2 = buildRecords(docsDir, 'v2');
const recordsV1 = buildRecords(v1DocsDir, 'v1');
const recordsCombined = [...recordsV2, ...recordsV1];

fs.writeFileSync(outFileV2, JSON.stringify(recordsV2, null, 2));
fs.writeFileSync(outFileV1, JSON.stringify(recordsV1, null, 2));
fs.writeFileSync(outFileCompat, JSON.stringify(recordsCombined, null, 2));

console.log(
  `Generated docs indexes: v2=${recordsV2.length}, v1=${recordsV1.length}, combined=${recordsCombined.length}`
);
