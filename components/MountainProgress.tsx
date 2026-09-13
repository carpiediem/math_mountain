import { useState } from "react";
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

// The asset's own pixel dimensions (see assets/images/mountain.jpg) - needed
// up front to compute its "contain"-fitted size below, since neither web nor
// native resizeMode="contain" exposes the scaled image's actual on-screen
// position, which the label needs to track to stay aligned with the image's
// top-left corner.
const IMAGE_WIDTH = 1600;
const IMAGE_HEIGHT = 1027;

const MIN_LABEL_FONT_SIZE = 16;
const MAX_LABEL_FONT_SIZE = 32;

export function MountainProgress() {
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
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

  // Scales with the panel's own width rather than the window's, so the
  // label stays proportionate whether MountainProgress is a full-width
  // bottom strip on a small screen or a half-width side panel on a large
  // one.
  const labelFontSize = containerSize
    ? Math.max(
        MIN_LABEL_FONT_SIZE,
        Math.min(MAX_LABEL_FONT_SIZE, containerSize.width * 0.08),
      )
    : MAX_LABEL_FONT_SIZE;

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
