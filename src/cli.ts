#!/usr/bin/env node

import { Command } from "commander";
import { validateCommand } from "./cli/commands/validate";
import { checkCommand } from "./cli/commands/check";
import { initCommand } from "./cli/commands/init";
import { fixCommand } from "./cli/commands/fix";
import { docsCommand } from "./cli/commands/docs";

const program = new Command();

program
  .name("smart-env")
  .description("Smart environment variable validation")
  .version("0.1.0");

// Init command
program
  .command("init")
  .description("Initialize env.config with example schema")
  .action(initCommand);

// Validate command
program
  .command("validate")
  .description("Validate current environment against schema")
  .action(validateCommand);

// Check command
program
  .command("check")
  .description("Check for missing/extra variables compared to .env.example")
  .action(checkCommand);

// Fix command
program
  .command("fix")
  .description("Interactively fix missing environment variables")
  .action(fixCommand);

// Docs command
program
  .command("docs")
  .description("Generate environment variable documentation")
  .action(docsCommand);

program.parse();
