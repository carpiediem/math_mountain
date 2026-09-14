export const STEP_COUNT = 15;

export type ImageLayout = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type StepPosition = {
  top: number;
  left: number;
  width: number;
};

const STEP_WIDTH_RATIO = 0.07;

// Horizontal path, as a fraction of the fitted mountain image's width. The
// first ~80% of the climb (fraction 0 to S_CURVE_END) traces one full S:
// starting near the left edge, swinging out almost to the right edge (the
// bottom curve), then back to near the left edge (the top curve). The
// remaining ~20% eases from there over to PEAK_X_FRACTION, so the last step
// lands on the peak rather than wherever the S happened to end.
const LEFT_EDGE = 0.03;
const RIGHT_EDGE = 0.92;
const S_CURVE_END = 0.8;

// Where the peak actually sits in assets/images/mountain.jpg, found by
// scanning for the topmost sky/mountain transition per column - see the
// last step's alignment below.
const PEAK_X_FRACTION = 0.589;
const PEAK_Y_FRACTION = 0.1;

function getHorizontalFraction(fraction: number): number {
  if (fraction <= S_CURVE_END) {
    const center = (LEFT_EDGE + RIGHT_EDGE) / 2;
    const amplitude = (RIGHT_EDGE - LEFT_EDGE) / 2;
    return (
      center - amplitude * Math.cos((2 * Math.PI * fraction) / S_CURVE_END)
    );
  }

  const approach = (fraction - S_CURVE_END) / (1 - S_CURVE_END);
  return LEFT_EDGE + (PEAK_X_FRACTION - LEFT_EDGE) * approach;
}

// Steps climb the fitted mountain image in an S-curve (see
// getHorizontalFraction) from its bottom edge up to just above the peak
// (see assets/images/mountain.jpg), where the last step (STEP_COUNT - 1)
// lands.
export function getStepPosition(
  imageLayout: ImageLayout,
  step: number,
): StepPosition {
  const fraction = step / (STEP_COUNT - 1);
  const topFraction = 0.92 - fraction * (0.92 - PEAK_Y_FRACTION);

  return {
    top: imageLayout.top + imageLayout.height * topFraction,
    left:
      imageLayout.left + imageLayout.width * getHorizontalFraction(fraction),
    width: imageLayout.width * STEP_WIDTH_RATIO,
  };
}
