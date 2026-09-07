import { describe, it, expect } from "vitest";
import { assertUuid } from "../utils/validation";

// database.js interpolates ids straight into PostgREST .or() filter
// strings - this guard is what stops a non-UUID value from breaking out
// of the intended filter clause. See database.js's own comment.
describe("assertUuid", () => {
  it("accepts a valid v4 UUID", () => {
    expect(() => assertUuid("3c2cac51-802a-44fc-872d-90d93c17b3dc", "userId")).not.toThrow();
  });

  it("accepts uppercase hex", () => {
    expect(() => assertUuid("3C2CAC51-802A-44FC-872D-90D93C17B3DC", "userId")).not.toThrow();
  });

  it("rejects a filter-injection attempt", () => {
    expect(() => assertUuid("x,connected_user_id.eq.1", "userId")).toThrow(/Invalid userId/);
  });

  it("rejects a plain non-UUID string", () => {
    expect(() => assertUuid("not-a-uuid", "userId")).toThrow();
  });

  it("rejects undefined", () => {
    expect(() => assertUuid(undefined, "userId")).toThrow();
  });
});
