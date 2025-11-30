// Core utilities without zod dependency
type ShortPeriod = `${number}${"s" | "h" | "m"}`;
type LongPeriod = `${number}${"m" | "h"}`;

export interface ITool {
  name: string;
  description: string;
  parameters: string; // for LLM, json schema of parameters
  schema: string; // for validation, serialized by zodex
  definition: string; // for type reference, TypeScript definition of parameters
  category: "cmd" | "http";
  logLifeSpan: LongPeriod;
  concurrencyGroupName: string;
  timeout: ShortPeriod;
  extra: Record<string, unknown>;
}

const defaultTool: Partial<ITool> = {
  logLifeSpan: "48h",
  concurrencyGroupName: "none",
  timeout: "10s",
};

export interface ICmdTool extends ITool {
  type: "cmd";
  extra: {
    sh: "sh" | "bash" | "zsh" | "";
    cmd: string[];
    wd: string;
    env: Record<string, string>;
    isStream: boolean;
  };
}

const defaultCmdTool: Partial<ICmdTool> = {
  ...defaultTool,
  type: "cmd",
  extra: {
    sh: "",
    cmd: [],
    wd: "$TMPDIR/tool-hub",
    env: {},
    isStream: false,
  },
};

export const createCmdTool = (overrides: Partial<ICmdTool>): ICmdTool => {
  return {
    ...(defaultCmdTool as ICmdTool),
    ...overrides,
  };
};

export type CreateCmdTool = typeof createCmdTool;

export interface IParameters {
  args: Record<string, unknown>;
  assertion: "contains" | "equals" | "regex";
  expected: string;
}

export interface IHttpTool {
  toolID: number;
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers: Record<string, string>;
  body: string;
  timeout: ShortPeriod;
}
