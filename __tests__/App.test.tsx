import { fireEvent, render } from "@testing-library/react-native";

import App from "../App";

describe("App", () => {
  it("renders both panels", async () => {
    const { getByText, getByTestId } = await render(<App />);

    await fireEvent(getByTestId("mountain-progress"), "layout", {
      nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 800 } },
    });

    expect(getByText("QuestionPanel")).toBeVisible();
    expect(getByText("Math Mountain")).toBeVisible();
  });
});
