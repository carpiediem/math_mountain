import { Dimensions } from "react-native";
import { act, fireEvent, render } from "@testing-library/react-native";

import App from "../App";

function flatten(style: unknown): Record<string, unknown> {
  return Object.assign({}, ...[style].flat(Infinity));
}

describe("App", () => {
  const ORIGINAL_WINDOW_DIMENSIONS = Dimensions.get("window");

  afterEach(async () => {
    await act(async () => {
      Dimensions.set({ window: ORIGINAL_WINDOW_DIMENSIONS });
    });
  });

  it("renders both panels", async () => {
    const { getByText, getByTestId } = await render(<App />);

    await fireEvent(getByTestId("mountain-progress"), "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 800 } },
    });

    expect(getByText("QuestionPanel")).toBeVisible();
    expect(getByText("Math Mountain")).toBeVisible();
  });

  it("lays out MountainProgress alongside QuestionPanel on large screens", async () => {
    const { getByTestId } = await render(<App />);

    await act(async () => {
      Dimensions.set({
        window: { ...ORIGINAL_WINDOW_DIMENSIONS, width: 1024 },
      });
    });

    expect(flatten(getByTestId("app-root").props.style)).toMatchObject({
      flexDirection: "row-reverse",
    });
  });

  it("stacks MountainProgress below QuestionPanel on small screens", async () => {
    const { getByTestId } = await render(<App />);

    await act(async () => {
      Dimensions.set({
        window: { ...ORIGINAL_WINDOW_DIMENSIONS, width: 400 },
      });
    });

    expect(flatten(getByTestId("app-root").props.style)).toMatchObject({
      flexDirection: "column",
    });
  });

  it("only applies the label's first layout measurement", async () => {
    const { getByTestId } = await render(<App />);

    await fireEvent(getByTestId("mountain-progress"), "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 800 } },
    });
    await fireEvent(getByTestId("mountain-progress-label"), "layout", {
      nativeEvent: { layout: { width: 100 } },
    });
    const fontSizeAfterFirstMeasurement = flatten(
      getByTestId("mountain-progress-label").props.style,
    ).fontSize;

    await fireEvent(getByTestId("mountain-progress-label"), "layout", {
      nativeEvent: { layout: { width: 999 } },
    });

    expect(
      flatten(getByTestId("mountain-progress-label").props.style).fontSize,
    ).toBe(fontSizeAfterFirstMeasurement);
  });
});
