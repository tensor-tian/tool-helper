// Auto-generated tool plugin for WebWorker

"use strict";
var ToolPlugin = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // toolrc.ts
  var toolrc_exports = {};
  __export(toolrc_exports, {
    defineTool: () => defineTool
  });
  var import_util = __require("tool-cli/util");
  function defineTool(deps) {
    const { z, toJSONSchema, toTSDefinition, serializeZod } = deps;
    const parametersSchema = z.object({
      command: z.string().describe("The service command to find the port for")
    });
    const name = "findServicePort";
    function createTool({ command }) {
      const tool = (0, import_util.createCmdTool)({
        name,
        description: "Find the tcp port listened by a service command",
        parameters: toJSONSchema(parametersSchema),
        schema: serializeZod(parametersSchema),
        definition: toTSDefinition(name, parametersSchema)
      });
      tool.extra.cmd = ["$TOOL_PATH/find_service_port.sh", command];
      return tool;
    }
    const defaultParams = { command: "" };
    return {
      defaultParams,
      createTool
    };
  }
  return __toCommonJS(toolrc_exports);
})();
//# sourceMappingURL=toolrc.js.map
