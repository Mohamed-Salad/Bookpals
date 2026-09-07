import { describe, it, expect } from "vitest";
import { sanitizeFilterText } from "../utils/validation";

// searchService.js interpolates raw search-box text straight into
// PostgREST .or() filter strings - this guard strips the characters that
// are structural in that filter DSL rather than literal search text.
describe("sanitizeFilterText", () => {
  it("passes normal search text through unchanged", () => {
    expect(sanitizeFilterText("fantasy readers")).toBe("fantasy readers");
  });

  it("strips commas", () => {
    expect(sanitizeFilterText("a,b")).toBe("ab");
  });

  it("strips parentheses", () => {
    expect(sanitizeFilterText("a(b)c")).toBe("abc");
  });

  it("neutralizes a filter-injection attempt", () => {
    const malicious = "x,id.eq.1),is_admin.eq.true";
    expect(sanitizeFilterText(malicious)).not.toMatch(/[,()]/);
  });
});
