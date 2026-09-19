import { useEffect, useRef, useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

import {
  DEFAULT_DURATION_MS as GOAT_ANIMATION_MS,
  Goat,
  GOAT_FRAME_ASPECT_RATIO,
} from "./Goat";
import { Hiker, MOVE_DURATION_MS } from "./Hiker";
import { getStepPosition, isStepMovingLeft, STEP_COUNT } from "./mountainSteps";

// The asset's own pixel dimensions (see assets/images/mountain.jpg) - needed
// up front to compute its "contain"-fitted size below, since neither web nor
// native resizeMode="contain" exposes the scaled image's actual on-screen
// position, which the label needs to track to stay aligned with the image's
// top-left corner.
const IMAGE_WIDTH = 1600;
const IMAGE_HEIGHT = 1027;

// A font-size guess to measure the label's actual rendered width at, since
// glyph widths (especially for a display face like Henny Penny) aren't
// predictable from fontSize alone - measuring once and then scaling
// linearly (width scales ~linearly with fontSize for a fixed string) gets
// the label to roughly TARGET_WIDTH_RATIO of the panel's width without
// needing to re-measure on every resize. Measured via the label's own
// onLayout, not onTextLayout - react-native-web's Text doesn't implement
// onTextLayout at all, so it would silently never fire on web and leave the
// label stuck at this base size regardless of container width.
const MEASUREMENT_FONT_SIZE = 24;
const TARGET_WIDTH_RATIO = 0.5;

// The goat's position never changes, so it isn't tied to the step system
// at all - these are the same fractions step 2's (x) and step 7's (y)
// positions happened to resolve to, hardcoded directly.
const GOAT_X_FRACTION = 0.26;
const GOAT_Y_FRACTION = 0.51;
const GOAT_HEIGHT_RATIO = 0.1;

// How long the goat's error face shows after a wrong answer.
const GOAT_ERROR_MS = 1000;

// A fresh object for every answer given (even two of the same outcome in a
// row), so MountainProgress can react to each one rather than only to a
// change in `correct`.
export type AnswerResult = { correct: boolean };

type MountainProgressProps = {
  hikerStep: number;
  lastAnswer?: AnswerResult | null;
};

export function MountainProgress({
  hikerStep,
  lastAnswer = null,
}: MountainProgressProps) {
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [measuredLabelWidth, setMeasuredLabelWidth] = useState<number | null>(
    null,
  );
  const [hikerAnimating, setHikerAnimating] = useState(false);
  const [goatAnimating, setGoatAnimating] = useState(false);
  const [goatError, setGoatError] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);

  // The goat reacts to each answer: its walk cycle for a correct one, its
  // error face for a wrong one. State is adjusted during render (React's
  // recommended way to react to a changed prop) and the effect only owns the
  // timer that ends the reaction. Skips the initial null (nothing answered).
  const [seenAnswer, setSeenAnswer] = useState(lastAnswer);
  if (lastAnswer !== seenAnswer) {
    setSeenAnswer(lastAnswer);
    if (lastAnswer) {
      setWrongAnswer(!lastAnswer.correct);
      setGoatAnimating(lastAnswer.correct);
      setGoatError(!lastAnswer.correct);
    }
  }

  useEffect(() => {
    if (!lastAnswer) {
      return;
    }

    const timeout = setTimeout(
      () => {
        setGoatAnimating(false);
        setGoatError(false);
      },
      lastAnswer.correct ? GOAT_ANIMATION_MS : GOAT_ERROR_MS,
    );
    return () => clearTimeout(timeout);
  }, [lastAnswer]);

  // Walk while the hiker slides to a new step (the Hiker tweens its position
  // over MOVE_DURATION_MS itself). The first render is skipped - the hiker
  // just appears at its starting step.
  const previousStep = useRef(hikerStep);
  useEffect(() => {
    if (previousStep.current === hikerStep) {
      return;
    }
    previousStep.current = hikerStep;

    setHikerAnimating(true);
    const timeout = setTimeout(
      () => setHikerAnimating(false),
      MOVE_DURATION_MS,
    );
    return () => clearTimeout(timeout);
  }, [hikerStep]);

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }

  function handleLabelLayout(event: LayoutChangeEvent) {
    if (measuredLabelWidth === null) {
      setMeasuredLabelWidth(event.nativeEvent.layout.width);
    }
  }

  let imageLayout = null;
  if (containerSize) {
    const scale = Math.min(
      containerSize.width / IMAGE_WIDTH,
      containerSize.height / IMAGE_HEIGHT,
    );
    const width = IMAGE_WIDTH * scale;
    const height = IMAGE_HEIGHT * scale;
    imageLayout = {
      width,
      height,
      top: (containerSize.height - height) / 2,
      left: (containerSize.width - width) / 2,
    };
  }

  const labelFontSize =
    containerSize && measuredLabelWidth
      ? (MEASUREMENT_FONT_SIZE * (containerSize.width * TARGET_WIDTH_RATIO)) /
        measuredLabelWidth
      : MEASUREMENT_FONT_SIZE;

  const goatHeight = imageLayout ? imageLayout.width * GOAT_HEIGHT_RATIO : 0;

  const isHikerStepValid = hikerStep >= 0 && hikerStep < STEP_COUNT;
  const hikerPosition =
    imageLayout && isHikerStepValid
      ? getStepPosition(imageLayout, hikerStep)
      : null;
  // A wrong answer flips the hiker for the duration of its slide back down
  // (gated on hikerAnimating, so a wrong answer at the bottom, where the
  // hiker doesn't move, doesn't flip it).
  const hikerFaceLeft =
    isStepMovingLeft(hikerStep) !== (wrongAnswer && hikerAnimating);
  const hikerSize = imageLayout ? imageLayout.width * 0.126 : 0;

  return (
    <View
      testID="mountain-progress"
      style={styles.container}
      onLayout={handleLayout}
    >
      {imageLayout && (
        <>
          <Image
            source={require("../assets/images/mountain.jpg")}
            style={[styles.image, imageLayout]}
          />
          {Array.from({ length: STEP_COUNT }, (_, step) => {
            const position = getStepPosition(imageLayout, step);
            return (
              <View
                key={step}
                testID={`mountain-step-${step}`}
                style={[styles.step, position]}
              />
            );
          })}
          {hikerPosition && (
            <Hiker
              top={hikerPosition.top - hikerSize}
              left={
                hikerPosition.left + hikerPosition.width / 2 - hikerSize / 2
              }
              size={hikerSize}
              faceLeft={hikerFaceLeft}
              animate={hikerAnimating}
              durationMs={MOVE_DURATION_MS}
            />
          )}
          <Goat
            top={
              imageLayout.top +
              imageLayout.height * GOAT_Y_FRACTION -
              goatHeight
            }
            left={
              imageLayout.left +
              imageLayout.width * GOAT_X_FRACTION -
              (goatHeight * GOAT_FRAME_ASPECT_RATIO) / 2
            }
            size={goatHeight}
            animate={goatAnimating}
            durationMs={GOAT_ANIMATION_MS}
            error={goatError}
          />
          <Text
            testID="mountain-progress-label"
            onLayout={handleLabelLayout}
            style={[
              styles.label,
              {
                top: imageLayout.top,
                left: imageLayout.left,
                fontSize: labelFontSize,
              },
            ]}
          >
            Math Mountain
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  image: {
    position: "absolute",
  },
  step: {
    position: "absolute",
    height: 3,
    backgroundColor: "#fff",
    opacity: 0.8,
  },
  label: {
    position: "absolute",
    fontFamily: "HennyPenny_400Regular",
    color: "#fff",
  },
});
