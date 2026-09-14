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

// Steps climb diagonally from the lower-left of the fitted mountain image
// toward its upper-right, where the peak sits (see assets/images/mountain.jpg)
// - the last step (STEP_COUNT - 1) lands just above it, near the image's top
// edge, rather than at the very top corner.
export function getStepPosition(
  imageLayout: ImageLayout,
  step: number,
): StepPosition {
  const fraction = step / (STEP_COUNT - 1);
  const width = imageLayout.width * 0.14;

  return {
    top: imageLayout.top + imageLayout.height * (0.92 - fraction * 0.8),
    left: imageLayout.left + imageLayout.width * (0.12 + fraction * 0.58),
    width,
  };
}
