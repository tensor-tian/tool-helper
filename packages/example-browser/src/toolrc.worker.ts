// toolrc.worker.ts - WebWorker script for toolrc plugin
import { z } from "zod";
import {
  createAuxiliaryTypeStore,
  zodToTs,
  printNode,
  createTypeAlias,
} from "zod-to-ts";
import { zerialize, type ZodTypes } from "zodex";

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

// Load dependencies and set up message handler
self.onmessage = (e) => {
  const { code } = e.data;

  try {
    // Execute the plugin code
    const fn = new Function(`${code}; return ToolPlugin;`);
    const plugin = fn();

    // Create tool with all dependencies
    const toolFactory = plugin.defineTool(deps);

    self.postMessage({
      success: true,
      toolFactory: {
        defaultParams: toolFactory.defaultParams,
        // Cannot send functions via postMessage, so send tool created with default params
        defaultTool: toolFactory.createTool(toolFactory.defaultParams),
      },
    });
  } catch (err) {
    self.postMessage({
      success: false,
      error: (err as Error).message,
      stack: (err as Error).stack,
    });
  }
};

// Signal that worker is ready
self.postMessage({ ready: true });
