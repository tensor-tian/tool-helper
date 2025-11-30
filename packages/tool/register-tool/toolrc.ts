import { createCmdTool } from "tool-hub-cli/util";
import type { z as zodType } from "zod";

export function defineTool(deps: {
  z: typeof zodType;
  toJSONSchema: (s: zodType.ZodTypeAny) => string;
  toTSDefinition: (name: string, s: zodType.ZodTypeAny) => string;
  serializeZod: (s: zodType.ZodTypeAny) => string;
}) {
  const { z, toJSONSchema, toTSDefinition, serializeZod } = deps;

  const parametersSchema = z.object({
    command: z.string().describe("The service command to find the port for"),
  });

  type TParameters = zodType.infer<typeof parametersSchema>;

  const name = "findServicePort";
  function createTool({ command }: TParameters) {
    const tool = createCmdTool({
      name,
      description: "Find the tcp port listened by a service command",
      parameters: toJSONSchema(parametersSchema),
      schema: serializeZod(parametersSchema),
      definition: toTSDefinition(name, parametersSchema),
    });
    tool.extra.cmd = ["$TOOL_PATH/find_service_port.sh", command];
    return tool;
  }

  const defaultParams: TParameters = { command: "" };

  return {
    defaultParams,
    createTool,
  };
}
