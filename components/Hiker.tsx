import { Image, StyleSheet } from "react-native";

import { getStepPosition, ImageLayout, STEP_COUNT } from "./mountainSteps";

type HikerProps = {
  step: number;
  imageLayout: ImageLayout;
};

// Sprite: "Pokemon Sword Gloria (Female Player) Gen 4 OW V2" by Boonzeet
// (https://www.deviantart.com/boonzeet/art/Pokemon-Sword-Gloria-Female-Player-Gen-4-OW-V2-842639028),
// shared by the artist as a reusable RPG Maker resource with credit
// requested - cropped to the single rightward-facing walk frame from the
// full character sheet at assets/images/hiker-sheet.png.
export function Hiker({ step, imageLayout }: HikerProps) {
  if (step < 0 || step > STEP_COUNT - 1) return null;

  const position = getStepPosition(imageLayout, step);
  const size = position.width * 0.9;

  return (
    <Image
      testID="hiker"
      source={require("../assets/images/hiker.png")}
      style={[
        styles.sprite,
        {
          width: size,
          height: size,
          top: position.top - size,
          left: position.left + position.width / 2 - size / 2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  sprite: {
    position: "absolute",
  },
});
