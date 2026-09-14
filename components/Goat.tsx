import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

// Sprite: cropped from the second row of assets/images/goat-sheet.png
// ("Pilgor" from Goat Simulator, fan sprites by xxultra2006xx on
// DeviantArt) into an 8-frame walk cycle, assets/images/goat-sprites.png.
const FRAME_COUNT = 8;
export const GOAT_FRAME_ASPECT_RATIO = 72 / 96; // width / height, from the source crop
const FRAME_INTERVAL_MS = 120;
const DEFAULT_DURATION_MS = 2000;

type GoatProps = {
  top: number;
  left: number;
  size: number;
  // While true, cycles through the walk frames; stops back on frame 0
  // (the sprite sheet's top-left/first frame) after durationMs, regardless
  // of whether this prop is still true.
  animate: boolean;
  durationMs?: number;
};

export function Goat({
  top,
  left,
  size,
  animate,
  durationMs = DEFAULT_DURATION_MS,
}: GoatProps) {
  const [frame, setFrame] = useState(0);
  const width = size * GOAT_FRAME_ASPECT_RATIO;

  useEffect(() => {
    if (!animate) {
      return;
    }

    const frameInterval = setInterval(() => {
      setFrame((current) => (current + 1) % FRAME_COUNT);
    }, FRAME_INTERVAL_MS);

    const stopTimeout = setTimeout(() => {
      clearInterval(frameInterval);
      setFrame(0);
    }, durationMs);

    return () => {
      clearInterval(frameInterval);
      clearTimeout(stopTimeout);
    };
  }, [animate, durationMs]);

  return (
    <View
      testID="goat"
      style={[styles.frameWindow, { top, left, width, height: size }]}
    >
      <Image
        testID="goat-sprite"
        source={require("../assets/images/goat-sprites.png")}
        style={{
          width: width * FRAME_COUNT,
          height: size,
          transform: [{ translateX: -frame * width }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frameWindow: {
    position: "absolute",
    overflow: "hidden",
  },
});
