#!/usr/bin/env node
import { parseArgs, type ParseArgsOptionsConfig } from "node:util";
import { create } from "./create.js";
import { build } from "./build.js";

const argv = process.argv.slice(2);
const command = argv[0];
const args = argv.slice(1);

console.log("Tool Helper CLI");
console.log("Current working directory:", process.cwd());

switch (command) {
  case "create": {
    const options: ParseArgsOptionsConfig = {
      "tool-type": {
        type: "string",
        short: "t",
        default: "cmd",
      },
      name: {
        type: "string",
        short: "n",
      },
    };

    const { values } = parseArgs({
      options,
      args,
      allowPositionals: false,
      strict: true,
    });

    const toolName = values["name"] as string;

    if (!toolName) {
      console.error("Error: Tool name is required");
      console.log("Usage: tool-helper create <name> [options]");
      console.log(
        "  or:  tool-helper create --name <name> [--dir <directory>]"
      );
      process.exit(1);
    }

    const targetDir = process.cwd();
    create(toolName, targetDir).catch((err) => {
      console.error("Error creating tool:", err);
      process.exit(1);
    });
    break;
  }
  case "register": {
    console.log("Register called");
    break;
  }
  case "build": {
    const options: ParseArgsOptionsConfig = {
      configFile: {
        type: "string",
        short: "c",
        default: "toolrc.ts",
      },
    };
    const { values } = parseArgs({
      options,
      args,
      allowPositionals: false,
      strict: true,
    });
    const dir = process.cwd();
    console.log("Building tool in directory:", dir);
    await build(dir, values["configFile"] as string);
    break;
  }
  default: {
    console.log("Unknown command. Supported: create, register");
    break;
  }
}
