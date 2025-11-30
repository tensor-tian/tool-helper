import { useState, useEffect } from "react";
import "./App.css";
// Import worker as URL using Vite's ?worker&url syntax
import ToolWorkerUrl from "./toolrc.worker?worker&url";

interface ToolResult {
  name: string;
  description: string;
  parameters: string;
  schema: string;
  definition: string;
  type: string;
  extra: {
    cmd: string[];
  };
}

function App() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [tool, setTool] = useState<ToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlugin() {
      try {
        setStatus("📦 Fetching plugin code...");

        // Fetch the plugin code
        const code = await fetch("/toolrc.js").then((r) => r.text());

        setStatus("⚙️ Creating WebWorker...");

        // Create worker using bundled worker file
        const worker = new Worker(ToolWorkerUrl, { type: "module" });

        worker.onmessage = (e) => {
          if (e.data.ready) {
            setStatus("🚀 Worker ready, sending code...");
            worker.postMessage({ code });
            return;
          }

          if (e.data.success) {
            setStatus("✅ Plugin loaded successfully!");
            setTool(e.data.toolFactory.defaultTool);
          } else if (e.data.error) {
            setStatus("❌ Error loading plugin");
            setError(e.data.error + "\n" + e.data.stack);
          }
        };

        worker.onerror = (err) => {
          setStatus("❌ Worker error");
          setError(err.message);
        };
      } catch (err) {
        setStatus("❌ Failed to load");
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    loadPlugin();
  }, []);

  return (
    <div className="container">
      <h1>🔧 ToolRC Plugin WebWorker Test</h1>

      <div className={`status ${error ? "error" : "success"}`}>
        <h2>Status</h2>
        <p>{status}</p>
      </div>

      {error && (
        <div className="error-box">
          <h3>Error Details:</h3>
          <pre>{error}</pre>
        </div>
      )}

      {tool && (
        <div className="tool-details">
          <h2>Tool Details</h2>

          <div className="detail-item">
            <strong>Name:</strong> {tool.name}
          </div>

          <div className="detail-item">
            <strong>Description:</strong> {tool.description}
          </div>

          <div className="detail-item">
            <strong>Type:</strong> {tool.type}
          </div>

          <div className="detail-item">
            <strong>Command:</strong>
            <pre>{JSON.stringify(tool.extra.cmd, null, 2)}</pre>
          </div>

          <div className="detail-section">
            <h3>Parameters (JSON Schema):</h3>
            <pre>{tool.parameters}</pre>
          </div>

          <div className="detail-section">
            <h3>Schema (Zodex):</h3>
            <pre>{tool.schema}</pre>
          </div>

          <div className="detail-section">
            <h3>Definition (TypeScript):</h3>
            <pre>{tool.definition}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
