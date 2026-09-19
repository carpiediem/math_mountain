import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ArithmeticQuestion } from "../utils/arithmeticQuestion";

type QuestionPanelProps = {
  question: ArithmeticQuestion;
  onAnswer: (option: string) => void;
};

export function QuestionPanel({ question, onAnswer }: QuestionPanelProps) {
  const rows = [question.options.slice(0, 2), question.options.slice(2)];

  return (
    <View testID="question-panel" style={styles.container}>
      <Text testID="question-prompt" style={styles.prompt}>
        {question.prompt}
      </Text>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
              onPress={() => onAnswer(option)}
            >
              <Text style={styles.buttonLabel}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 12,
  },
  prompt: {
    fontSize: 40,
    fontWeight: "600",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  button: {
    flex: 1,
    maxWidth: 180,
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#2f6fdb",
  },
  pressed: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
  },
});
