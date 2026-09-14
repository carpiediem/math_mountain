import { act, render } from "@testing-library/react-native";

import { Goat } from "../components/Goat";

function flatten(style: unknown): Record<string, unknown> {
  return Object.assign({}, ...[style].flat(Infinity));
}

function getTranslateX(
  queryByTestId: Awaited<ReturnType<typeof render>>["queryByTestId"],
) {
  const image = queryByTestId("goat-sprite");
  const transform = flatten(image?.props.style).transform as {
    translateX?: number;
  }[];
  return transform.find((t) => "translateX" in t)?.translateX;
}

describe("Goat", () => {
  it("renders on frame 0 when not animating", async () => {
    const { queryByTestId } = await render(
      <Goat top={0} left={0} size={100} animate={false} error={false} />,
    );

    expect(queryByTestId("goat")).not.toBeNull();
    expect(getTranslateX(queryByTestId)).toBe(-0);
  });

  it("cycles frames while animating and stops back on frame 0", async () => {
    jest.useFakeTimers();

    const { queryByTestId } = await render(
      <Goat
        top={0}
        left={0}
        size={100}
        animate={true}
        durationMs={500}
        error={false}
      />,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(120);
    });
    expect(getTranslateX(queryByTestId)).toBe(-75);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });
    expect(getTranslateX(queryByTestId)).toBe(-0);

    jest.useRealTimers();
  });

  it("shows the error face instead of the walk cycle when error is true", async () => {
    const { queryByTestId } = await render(
      <Goat top={0} left={0} size={100} animate={false} error={true} />,
    );

    expect(getTranslateX(queryByTestId)).toBe(-600);
  });

  it("shows the error face even while animating", async () => {
    jest.useFakeTimers();

    const { queryByTestId } = await render(
      <Goat top={0} left={0} size={100} animate={true} error={true} />,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(120);
    });
    expect(getTranslateX(queryByTestId)).toBe(-600);

    jest.useRealTimers();
  });
});
