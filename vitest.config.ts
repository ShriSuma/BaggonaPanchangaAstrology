import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    root: __dirname,
    setupFiles: [resolve(__dirname, "src/tests/setup.ts")],
    // `scratch/` holds one-off console.log debugging scripts, not tests. Several still
    // import `src/core/AstroEngine`, which was renamed to `EphemerisEngine` long ago,
    // so they only ever added noise to the suite.
    exclude: ["**/node_modules/**", "**/dist/**", "scratch/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
});

