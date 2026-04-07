# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a college-level CS student project (SE467) — a backend for the **Stratum** news application. The goal is both to build a working product and to provide a learning experience. When assisting, highlight design decisions, scalability/performance implications, security considerations, and maintainability concerns to help the student grow as a developer.

## Stack

- **Runtime**: Node.js 25
- **Framework**: Express 5
- **Language**: JavaScript (TypeScript may be added)

## Commands

```bash
npm start       # Start the server
npm run dev     # Start with hot-reload (if configured)
npm test        # Run tests (if configured)
```

## Code Guidelines

These apply to all code added or modified:

- **File headers**: Every file should have a top-level comment explaining its purpose.
- **Function comments**: Every function should have a comment describing what it does, its parameters, and return value.
- **Inline comments**: Add a comment above any added or modified code segment explaining how it works and why.
- **UI/design**: For frontend behavior and styling, refer to `/doc` for design guidelines and branding.

## Learning Goals to Highlight

When reviewing or writing code, proactively call out:

- **Scalability**: flag bottlenecks and suggest how the code holds up under load
- **Security**: identify vulnerabilities (e.g., injection, auth issues) and suggest mitigations
- **Maintainability**: note readability or structural issues and how to improve them
- **Testing**: encourage tests that cover normal paths, edge cases, and failure modes
