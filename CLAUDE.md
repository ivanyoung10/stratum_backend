# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Architecture

This is a Next.js (App Router) + Supabase application called "Stratum App" — a news site. It uses React 19, TypeScript, Tailwind CSS, and shadcn/ui components.

### Authentication System

Auth is cookie-based using `@supabase/ssr`. There are three Supabase client factories:

- **`lib/supabase/client.ts`** — Browser client (`createBrowserClient`), used in `"use client"` components
- **`lib/supabase/server.ts`** — Server client (`createServerClient`) with Next.js cookie integration, used in Server Components and Route Handlers
- **`lib/supabase/proxy.ts`** — `updateSession()` function used by middleware to validate/refresh sessions on every request

Route protection is handled by middleware in `proxy.ts` (root). Unauthenticated users are redirected to `/auth/login` for any route except `/` and `/auth/*`.

### Routing

- `/` — Public home page
- `/auth/*` — Login, sign-up, password reset, email confirmation flows
- `/protected/*` — Authenticated routes (guarded by middleware)

### UI

- shadcn/ui components in `components/ui/` (New York style, Lucide icons)
- `cn()` utility in `lib/utils.ts` for Tailwind class merging (clsx + tailwind-merge)
- Dark mode via `next-themes` with class-based Tailwind dark mode
- Path alias: `@/*` maps to project root

### Environment Variables

Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.

## Coding Guidelines

- **Single responsibility**: Functions should do one thing only. If a function is doing multiple things, break it into smaller, focused functions.

- **Mobile First**: This app should be designed for mobile-layout first and desktop second.

- **Semantic HTML**: Use semantic html instead of divs where possible for greatest SEO/Accessibility

- **Meaningful comments**: Write code in human-readable format + succinct comments

- **SSR**: Keep components/pages server-side rendered as much as possible