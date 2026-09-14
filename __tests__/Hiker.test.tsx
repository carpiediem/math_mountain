import { act, render } from "@testing-library/react-native";

import { Hiker } from "../components/Hiker";

function flatten(style: unknown): Record<string, unknown> {
  return Object.assign({}, ...[style].flat(Infinity));
}

function getTranslate(
  queryByTestId: Awaited<ReturnType<typeof render>>["queryByTestId"],
) {
  const image = queryByTestId("hiker-sprite");
  const transform = flatten(image?.props.style).transform as {
    translateX?: number;
    translateY?: number;
  }[];
  return {
    x: transform.find((t) => "translateX" in t)?.translateX,
    y: transform.find((t) => "translateY" in t)?.translateY,
  };
}

describe("Hiker", () => {
  it("renders facing right by default", async () => {
    const { queryByTestId } = await render(
      <Hiker top={0} left={0} size={100} faceLeft={false} animate={false} />,
    );

    expect(queryByTestId("hiker")).not.toBeNull();
    expect(getTranslate(queryByTestId)).toEqual({ x: -0, y: -0 });
  });

  it("switches to the facing-left row when faceLeft is true", async () => {
    const { queryByTestId } = await render(
      <Hiker top={0} left={0} size={100} faceLeft={true} animate={false} />,
    );

    expect(getTranslate(queryByTestId).y).toBe(-100);
  });

  it("cycles frames while animating and stops back on frame 0", async () => {
    jest.useFakeTimers();

    const { queryByTestId } = await render(
      <Hiker
        top={0}
        left={0}
        size={100}
        faceLeft={false}
        animate={true}
        durationMs={500}
      />,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(150);
    });
    expect(getTranslate(queryByTestId).x).toBe(-100);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1000);
    });
    expect(getTranslate(queryByTestId).x).toBe(-0);

    jest.useRealTimers();
  });

  it("animates to a new position when top/left change, but not on mount", async () => {
    jest.useFakeTimers();

    const { queryByTestId, rerender } = await render(
      <Hiker top={0} left={0} size={100} faceLeft={false} animate={false} />,
    );
    const getPosition = () => {
      const style = flatten(queryByTestId("hiker")?.props.style);
      return { top: style.top, left: style.left };
    };

    // No animation on mount - it should already be at its starting spot.
    expect(getPosition()).toEqual({ top: 0, left: 0 });

    await act(async () => {
      await rerender(
        <Hiker
          top={50}
          left={20}
          size={100}
          faceLeft={false}
          animate={false}
        />,
      );
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(500);
    });

    expect(getPosition()).toEqual({ top: 50, left: 20 });

    jest.useRealTimers();
  });
});
