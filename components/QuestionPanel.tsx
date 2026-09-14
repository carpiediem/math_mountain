import { StyleSheet, Text, View } from "react-native";

export function QuestionPanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>QuestionPanel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
  },
});
