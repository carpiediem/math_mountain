import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet } from "react-native";

// Sprite: "Pokemon Sword Gloria (Female Player) Gen 4 OW V2" by Boonzeet
// (https://www.deviantart.com/boonzeet/art/Pokemon-Sword-Gloria-Female-Player-Gen-4-OW-V2-842639028),
// shared by the artist as a reusable RPG Maker resource with credit
// requested - cropped from the full character sheet at
// assets/images/hiker-sheet.png into a 4-frame walk cycle per direction,
// assets/images/hiker-sprites.png (top row: facing right, bottom row:
// facing left - both are the sheet's own artwork, not a mirrored flip).
const FRAME_COUNT = 4; // square frames, from the source crop
const FRAME_INTERVAL_MS = 150;
const DEFAULT_DURATION_MS = 2000;
export const MOVE_DURATION_MS = 500;

type HikerProps = {
  top: number;
  left: number;
  size: number;
  faceLeft: boolean;
  // While true, cycles through the walk frames; stops back on frame 0
  // (each row's first, standing frame) after durationMs, regardless of
  // whether this prop is still true.
  animate: boolean;
  durationMs?: number;
};

export function Hiker({
  top,
  left,
  size,
  faceLeft,
  animate,
  durationMs = DEFAULT_DURATION_MS,
}: HikerProps) {
  const [frame, setFrame] = useState(0);
  // top/left aren't transform/opacity, so Animated can't run these on the
  // native driver - they're JS-driven, same as any other Animated.timing
  // targeting a layout property. useState's lazy initializer (rather than
  // useRef) creates this once without tripping react-hooks/refs, which
  // flags any `.current` access during render.
  const [topAnim] = useState(() => new Animated.Value(top));
  const [leftAnim] = useState(() => new Animated.Value(left));
  // Tracks each value's last-known position so the effects below can skip
  // animating on mount (there's nothing to animate from yet - the hiker
  // should just appear at its starting spot) and only animate on an actual
  // change. Reading/writing `.current` only happens inside the effects
  // below, never during render, so this doesn't trip react-hooks/refs.
  const previousTop = useRef(top);
  const previousLeft = useRef(left);

  useEffect(() => {
    if (previousTop.current === top) {
      return;
    }
    previousTop.current = top;

    Animated.timing(topAnim, {
      toValue: top,
      duration: MOVE_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [top, topAnim]);

  useEffect(() => {
    if (previousLeft.current === left) {
      return;
    }
    previousLeft.current = left;

    Animated.timing(leftAnim, {
      toValue: left,
      duration: MOVE_DURATION_MS,
      useNativeDriver: false,
    }).start();
  }, [left, leftAnim]);

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

  const row = faceLeft ? 1 : 0;

  return (
    <Animated.View
      testID="hiker"
      style={[
        styles.frameWindow,
        { top: topAnim, left: leftAnim, width: size, height: size },
      ]}
    >
      <Image
        testID="hiker-sprite"
        source={require("../assets/images/hiker-sprites.png")}
        style={{
          width: size * FRAME_COUNT,
          height: size * 2,
          transform: [
            { translateX: -frame * size },
            { translateY: -row * size },
          ],
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frameWindow: {
    position: "absolute",
    overflow: "hidden",
  },
});
