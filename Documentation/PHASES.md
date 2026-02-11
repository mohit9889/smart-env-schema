# Project Phases & Feature Checklist

This document tracks the development phases and feature implementation status for `smart-env-schema`.

## V1: Must-Have (Core MVP)

- [x] **Runtime validation with clear errors**
  - [x] Parse `.env` files
  - [x] Validate against a schema (Zod integration)
  - [x] Throw helpful errors on startup if vars are missing/invalid
  - [x] Show which file (`.env`, `.env.local`, etc.) each value came from

- [x] **TypeScript type generation**
  - [x] Auto-generate types from your schema
  - [x] `process.env.DATABASE_URL` becomes type-safe (via `env.DATABASE_URL`)
  - [x] Regenerate on schema changes (handled by TypeScript inference)

- [x] **Multi-environment support**
  - [x] Load order: `.env.local` > `.env.development` > `.env` (configurable)
  - [x] Clear precedence rules (first file wins)
  - [x] Support for `.env.example` as documentation (via `check` command)

- [x] **Basic CLI**
  - [x] `npx smart-env validate` - check if current env is valid
  - [x] `npx smart-env check` - compare against `.env.example`, show missing keys
  - [x] Simple, actionable output

## V1.1: Should-Have (Soon after launch)

- [x] **Improved TypeScript Support**
  - [x] Support `env.config.ts` without user-managed `ts-node` (use `jiti` or `bundle-require`)
  - [x] Seamless ESM/CJS interop for config loading

- [x] **Interactive Init**
  - [x] Detect TypeScript projects and configure accordingly
  - [x] Auto-add `.env` to `.gitignore`

- [x] **Better error messages** (Implemented in V1)
  - [x] Not just "DATABASE_URL is required"
  - [x] Show: expected type, current value (sanitized), which file it came from, suggestion to fix
  - [x] Color-coded CLI output

- [x] **Auto-fix command**
  - [x] `npx smart-env fix` - prompts for missing vars and adds them to appropriate file
  - [x] Asks which environment file to update

- [x] **Documentation generation**
  - [x] Generate markdown table of all env vars from schema
  - [x] Include: name, type, required/optional, description, default value

## V1.2: Nice-to-Have

- [ ] **Secret Masking Helper**
  - [ ] Utility to monkey-patch `console.log` to mask known secrets

- [ ] **Strict Git Hooks**
  - [ ] `smart-env pre-commit` hook to ensure `.env.example` sync

- [ ] **Drift detection**
  - [ ] Warn when your `.env` has keys not in `.env.example` (or vice versa)
  - [ ] Flag unused env vars in your schema

- [ ] **Environment comparison**
  - [ ] `npx smart-env diff dev prod` - show differences between environments

- [ ] **VS Code extension**
  - [ ] Inline validation in `.env` files
  - [ ] Autocomplete from schema
  - [ ] Hover to see descriptions

- [ ] **Framework plugins**
  - [ ] Vite plugin
  - [ ] Next.js integration
  - [ ] Express middleware (inject validated env into `req.env`)

## Later / V2

- [ ] **Async Validation**
  - [ ] Support async `.refine()` (e.g. ping database)

- [ ] **Secrets scanning** (detect API keys, tokens)
- [ ] **Remote config support** (fetch from Vault, AWS Secrets Manager)
- [ ] **Encryption for sensitive local values**
- [ ] **CI/CD integration helpers**
- [ ] **Migration/deprecation tooling**
