// build.ts
import esbuild from "esbuild";
import path from "path";

export async function build(dir: string, configFile: string) {
  await esbuild
    .build({
      entryPoints: [path.join(dir, configFile)],
      bundle: true,
      platform: "browser", // For WebWorker environment
      format: "iife",
      globalName: "ToolPlugin",
      outfile: path.join(dir, "dist/toolrc.js"),
      external: ["zod", "zodex", "zod-to-ts"], // Exclude zod - will be passed as parameter
      treeShaking: true,
      minify: false,
      sourcemap: true,
      banner: {
        js: "// Auto-generated tool plugin for WebWorker\n",
      },
    })
    .then(() => console.log("Build successfully"))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
