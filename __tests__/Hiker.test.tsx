import { render } from "@testing-library/react-native";

import { Hiker } from "../components/Hiker";

const IMAGE_LAYOUT = { top: 0, left: 0, width: 400, height: 300 };

describe("Hiker", () => {
  it("renders a marker for a step within range", async () => {
    const { queryByTestId } = await render(
      <Hiker step={0} imageLayout={IMAGE_LAYOUT} />,
    );

    expect(queryByTestId("hiker")).not.toBeNull();
  });

  it("renders nothing for a step below the valid range", async () => {
    const { queryByTestId } = await render(
      <Hiker step={-1} imageLayout={IMAGE_LAYOUT} />,
    );

    expect(queryByTestId("hiker")).toBeNull();
  });

  it("renders nothing for a step above the valid range", async () => {
    const { queryByTestId } = await render(
      <Hiker step={15} imageLayout={IMAGE_LAYOUT} />,
    );

    expect(queryByTestId("hiker")).toBeNull();
  });
});
