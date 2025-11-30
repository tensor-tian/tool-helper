import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { z } from "zod";
import {
  createAuxiliaryTypeStore,
  zodToTs,
  printNode,
  createTypeAlias,
} from "zod-to-ts";
import { zerialize, type ZodTypes } from "zodex";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Helper functions to pass to plugin
const toJSONSchema = (s: z.ZodTypeAny): string => {
  return JSON.stringify(z.toJSONSchema(s), null, 2);
};

const toTSDefinition = (name: string, s: z.ZodTypeAny): string => {
  const auxiliaryTypeStore = createAuxiliaryTypeStore();
  const { node } = zodToTs(s, { auxiliaryTypeStore });
  const typeAlias = createTypeAlias(
    node,
    `${name.charAt(0).toUpperCase() + name.slice(1)}Parameters`
  );
  return printNode(typeAlias);
};

const serializeZod = (s: z.ZodTypeAny): string => {
  return JSON.stringify(zerialize(s as ZodTypes), null, 2);
};

const deps = {
  z,
  toJSONSchema,
  toTSDefinition,
  serializeZod,
};

describe("ToolRC Plugin", () => {
  it("should load and execute plugin with all dependencies", () => {
    // Read the bundled plugin code
    const code = readFileSync(join(__dirname, "dist/toolrc.js"), "utf-8");

    // Execute plugin code
    const fn = new Function(`${code}; return ToolPlugin;`);
    const plugin = fn();

    expect(plugin).toBeTruthy();
    expect(typeof plugin.defineTool).toBe("function");

    // Create tool factory with dependencies
    const toolFactory = plugin.defineTool(deps);

    expect(toolFactory).toBeTruthy();
    expect(toolFactory.defaultParams).toBeTruthy();
    expect(typeof toolFactory.createTool).toBe("function");

    // Create a tool with custom parameters
    const tool = toolFactory.createTool({ command: "nginx" });

    expect(tool).toBeTruthy();
    expect(tool.name).toBe("findServicePort");
    expect(tool.description).toBe(
      "Find the tcp port listened by a service command"
    );
    expect(tool.parameters).toBeTruthy();
    expect(tool.schema).toBeTruthy();
    expect(tool.definition).toBeTruthy();
    expect(tool.type).toBe("cmd");
    expect(Array.isArray(tool.extra.cmd)).toBe(true);
    expect(tool.extra.cmd).toContain("nginx");
  });

  it("should generate valid JSON schema", () => {
    const code = readFileSync(join(__dirname, "dist/toolrc.js"), "utf-8");
    const fn = new Function(`${code}; return ToolPlugin;`);
    const plugin = fn();

    const toolFactory = plugin.defineTool(deps);

    const tool = toolFactory.createTool({ command: "test" });

    // Validate JSON schema
    const schema = JSON.parse(tool.parameters);
    expect(schema.$schema).toBeTruthy();
    expect(schema.type).toBe("object");
    expect(schema.properties).toBeTruthy();
    expect(schema.properties.command).toBeTruthy();
    expect(schema.properties.command.type).toBe("string");
  });

  it("should generate valid TypeScript definition", () => {
    const code = readFileSync(join(__dirname, "dist/toolrc.js"), "utf-8");
    const fn = new Function(`${code}; return ToolPlugin;`);
    const plugin = fn();

    const toolFactory = plugin.defineTool(deps);

    const tool = toolFactory.createTool({ command: "test" });

    // Validate TypeScript definition
    expect(tool.definition).toContain("command");
    expect(tool.definition).toContain("string");
  });

  it("should match snapshot for tool object", () => {
    const code = readFileSync(join(__dirname, "dist/toolrc.js"), "utf-8");
    const fn = new Function(`${code}; return ToolPlugin;`);
    const plugin = fn();

    const toolFactory = plugin.defineTool({
      z,
      toJSONSchema,
      toTSDefinition,
      serializeZod,
    });

    const tool = toolFactory.createTool({ command: "nginx" });

    expect(tool).toMatchSnapshot();
  });
});
