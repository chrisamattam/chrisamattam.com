import { describe, it, expect } from "vitest";
import { config } from "./config";

describe("keeper config", () => {
  it("has the agreed defaults", () => {
    expect(config.processedLabel).toBe("website-processed");
    expect(config.downtimeThresholdDays).toBe(7);
    expect(config.liveLinkRetries).toBe(3);
    expect(config.coverSourcesOrder).toEqual([
      "google-books", "itunes", "open-library", "duckduckgo",
    ]);
  });

  it("maps every purchase source to a valid format", () => {
    const valid = new Set(["Kindle", "Audible", "Physical"]);
    expect(config.purchaseSources.length).toBeGreaterThan(0);
    for (const s of config.purchaseSources) {
      expect(valid.has(s.format)).toBe(true);
      expect(s.gmailQuery.length).toBeGreaterThan(0);
    }
  });
});
