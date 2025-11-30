# Tool Bundle for WebWorker

这个包展示了如何使用 esbuild 构建一个适用于浏览器 WebWorker 环境的工具包，将 `zod` 作为外部依赖。

## 构建方式

```bash
pnpm run build
```

## 构建配置 (build.ts)

```typescript
await esbuild.build({
  entryPoints: [path.join(__dirname, "tool.ts")],
  bundle: true,
  platform: "browser",      // ✅ WebWorker 环境
  format: "iife",           // ✅ 自执行函数
  globalName: "ToolPlugin", // ✅ 全局变量名
  outfile: path.join(__dirname, "dist/tool.js"),
  external: ["zod"],        // ✅ zod 作为外部依赖
  treeShaking: true,
  minify: false,
  sourcemap: true,
});
```

## 输出结果

* **包含**: `tool-base` 的实现（`createCmdTool` 等工具函数）
* **不包含**: `zod` 库（需要从主线程传入）
* **格式**: IIFE（立即执行函数表达式）
* **大小**: ~87 行（约 2KB）

## 使用方式

### WebWorker 中 (tool.worker.js)

```javascript
// 在 WebWorker 中自己导入 zod（从 CDN）
import('https://cdn.jsdelivr.net/npm/zod@4.1.13/+esm').then(({ z }) => {
  self.onmessage = (e) => {
    const { code } = e.data;

    const fn = new Function(\`\${code}; return ToolPlugin;\`);
    const plugin = fn();

    const tool = plugin.defineTool({ z });

    self.postMessage({
      success: true,
      tool,
    });
  };

  // Signal ready to main thread
  self.postMessage({ ready: true });
});
```

### 主线程中 (main.js)

```javascript
const code = await fetch('/tool.js').then(r => r.text());

const worker = new Worker('/tool.worker.js');

// 等待 worker 加载 zod 并准备好
worker.onmessage = (e) => {
  if (e.data.ready) {
    // ✅ Worker 已准备好，发送工具代码
    worker.postMessage({ code });
    return;
  }
  
  // 处理工具加载完成的消息
  if (e.data.success) {
    console.log('Tool loaded:', e.data.tool);
  }
};
```

## 测试

### Node.js 环境测试

```bash
node test-bundle.js
```

### 浏览器环境测试

```bash
# 启动一个静态服务器
cd dist
python3 -m http.server 8000
# 访问 http://localhost:8000/index.html
```

## 关键要点

1. **平台设置**: `platform: "browser"` 确保输出适用于浏览器环境
2. **格式**: `format: "iife"` 创建一个自执行函数，暴露全局变量
3. **外部依赖**: `external: ["zod"]` 排除 zod，运行时从外部传入
4. **内联工具**: tool-base 的工具函数被内联到 `tool.ts` 中，避免引入额外的 zod 依赖

## 输出结构

```javascript
var ToolPlugin = (() => {
  // tool-base 实现
  var createCmdTool = (overrides) => { ... };
  
  // defineTool 函数
  function defineTool(deps) {
    const { z } = deps;  // 从外部接收 zod
    const toJSONSchema = (s) => {
      return JSON.stringify(z.toJSONSchema(s), null, 2);
    };
    // ...
  }
  
  return { defineTool };
})();
```
