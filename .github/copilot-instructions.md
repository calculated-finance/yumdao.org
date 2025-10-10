# AI Coding Agent Instructions

## Project Overview

This is a React application built with the TanStack ecosystem (Router + Query) using TypeScript, Vite, and Tailwind CSS with shadcn/ui components. The project follows modern React patterns with file-based routing and integrated developer tools.

## Architecture & Key Patterns

### TanStack Router (File-Based Routing)

- Routes are defined as files in `src/routes/` - each file exports a `Route` created with `createFileRoute()`
- Root layout is in `src/routes/__root.tsx` using `createRootRouteWithContext<MyRouterContext>()`
- Router context includes QueryClient for seamless TanStack Query integration
- Route tree is auto-generated in `src/routeTree.gen.ts` by the TanStack Router plugin

### TanStack Query Integration

- QueryClient setup in `src/integrations/tanstack-query/root-provider.tsx`
- Context pattern: `getContext()` creates client, `Provider` wraps app
- Router receives queryClient through context for type-safe data fetching

### Component Architecture

- UI components in `src/components/ui/` follow shadcn/ui patterns
- Use `class-variance-authority` (cva) for component variants (see `button.tsx`)
- Radix UI primitives for accessible components
- `cn()` utility in `src/lib/utils.ts` combines `clsx` and `tailwind-merge`

### WalletConnect Integration

- WalletConnect setup using Reown AppKit with wagmi adapter
- Configuration in `src/integrations/walletconnect/config.ts` with project ID from env
- Provider pattern follows TanStack approach: `getContext()` and `Provider` in `src/integrations/walletconnect/provider.tsx`
- Multi-provider setup in `main.tsx`: WalletConnect → TanStack Query → Router
- Custom `WalletConnectButton` component uses `useAppKit` and `useAppKitAccount` hooks

## Development Workflow

### Adding Components

```bash
pnpx shadcn@latest add [component-name]
```

This installs components with proper theming and Tailwind integration.

### Key Scripts

- `pnpm dev` - Start dev server on port 3000
- `pnpm check` - Run prettier + eslint fix (preferred over individual commands)
- `pnpm test` - Run Vitest tests
- `pnpm build` - Build + TypeScript check

### Adding Routes

1. Create file in `src/routes/` (e.g., `about.tsx`)
2. Export Route with `createFileRoute('/about')({ component: YourComponent })`
3. TanStack Router auto-generates route tree
4. Use `<Link to="/about">` for navigation

## Code Conventions

### Styling

- Tailwind CSS with CSS variables for theming
- Dark mode support built into component variants
- Use `cn()` for conditional classes: `cn("base-classes", condition && "conditional-classes")`

### TypeScript

- Strict mode enabled with path aliases (`@/` maps to `src/`)
- Router context typing through module declaration in `main.tsx`
- Component props extend native HTML props with additional variants

### State Management

- TanStack Query for server state
- React useState/useReducer for local state
- Router context for sharing QueryClient across routes
- WalletConnect for blockchain wallet connections and transactions

### Environment Variables

- `VITE_WALLETCONNECT_PROJECT_ID` - Required for WalletConnect integration
- Environment variables must be prefixed with `VITE_` for client-side access

## Development Tools

- Integrated devtools for Router and Query in development
- ESLint config from `@tanstack/eslint-config`
- Prettier for formatting
- Vitest with jsdom for testing React components

## Critical Files

- `src/main.tsx` - App entry point with router/query/walletconnect setup
- `src/routes/__root.tsx` - Root layout with devtools and header
- `src/integrations/walletconnect/config.ts` - WalletConnect configuration
- `src/integrations/walletconnect/provider.tsx` - WalletConnect provider component
- `src/components/Header.tsx` - App header with wallet connect button
- `components.json` - shadcn/ui configuration
- `vite.config.ts` - Build config with TanStack Router plugin
