# smart-env-validator

Type-safe environment variable validation with excellent developer experience.

## Features

✅ **Type-safe** - Auto-generates TypeScript types from your schema  
✅ **Runtime validation** - Catches missing/invalid vars before deployment  
✅ **Multi-environment** - Supports `.env.local`, `.env.production`, etc.  
✅ **Great error messages** - Shows exactly what's wrong and how to fix it  
✅ **Zero config** - Works out of the box with sensible defaults  
✅ **Powered by Zod** - Leverage Zod's powerful validation  
✅ **Native TypeScript** - No need for ts-node anymore  
✅ **Interactive CLI** - Fix missing vars and generate docs automatically

## Installation

```bash
npm install smart-env-validator
```

## Quick Start

### 1. Initialize

```bash
npx smart-env init
```

This creates `env.config.ts` with an example schema:

```typescript
import { defineConfig, z } from "smart-env-validator";

export default defineConfig({
  schema: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
  },
});
```

### 2. Create your `.env.local` file

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/mydb
```

### 3. Use in your code

```typescript
import { env } from "smart-env-validator";

// Fully typed and validated!
console.log(env.DATABASE_URL); // string
console.log(env.PORT); // number
console.log(env.NODE_ENV); // 'development' | 'production' | 'test'
```

That's it! 🎉

## CLI Commands

### Initialize (Interactive)

```bash
npx smart-env init
```

Creates `env.config.ts` or `env.config.js` with an interactive setup:
- Choose TypeScript or JavaScript
- Auto-update `.gitignore`

### Validate environment

```bash
npx smart-env validate
```

Checks if your current environment matches the schema.

### Check against .env.example

```bash
npx smart-env check
```

Compares your schema with `.env.example` to find missing or extra variables.

### Fix missing variables

```bash
npx smart-env fix
```

Interactively prompts for missing environment variables and adds them to your chosen `.env` file.

### Generate documentation

```bash
npx smart-env docs
```

Auto-generates a Markdown table of all environment variables with types, requirements, and descriptions.

## Configuration

### Basic Schema

```typescript
import { defineConfig, z } from "smart-env-validator";

export default defineConfig({
  schema: {
    // String
    DATABASE_URL: z.string().url(),

    // Number (coerce converts string to number)
    PORT: z.coerce.number().default(3000),

    // Enum
    NODE_ENV: z.enum(["development", "production", "test"]),

    // Optional
    REDIS_URL: z.string().url().optional(),

    // With validation
    API_KEY: z.string().min(20),
  },
});
```

### Multi-environment Files

```typescript
export default defineConfig({
  schema: {
    /* ... */
  },

  // Simple array (first file wins)
  envFiles: [".env.local", ".env"],

  // Or per-environment
  envFiles: {
    development: [".env.local", ".env.development", ".env"],
    production: [".env.production", ".env"],
    test: [".env.test", ".env"],
  },
});
```

### Production Requirements

```typescript
export default defineConfig({
  schema: {
    /* ... */
  },

  // These MUST be set in production
  requiredInProduction: ["DATABASE_URL", "API_KEY"],
});
```

### Variable Expansion

```typescript
export default defineConfig({
  schema: {
    /* ... */
  },

  // Expand ${VAR_NAME} references
  expand: true,
});
```

Then in your `.env`:

```bash
DATABASE_HOST=localhost
DATABASE_URL=postgresql://${DATABASE_HOST}:5432/mydb
```

### Strict Mode

```typescript
export default defineConfig({
  schema: {
    /* ... */
  },

  // Fail if .env has keys not in schema
  strict: true,
});
```

## Error Messages

Smart-env-validator gives you helpful, actionable error messages:

```
❌ Environment validation failed:

  DATABASE_URL (required)
    ✗ Missing
    📄 Not found in: .env.local, .env
    💡 Add to .env.local:
       DATABASE_URL=postgresql://user:pass@localhost:5432/db

    Or run: npx smart-env fix

  PORT
    ✗ Expected number, received "abc"
    📄 Found in: .env.local (line 3)
    💡 Fix: PORT=3000
```

## Migration from dotenv

1. Install: `npm install smart-env-validator`
2. Run: `npx smart-env init`
3. Define your schema in `env.config.ts`
4. Replace `require('dotenv').config()` with `import { env } from 'smart-env-validator'`

That's it! No other changes needed.

## Why smart-env-validator?

| Feature              | dotenv | envalid | t3-env | **smart-env-validator** |
| -------------------- | ------ | ------- | ------ | ----------------------- |
| Type safety          | ❌     | ❌      | ✅     | ✅                      |
| Runtime validation   | ❌     | ✅      | ✅     | ✅                      |
| Great error messages | ❌     | ❌      | ❌     | ✅                      |
| Multi-environment    | ❌     | ❌      | ✅     | ✅                      |
| CLI tools            | ❌     | ❌      | ❌     | ✅                      |
| Zero config          | ✅     | ❌      | ❌     | ✅                      |

## API Reference

### `defineConfig(config)`

Define your environment configuration.

```typescript
import { defineConfig, z } from 'smart-env-validator';

export default defineConfig({
  schema: { /* Zod schema */ },
  envFiles?: string[] | Record<string, string[]>,
  requiredInProduction?: string[],
  strict?: boolean,
  expand?: boolean,
  descriptions?: Record<string, string>,
});
```

### `env`

Validated environment object. Auto-loads on first access.

```typescript
import { env } from "smart-env-validator";

console.log(env.DATABASE_URL);
```

### `validateEnv(config, customEnv?)`

Manually validate environment (advanced use).

```typescript
import { validateEnv } from "smart-env-validator";

const result = validateEnv(config, process.env);
if (!result.success) {
  console.error(result.errors);
}
```

## TypeScript

Type definitions are auto-generated when you use the package. Your IDE will provide full autocomplete and type checking for `env.*`.

## JavaScript Support

Works perfectly with JavaScript too! You won't get type checking, but you'll still get runtime validation.

```javascript
const { env } = require("smart-env-validator");

console.log(env.DATABASE_URL); // Validated at runtime
```

## License

MIT

## Contributing

Issues and PRs welcome! This is an early version and we're actively improving it.
