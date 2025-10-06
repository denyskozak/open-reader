import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildStarStates, formatRating } from "../rating.js";

describe("formatRating", () => {
  it("trims trailing zeros", () => {
    assert.equal(formatRating(4.0), "4");
  });

  it("keeps fraction digits", () => {
    assert.equal(formatRating(4.34), "4.3");
  });
});

describe("buildStarStates", () => {
  it("returns 5 stars", () => {
    assert.equal(buildStarStates(5).length, 5);
  });

  it("builds half star for fractional rating", () => {
    assert.equal(buildStarStates(3.4)[3], "half");
  });

  it("does not exceed bounds", () => {
    assert.equal(
      buildStarStates(12).filter((star: string) => star === "full").length,
      5,
    );
    assert.equal(buildStarStates(-1)[0], "empty");
  });
});
