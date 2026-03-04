import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/test/**/*.test.ts", "src/test/**/*.test.tsx"],
    setupFiles: ["src/test/components/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
      thresholds: {
        statements: 84,
        branches: 75,
        functions: 88,
        lines: 84,
      },
    },
  },
});
