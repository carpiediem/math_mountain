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

// Horizontal path, as a fraction of the fitted mountain image's width -
// keyframes eased between (see getHorizontalFraction), tracing one full S
// up to the peak:
//   0.0            -> LEFT_EDGE       the climb starts near the image's
//                                     left edge
//   STEP1_FRACTION -> STEP1_X         and STEP7_FRACTION -> STEP7_X below
//                                     are both fixed midpoints - without
//                                     them, a single ease from the left
//                                     edge to the bottom curve's peak
//                                     bunches steps 2-6 together near that
//                                     peak instead of spreading them out
//   STEP7_FRACTION -> STEP7_X         the bottom curve, out toward the
//                                     right edge
//   TOP_CURVE_END  -> MOUNTAIN_LEFT_X the top curve, back to the
//                                     mountain's own left slope (not the
//                                     image's left edge - at this height
//                                     the mountain doesn't reach nearly
//                                     that far left)
//   1.0            -> PEAK_X_FRACTION the last step, landing on the peak
const LEFT_EDGE = 0.03;
const STEP1_FRACTION = 1 / (STEP_COUNT - 1);
const STEP1_X = 0.1;
const STEP7_FRACTION = 7 / (STEP_COUNT - 1);
const STEP7_X = 0.847;
const TOP_CURVE_END = 0.8;

// Where the mountain's peak and its left slope (at the top curve's height,
// TOP_CURVE_END) actually sit in assets/images/mountain.jpg, found by
// scanning for the topmost sky/mountain transition per column, and the
// leftmost sky/mountain transition at that row.
const PEAK_X_FRACTION = 0.589;
const PEAK_Y_FRACTION = 0.1;
const MOUNTAIN_LEFT_X = 0.42;

// Cosine-eases from v0 (at t = t0) to v1 (at t = t1).
function ease(t: number, t0: number, t1: number, v0: number, v1: number) {
  return (
    (v0 + v1) / 2 - ((v1 - v0) / 2) * Math.cos((Math.PI * (t - t0)) / (t1 - t0))
  );
}

// Eases from v0 (at t = t0) to v1 (at t = t1), covering ground faster near
// t0 than near t1 (unlike the symmetric `ease` above) - used only for the
// final approach to the peak, so the second-to-last step sits a bit closer
// to the peak's own x position than a symmetric ease would put it.
function easeOut(t: number, t0: number, t1: number, v0: number, v1: number) {
  const progress = (t - t0) / (t1 - t0);
  return v0 + (v1 - v0) * (1 - Math.pow(1 - progress, 1.5));
}

function getHorizontalFraction(fraction: number): number {
  if (fraction <= STEP1_FRACTION) {
    return ease(fraction, 0, STEP1_FRACTION, LEFT_EDGE, STEP1_X);
  }
  if (fraction <= STEP7_FRACTION) {
    return ease(fraction, STEP1_FRACTION, STEP7_FRACTION, STEP1_X, STEP7_X);
  }
  if (fraction <= TOP_CURVE_END) {
    return ease(
      fraction,
      STEP7_FRACTION,
      TOP_CURVE_END,
      STEP7_X,
      MOUNTAIN_LEFT_X,
    );
  }
  return easeOut(fraction, TOP_CURVE_END, 1, MOUNTAIN_LEFT_X, PEAK_X_FRACTION);
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
