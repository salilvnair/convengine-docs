# ConvEngine Docs - AGENT Guide

This file is a detailed orientation guide for humans and LLM agents working inside the `convengine-docs` repository.

The goal is to give any agent a strong head start on:

- the stack
- the content model
- how docs are wired
- how search/version switching works
- which components are reusable
- how to make changes safely without breaking builds or navigation

## 1. What This Repository Is

`convengine-docs` is the documentation site for the ConvEngine ecosystem.

It documents:

- the framework (`convengine`)
- consumer integration patterns
- API contracts
- deep runtime internals
- examples and release history

This repo is not just "markdown files." It is a Docusaurus site with:

- dual versioned doc trees (`v1` and `v2`)
- custom React components used inside MDX
- custom search indexing
- version-aware navigation behavior

## 2. Technology Stack

From `package.json`, the active stack is:

- Docusaurus `3.9.2`
- React `19`
- React DOM `19`
- Mantine `8`
- MDX / `@mdx-js/react`
- Prism for code blocks
- React Flow (used by custom flow visualization components inside docs)
- Bulma and custom CSS
- Node `>=20`

This matters because:

- docs pages can contain interactive React components, not just prose
- version switching and search are custom-enhanced
- MDX component behavior is part of the product, not an afterthought

## 3. High-Level Site Architecture

This site uses Docusaurus with two separate docs plugin instances:

- `v2` docs mounted at `/docs/v2`
- `v1` docs mounted at `/docs/v1`

This is configured in:

- `docusaurus.config.js`

Key architectural decision:

- versioning is implemented as separate plugin instances and separate sidebars, not Docusaurus built-in version snapshots

That means path and sidebar management are explicit and easy to customize, but changes need to stay consistent across:

- `docs/v1`
- `docs/v2`
- `sidebars.v1.js`
- `sidebars.v2.js`
- the custom root-level version-switch logic

## 4. Important Top-Level Files

### `docusaurus.config.js`

This is the main site configuration.

It controls:

- Docusaurus plugins
- navbar
- footer
- docs mount points
- edit URLs
- Prism languages
- theme CSS

It is also where top-nav labels are manually defined.

Important implication:

- changing a page title updates doc-sidebars (auto-generated labels)
- but top navbar labels in `themeConfig.navbar.items` may still need manual updates

### `sidebars.v2.js` / `sidebars.v1.js`

These define the doc sidebars.

Important truth:

- the item IDs are path-based (for example `examples`, `consumer/new-consumer-onboarding`)
- top-level labels in the sidebar generally come from document titles unless overridden by category labels

If a user says "change the side nav name," confirm whether they mean:

- the doc page title/frontmatter
- the sidebar category label
- the top navbar label

Those are different surfaces.

### `scripts/generate-docs-index.mjs`

This script generates searchable indexes for the docs.

It:

- walks `docs/v2` and `docs/v1`
- strips frontmatter
- extracts titles
- generates permalinks
- builds cleaned content excerpts
- emits:
  - `src/data/docs-index-v2.json`
  - `src/data/docs-index-v1.json`
  - `src/data/docs-index.json`

This script runs automatically on:

- `npm run start`
- `npm run build`
- `npm run serve`

If frontmatter breaks, title extraction and search indexing can degrade.

### `src/theme/Root.js`

This is one of the most important custom files in the repo.

It adds:

- Mantine provider wrapping
- docs-command palette mounting
- global term lookup mounting
- version-aware path mapping between `v1` and `v2`
- localStorage-backed version preference
- TOC show/hide UI state
- dynamic navbar doc-link rewriting based on active version

This file is the reason the docs feel like a custom product rather than a stock Docusaurus install.

### `src/utils/docsSearch.js`

This is the custom in-browser search logic.

It:

- selects the active version's index
- normalizes search queries
- scores documents by title/content match
- builds excerpts around matched query text

This means search behavior is intentionally local and lightweight, not an external Algolia setup.

## 5. Content Layout

The docs content is split into:

- `docs/v2/*`
- `docs/v1/*`

For `v2`, the main sections are:

- top-level landing/reference pages:
  - `overview`
  - `architecture`
  - `examples`
  - `faq`
  - `local-development`
  - `version-history`
- `consumer/*`
  - onboarding and integration docs
- `api/*`
  - REST / stream / Java / audit-trace docs
- `deep-dive/*`
  - runtime internals, pipeline, data model, gotchas, feature details

This split is intentional:

- top-level pages are what most users discover first
- `consumer` is task-oriented
- `api` is reference-oriented
- `deep-dive` is architecture and runtime truth

## 6. Custom MDX Component System

This repo uses a reusable custom MDX component set under:

- `src/components/convengine/*`

The export surface is aggregated in:

- `src/components/convengine/index.js`

Common components include:

- `FlowStep`
- `Decision`
- `DbTable`
- `Conversation`
- `User`
- `Assistant`
- `SchemaBlock`
- `Highlight`
- `CodeBlockToggle`
- `FileRef`
- `MethodRef`
- `ChatBubble`
- `CodeWindow`
- `EngineDebugFlow`
- `CePopup`
- `PipelineStepList`

These components are a major part of how the docs communicate.

### What they are for

- `DbTable`
  - structured configuration and behavior tables
- `Conversation` / `User` / `Assistant`
  - turn-by-turn conversational examples
- `EngineDebugFlow`
  - flow-map style step visualizations (this is where React Flow matters)
- `CodeBlockToggle`
  - large code examples in collapsible blocks
- `Highlight`
  - callout boxes for warnings, tips, and important notes
- `FileRef` / `MethodRef`
  - inline semantic references to files and methods
- `PipelineStepList`
  - canonical runtime step sequences

When updating docs, prefer these components over improvised repetitive MDX markup.

## 7. Search and Discovery Model

This repo implements its own doc search index rather than delegating to an external search service.

### How search works

1. `scripts/generate-docs-index.mjs` builds JSON indexes from markdown/MDX.
2. `src/utils/docsSearch.js` loads and scores those indexes in the browser.
3. UI search components consume that scoring logic.

Relevant search UI pieces:

- `src/components/search/DocsCommandPalette.jsx`
- `src/components/search/DocTermPopup.jsx`
- `src/components/search/GlobalTermLookup.jsx`

This means:

- frontmatter titles matter a lot
- broken frontmatter can degrade search quality
- docs are searchable by cleaned raw content, not just headings

## 8. Version Switching Model

Version switching is custom, and that matters for maintenance.

The docs do not simply render two isolated sites. `Root.js` actively:

- detects active version from pathname or stored preference
- rewrites navbar doc links to the current version
- maps current page to the equivalent page in the other version when possible
- falls back to `/docs/{version}/overview` when no equivalent page exists

Important maintenance rule:

When you add or remove a page in `v2` or `v1`, think about:

- whether the corresponding version should have a matching path
- how the version switcher should behave for that page

## 9. Frontmatter Rules

Every doc page should have valid frontmatter.

Typical fields:

- `title`
- `sidebar_position`
- `hide_table_of_contents`

Critical rule:

- the frontmatter opening `---` must exist
- the closing `---` must exist

If the opening delimiter is missing, the site may render metadata as visible page content and title extraction/search parsing may degrade.

This is a common MDX failure mode and should be checked first when a page starts showing raw metadata.

## 10. Build and Validation Workflow

Primary scripts:

- `npm run start`
- `npm run build`
- `npm run serve`
- `npm run clear`

Because `prestart`, `prebuild`, and `preserve` run the docs-index generator, the normal validation flow is:

1. edit docs or components
2. run `npm run build`
3. confirm:
  - MDX compiles
  - links are valid enough for build
  - indexes regenerate cleanly

This repo should usually be validated with a full Docusaurus build after meaningful doc changes.

## 11. Design Intent of the Docs Site

This site is not meant to look like stock Docusaurus.

The design intent includes:

- custom visual components
- rich conversational and flow examples
- productized version switching
- operator-friendly search
- visually distinct callouts and code blocks

The docs are a user-facing product surface. Changes should preserve that.

Avoid:

- flattening everything into plain markdown when a visual component improves comprehension
- introducing generic documentation phrasing when the repo already has strong domain-specific language
- breaking visual consistency between `v1` and `v2` without a clear reason

## 12. How to Make Safe Documentation Changes

### When updating framework behavior docs

Cross-check against:

- `../convengine/src/main/resources/sql/ddl*.sql`
- `../convengine/src/main/java/...`
- `docs/v2/version-history.mdx`

The docs should reflect the codebase that exists now, not stale historical assumptions.

### When renaming a page

Check all of these:

1. page frontmatter `title`
2. references in other docs
3. top navbar label in `docusaurus.config.js` if it points to that page generically
4. search phrasing if users rely on older labels

### When changing examples

Check:

- example prose
- SQL/DML snippets
- linked page names
- flow-map labels

Examples are often reused by both humans and LLMs as "how the system works," so stale examples are unusually harmful.

### When changing deep-dive content

These pages are used as architecture truth.

Keep them:

- code-aligned
- enum-accurate
- explicit about what is current behavior vs old behavior

## 13. Relationship to Other Repositories

This repo sits between:

- `convengine`
  - the actual framework source
- `convengine-ui`
  - the developer-facing runtime UI

The ideal consistency model is:

- `convengine` defines the runtime truth
- `convengine-docs` explains it accurately
- `convengine-ui` visualizes it operationally

If backend contracts change, the docs often need to change even if markdown still builds.

## 14. Common Failure Modes in This Repo

### Broken frontmatter

Symptoms:

- raw `title:` text appears on the page
- sidebar labels may not behave as expected
- search index title extraction may be wrong

### Navbar / sidebar mismatch

Symptoms:

- sidebar shows new page title
- top navbar still shows old generic label

Cause:

- navbar labels are manual in `docusaurus.config.js`

### Stale docs after code changes

Symptoms:

- examples or deep dives describe old enums, old phases, or old nullability rules

Cause:

- docs not updated when `convengine` behavior changed

### Search oddities

Symptoms:

- expected page not found
- excerpt text looks noisy

Cause:

- frontmatter or MDX shape changed in a way that affects content cleanup/index extraction

## 15. Best First Files to Read

If you are new:

1. `docusaurus.config.js`
2. `sidebars.v2.js`
3. `scripts/generate-docs-index.mjs`
4. `src/theme/Root.js`
5. `src/utils/docsSearch.js`
6. `src/components/convengine/index.js`
7. `docs/v2/overview.mdx`
8. `docs/v2/version-history.mdx`
9. `docs/v2/deep-dive/index.mdx`

## 16. Writing Rules for Agents

When writing docs here:

- prefer current-state wording over historical ambiguity
- call out when older docs were wrong and what changed
- use the existing custom components where they improve comprehension
- keep version-specific docs accurate to that version's behavior
- verify names in sidebars and navbar separately

For top-level docs, optimize for:

- clarity
- architectural accuracy
- operational usefulness

For deep-dive docs, optimize for:

- code alignment
- explicit contracts
- low ambiguity

For examples, optimize for:

- realism
- runnable mental models
- accurate table/step names

## 17. One-Sentence Operating Rule

This repo is a version-aware, component-rich Docusaurus product that translates the real ConvEngine codebase into accurate, navigable, and operationally useful documentation; good changes preserve both correctness and discoverability.
