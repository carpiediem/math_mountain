import { useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextLayoutEvent,
  View,
} from "react-native";

// The asset's own pixel dimensions (see assets/images/mountain.jpg) - needed
// up front to compute its "contain"-fitted size below, since neither web nor
// native resizeMode="contain" exposes the scaled image's actual on-screen
// position, which the label needs to track to stay aligned with the image's
// top-left corner.
const IMAGE_WIDTH = 1600;
const IMAGE_HEIGHT = 1027;

// A font-size guess to measure the label's actual rendered width at, since
// glyph widths (especially for a display face like Uncial Antiqua) aren't
// predictable from fontSize alone - measuring once and then scaling
// linearly (width scales ~linearly with fontSize for a fixed string) gets
// the label to roughly TARGET_WIDTH_RATIO of the panel's width without
// needing to re-measure on every resize.
const MEASUREMENT_FONT_SIZE = 24;
const TARGET_WIDTH_RATIO = 0.5;

// Applied on top of TARGET_WIDTH_RATIO on large screens (see App.tsx's own
// breakpoint), where MountainProgress sits alongside QuestionPanel rather
// than stacked below it and has more room to read as a bolder title.
const LARGE_SCREEN_FONT_SCALE = 1.1;

type MountainProgressProps = {
  isLargeScreen: boolean;
};

export function MountainProgress({ isLargeScreen }: MountainProgressProps) {
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [measuredLabelWidth, setMeasuredLabelWidth] = useState<number | null>(
    null,
  );

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }

  function handleLabelTextLayout(event: TextLayoutEvent) {
    if (measuredLabelWidth === null) {
      setMeasuredLabelWidth(event.nativeEvent.lines[0]?.width ?? 0);
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
      ? ((MEASUREMENT_FONT_SIZE * (containerSize.width * TARGET_WIDTH_RATIO)) /
          measuredLabelWidth) *
        (isLargeScreen ? LARGE_SCREEN_FONT_SCALE : 1)
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
          <Text
            onTextLayout={handleLabelTextLayout}
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
  label: {
    position: "absolute",
    fontFamily: "UncialAntiqua_400Regular",
    color: "#fff",
  },
});
