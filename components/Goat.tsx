import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

// Sprite: cropped from assets/images/goat-sheet.png ("Pilgor" from Goat
// Simulator, fan sprites by xxultra2006xx on DeviantArt -
// https://www.deviantart.com/xxultra2006xx/art/Pilgor-Goat-Simulator-sprites-890748891)
// into assets/images/goat-sprites.png: an 8-frame walk cycle from the
// sheet's second row, plus a 9th frame (the error face below) from the
// third sprite in its third row. Each frame carries one source pixel of
// transparent padding on either side: the sprites touch their frame's left
// edge, so at fractional render widths the next frame's edge column could
// bleed into the visible window.
const WALK_FRAME_COUNT = 8;
const ERROR_FRAME_INDEX = 8;
const TOTAL_FRAME_COUNT = 9;
export const GOAT_FRAME_ASPECT_RATIO = 74 / 96; // width / height, from the source crop plus padding
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
  // Overrides animate/frame cycling to show the error face (the sheet's
  // yellow-eyed frame) instead.
  error: boolean;
};

export function Goat({
  top,
  left,
  size,
  animate,
  durationMs = DEFAULT_DURATION_MS,
  error,
}: GoatProps) {
  const [frame, setFrame] = useState(0);
  const width = size * GOAT_FRAME_ASPECT_RATIO;

  useEffect(() => {
    if (!animate) {
      return;
    }

    const frameInterval = setInterval(() => {
      setFrame((current) => (current + 1) % WALK_FRAME_COUNT);
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

  const displayedFrame = error ? ERROR_FRAME_INDEX : frame;

  return (
    <View
      testID="goat"
      style={[styles.frameWindow, { top, left, width, height: size }]}
    >
      <Image
        testID="goat-sprite"
        source={require("../assets/images/goat-sprites.png")}
        style={{
          width: width * TOTAL_FRAME_COUNT,
          height: size,
          transform: [{ translateX: -displayedFrame * width }],
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
