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

// Each step's position, as a fraction of the fitted mountain image's width
// (x) and height (y) - hand-tuned to trace an S climbing from the image's
// lower-left up to just above the peak at assets/images/mountain.jpg's
// actual peak position (x: 0.589, y: 0.1, found by scanning the image for
// the topmost sky/mountain transition per column). Edit a step's x/y
// directly to nudge it; there's no formula tying steps together, so one
// step's position never shifts as a side effect of adjusting another's.
const STEP_FRACTIONS: { x: number; y: number }[] = [
  { x: 0.03, y: 0.92 }, // step 0
  { x: 0.1, y: 0.8614 }, // step 1
  { x: 0.225, y: 0.8029 }, // step 2
  { x: 0.35, y: 0.7443 }, // step 3
  { x: 0.4742, y: 0.6857 }, // step 4
  { x: 0.5985, y: 0.6271 }, // step 5
  { x: 0.7227, y: 0.5686 }, // step 6
  { x: 0.847, y: 0.51 }, // step 7
  { x: 0.79, y: 0.4514 }, // step 8
  { x: 0.6495, y: 0.3929 }, // step 9
  { x: 0.5004, y: 0.3343 }, // step 10
  { x: 0.4224, y: 0.2757 }, // step 11
  { x: 0.487, y: 0.2171 }, // step 12
  { x: 0.5529, y: 0.1586 }, // step 13
  { x: 0.589, y: 0.1 }, // step 14 - lands exactly on the peak
];

export function getStepPosition(
  imageLayout: ImageLayout,
  step: number,
): StepPosition {
  const { x, y } = STEP_FRACTIONS[step];

  return {
    top: imageLayout.top + imageLayout.height * y,
    left: imageLayout.left + imageLayout.width * x,
    width: imageLayout.width * STEP_WIDTH_RATIO,
  };
}
