import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["automation/**/*.test.ts"],
    environment: "node",
  },
});
