import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Convert a string to snake_case format
 * e.g., "MyTool" -> "my_tool", "myTool" -> "my_tool", "my-tool" -> "my_tool"
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2") // Handle camelCase
    .replace(/(-)/g, "_") // Replace hyphens with underscores
    .toLowerCase();
}

export async function create(toolName: string, targetDir: string) {
  const snakeCaseName = toSnakeCase(toolName);
  const toolDirName = `tool_${snakeCaseName}`;
  const toolDir = path.join(targetDir, toolDirName);
  // Use src/template to get the original source files, not compiled ones
  const templateDir = path.join(__dirname, "../src/template");

  console.log(`Creating tool "${toolName}" at ${toolDir}...`);

  // Create tool directory
  await fs.mkdir(toolDir, { recursive: true });

  // Copy template files
  const files = ["package.json", "toolrc.ts", "tsconfig.json"];

  for (const file of files) {
    const templateFile = path.join(templateDir, file);
    const targetFile = path.join(toolDir, file);

    let content = await fs.readFile(templateFile, "utf-8");

    // Replace placeholders in files
    if (file === "package.json") {
      content = content.replace(/{{TOOL_NAME}}/g, snakeCaseName);
    } else if (file === "toolrc.ts") {
      content = content.replace(/{{TOOL_NAME}}/g, snakeCaseName);
      content = content.replace(/{{TOOL_FUNCTION_NAME}}/g, toolName);
      content = content.replace(/{{TOOL_DESCRIPTION}}/g, `Tool: ${toolName}`);
      content = content.replace(/{{TOOL_WORKING_DIR}}/g, targetDir);
    }

    await fs.writeFile(targetFile, content, "utf-8");
  }

  console.log(`✓ Tool "${toolName}" created successfully!`);
  console.log(`  Directory: ${toolDirName}`);
  console.log(`  Files created:`);
  console.log(`    - package.json`);
  console.log(`    - toolrc.ts`);
  console.log(`    - tsconfig.json`);
  console.log(`  Next steps:`);
  console.log(`    cd ${toolDirName}`);
  console.log(`    pnpm link --global tool-hub-cli`);
  console.log(`    pnpm install`);
  console.log(`    pnpm build`);
}
