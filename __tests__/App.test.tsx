import { render } from "@testing-library/react-native";

import App from "../App";

describe("App", () => {
  it("renders both panels", async () => {
    const { getByText } = await render(<App />);

    expect(getByText("QuestionPanel")).toBeVisible();
    expect(getByText("MountainProgress")).toBeVisible();
  });
});
