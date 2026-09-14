import { StyleSheet, View } from "react-native";

import { getStepPosition, ImageLayout, STEP_COUNT } from "./mountainSteps";

type HikerProps = {
  step: number;
  imageLayout: ImageLayout;
};

// TODO: swap this placeholder marker for the actual sprite
// (assets/images/hiker.png - Pokemon Sword Gloria (Female Player) Gen 4 OW
// V2 by Boonzeet, https://www.deviantart.com/boonzeet/art/842639028) once
// that asset is added to the repo.
export function Hiker({ step, imageLayout }: HikerProps) {
  if (step < 0 || step > STEP_COUNT - 1) return null;

  const position = getStepPosition(imageLayout, step);
  const size = position.width * 0.7;

  return (
    <View
      testID="hiker"
      style={[
        styles.marker,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: position.top - size,
          left: position.left + position.width / 2 - size / 2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  marker: {
    position: "absolute",
    backgroundColor: "#d7263d",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
