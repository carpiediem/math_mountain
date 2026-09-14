import { useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

import { Hiker } from "./Hiker";
import { getStepPosition, STEP_COUNT } from "./mountainSteps";

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

export function MountainProgress() {
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [measuredLabelWidth, setMeasuredLabelWidth] = useState<number | null>(
    null,
  );
  // setHikerStep has no caller yet - nothing in this app advances the
  // hiker's step until question-answering logic exists to drive it.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hikerStep, setHikerStep] = useState(0);

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
          <Hiker step={hikerStep} imageLayout={imageLayout} />
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
