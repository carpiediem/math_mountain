import { ImageBackground, StyleSheet, Text, View } from "react-native";

export function MountainProgress() {
  return (
    <ImageBackground
      source={require("../assets/images/mountain.jpg")}
      style={styles.container}
      imageStyle={styles.image}
      resizeMode="contain"
    >
      <View style={styles.labelWrap}>
        <Text style={styles.label}>MountainProgress</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  labelWrap: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
});
