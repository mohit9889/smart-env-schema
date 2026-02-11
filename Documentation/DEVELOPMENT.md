# Development Guide

## Project Structure

```
smart-env-validator/
├── src/
│   ├── core/              # Core validation logic
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── config.ts      # defineConfig helper
│   │   ├── parser.ts      # .env file parser
│   │   └── validator.ts   # Main validation logic
│   ├── utils/             # Utilities
│   │   └── formatter.ts   # Error formatting
│   ├── cli/               # CLI implementation
│   │   └── commands/      # CLI commands
│   │       ├── init.ts
│   │       ├── validate.ts
│   │       └── check.ts
│   ├── cli.ts             # CLI entry point
│   └── index.ts           # Main entry point
├── example/               # Example usage
├── dist/                  # Compiled output
└── package.json
```

## Setup for Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Watch mode (for development):**
   ```bash
   npm run dev
   ```

## Testing the Package Locally

### Method 1: Using the example

> **Note:** To run the TypeScript configuration directly, you need `ts-node`. We've added it as a dev dependency.

```bash
# Build the package (in the root directory)
npm run build

# Go to example directory
cd example

# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local with your values
# Then try the CLI commands (using ts-node to load the .ts config):
node -r ts-node/register ../dist/cli.js validate
node -r ts-node/register ../dist/cli.js check
```

### Method 2: npm link

```bash
# In the package directory
npm run build
npm link

# In your test project
npm link smart-env-validator

# Now you can use it like:
import { env } from 'smart-env-validator';
```

### Method 3: Local install

```bash
# In your test project
npm install /path/to/smart-env-validator
```

## Next Steps for V1

### Must-Do Before Publishing

- [ ] Test with real .env files
- [ ] Test all CLI commands
- [ ] Test TypeScript type generation
- [ ] Test JavaScript compatibility
- [ ] Add proper error handling for edge cases
- [ ] Test on Windows, macOS, Linux

### Nice-to-Have for V1

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Better TypeScript config loading (handle ts-node, tsx, etc.)
- [ ] Improve error messages with more context
- [ ] Add more validation examples to README

### For V1.1

- [ ] `npx smart-env fix` command (auto-fix missing vars)
- [ ] Documentation generation
- [ ] Drift detection
- [ ] Better secrets detection/redaction

### For V1.2+

- [ ] VS Code extension
- [ ] Framework plugins (Vite, Next.js, etc.)
- [ ] Remote config support
- [ ] Migration helpers

## Publishing to NPM

1. **Update version in package.json**

   ```json
   "version": "0.1.0"
   ```

2. **Build:**

   ```bash
   npm run build
   ```

3. **Test the package:**

   ```bash
   npm pack
   # This creates smart-env-validator-0.1.0.tgz
   # Install it in a test project to verify
   ```

4. **Publish:**

   ```bash
   npm publish
   ```

5. **Create a git tag:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

## Troubleshooting

### TypeScript config not loading

Currently, the package requires the config to be compiled JavaScript. For proper TypeScript support, you'll need to:

- Add ts-node or tsx as a dependency
- Use dynamic import with proper TypeScript handling
- Or compile env.config.ts during build

### CLI not found

Make sure you've run `npm run build` and the shebang is correct in `dist/cli.js`.

### Type definitions not working

The types are generated during build. Make sure:

- You've run `npm run build`
- The `types` field in package.json points to the right file
- Your IDE is picking up the types (try restarting TypeScript server)

## Common Development Tasks

### Adding a new CLI command

1. Create command file in `src/cli/commands/yourcommand.ts`
2. Export a function that implements the command
3. Add it to `src/cli.ts`
4. Rebuild with `npm run build`

### Adding a new validator

1. Add logic to `src/core/validator.ts`
2. Update types in `src/core/types.ts` if needed
3. Add tests
4. Update README with examples

### Improving error messages

1. Edit `src/utils/formatter.ts`
2. Test with various error scenarios
3. Make sure colors work in different terminals

## Resources

- [Zod Documentation](https://zod.dev)
- [Commander.js](https://github.com/tj/commander.js)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

## Questions?

Open an issue on GitHub or reach out!
