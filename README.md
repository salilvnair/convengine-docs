# ConvEngine Docs

Documentation site for ConvEngine (Java).

## Version Alignment

- Current ConvEngine artifact documented here: `2.0.6`

## Sections

- Overview
- Architecture
- Examples
- Local Development
- Consumer Guide
- API Reference
- Deep Dive (file-level wiki)

## Local run

```bash
npm install
npm run start
```

## Build

```bash
npm run build
```

## Notes

This docs content is aligned to the latest ConvEngine runtime code (pipeline hooks, reset behavior, audit trace DTOs, intent-lock schema flow, cross-database persistence hardening, scoped sticky intent behavior, audit metadata split between `inputParams` and `userInputParams`, schema resolver provider refactor, centralized audit stages, and centralized payload/input-param keys).
