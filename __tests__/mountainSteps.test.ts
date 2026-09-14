import { isStepMovingLeft, STEP_COUNT } from "../components/mountainSteps";

describe("isStepMovingLeft", () => {
  it("defaults to false for step 0, which has no previous step", () => {
    expect(isStepMovingLeft(0)).toBe(false);
  });

  it("returns false for a step below the valid range", () => {
    expect(isStepMovingLeft(-1)).toBe(false);
  });

  it("returns false for a step at or above STEP_COUNT", () => {
    expect(isStepMovingLeft(STEP_COUNT)).toBe(false);
  });

  it("returns false when the step moved right of the previous one", () => {
    expect(isStepMovingLeft(1)).toBe(false);
  });

  it("returns true when the step moved left of the previous one", () => {
    expect(isStepMovingLeft(9)).toBe(true);
  });
});
