import { StyleSheet, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  HennyPenny_400Regular,
} from "@expo-google-fonts/henny-penny";

import { MountainProgress } from "./components/MountainProgress";
import { QuestionPanel } from "./components/QuestionPanel";
import { initSentry } from "./utils/sentry";

// Below this width, panels stack vertically (MountainProgress on the
// bottom) instead of side by side (MountainProgress on the left).
const LARGE_SCREEN_BREAKPOINT = 700;

initSentry();

export default function App() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= LARGE_SCREEN_BREAKPOINT;
  const [fontsLoaded] = useFonts({ HennyPenny_400Regular });

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
        <QuestionPanel />
        <MountainProgress />
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
