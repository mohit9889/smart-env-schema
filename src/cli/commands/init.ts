import * as fs from "fs";
import * as path from "path";

const EXAMPLE_CONFIG_TS = `import { defineConfig, z } from 'smart-env-schema';

export default defineConfig({
  schema: {
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    
    // Database
    DATABASE_URL: z.string().url(),
    
    // Optional: API Keys
    // API_KEY: z.string().min(20),
  },
  
  // Load order: first file wins
  envFiles: ['.env.local', '.env'],
  
  // Variables required in production
  requiredInProduction: ['DATABASE_URL'],
  
  // Descriptions for documentation
  descriptions: {
    DATABASE_URL: 'PostgreSQL connection string',
    PORT: 'Server port number',
  },
});
`;

const EXAMPLE_CONFIG_JS = `const { defineConfig, z } = require('smart-env-schema');

module.exports = defineConfig({
  schema: {
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    
    // Database
    DATABASE_URL: z.string().url(),
    
    // Optional: API Keys
    // API_KEY: z.string().min(20),
  },
  
  // Load order: first file wins
  envFiles: ['.env.local', '.env'],
  
  // Variables required in production
  requiredInProduction: ['DATABASE_URL'],
  
  // Descriptions for documentation
  descriptions: {
    DATABASE_URL: 'PostgreSQL connection string',
    PORT: 'Server port number',
  },
});
`;

const EXAMPLE_ENV = `# Example environment variables
# Copy this file to .env.local and fill in your values

NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# API Keys (optional)
# API_KEY=your_api_key_here
`;

export async function initCommand() {
  const prompts = require("prompts");

  // Ask user for preferences
  const response = await prompts([
    {
      type: "select",
      name: "language",
      message: "Which language are you using?",
      choices: [
        { title: "TypeScript", value: "ts" },
        { title: "JavaScript", value: "js" },
      ],
      initial: 0,
    },
    {
      type: "confirm",
      name: "addGitignore",
      message: "Add .env files to .gitignore?",
      initial: true,
    },
  ]);

  const useTypeScript = response.language === "ts";
  const configExt = useTypeScript ? "ts" : "js";
  const configPath = path.join(process.cwd(), `env.config.${configExt}`);
  const exampleEnvPath = path.join(process.cwd(), ".env.example");

  // Check if config already exists
  if (fs.existsSync(configPath)) {
    console.error(`❌ env.config.${configExt} already exists`);
    process.exit(1);
  }

  // Create config file
  const configContent = useTypeScript ? EXAMPLE_CONFIG_TS : EXAMPLE_CONFIG_JS;
  fs.writeFileSync(configPath, configContent, "utf-8");
  console.log(`✓ Created env.config.${configExt}`);

  // Create .env.example if it doesn't exist
  if (!fs.existsSync(exampleEnvPath)) {
    fs.writeFileSync(exampleEnvPath, EXAMPLE_ENV, "utf-8");
    console.log("✓ Created .env.example");
  }

  // Update .gitignore if requested
  if (response.addGitignore) {
    const gitignorePath = path.join(process.cwd(), ".gitignore");
    const gitignoreContent = fs.existsSync(gitignorePath)
      ? fs.readFileSync(gitignorePath, "utf-8")
      : "";

    if (!gitignoreContent.includes(".env")) {
      const newContent = gitignoreContent + "\n# Environment variables\n.env\n.env.local\n.env.*.local\n";
      fs.writeFileSync(gitignorePath, newContent, "utf-8");
      console.log("✓ Updated .gitignore");
    }
  }

  console.log("");
  console.log("Next steps:");
  console.log("  1. Copy .env.example to .env.local");
  console.log("  2. Fill in your environment variables");
  console.log("  3. Run: npx smart-env validate");
  console.log("");
}
