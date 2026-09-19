import { useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  HennyPenny_400Regular,
} from "@expo-google-fonts/henny-penny";

import {
  MountainProgress,
  type AnswerResult,
} from "./components/MountainProgress";
import { QuestionPanel } from "./components/QuestionPanel";
import { STEP_COUNT } from "./components/mountainSteps";
import {
  generateQuestion,
  type ArithmeticQuestion,
  type Difficulty,
  type Operation,
} from "./utils/arithmeticQuestion";
import { initSentry } from "./utils/sentry";

// Below this width, panels stack vertically (MountainProgress on the
// bottom) instead of side by side (MountainProgress on the left).
const LARGE_SCREEN_BREAKPOINT = 700;

const OPERATIONS: Operation[] = ["+", "-", "x", "/"];

initSentry();

// Questions get harder in thirds as the hiker climbs: steps 0-4 are level 1,
// 5-9 level 2, and 10-14 level 3.
export function difficultyForStep(step: number): Difficulty {
  return (Math.floor((step * 3) / STEP_COUNT) + 1) as Difficulty;
}

function newQuestion(step: number): ArithmeticQuestion {
  const op = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
  return generateQuestion(op, difficultyForStep(step));
}

export default function App() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= LARGE_SCREEN_BREAKPOINT;
  const [hikerStep, setHikerStep] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null);
  const [question, setQuestion] = useState(() => newQuestion(0));
  const [fontsLoaded] = useFonts({ HennyPenny_400Regular });

  // A correct answer climbs a step (staying put at the peak), a wrong one
  // slides down a step (staying put at the bottom); either way, a fresh
  // question is asked for wherever the hiker ends up.
  function handleAnswer(option: string) {
    const correct = option === question.answer;
    const delta = correct ? 1 : -1;
    const nextStep = Math.min(STEP_COUNT - 1, Math.max(0, hikerStep + delta));
    setLastAnswer({ correct });
    setHikerStep(nextStep);
    setQuestion(newQuestion(nextStep));
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        testID="app-root"
        style={[
          styles.container,
          { flexDirection: isLargeScreen ? "row-reverse" : "column" },
        ]}
      >
        <QuestionPanel question={question} onAnswer={handleAnswer} />
        <MountainProgress hikerStep={hikerStep} lastAnswer={lastAnswer} />
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
