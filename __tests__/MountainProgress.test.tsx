import { act, fireEvent, render } from "@testing-library/react-native";

import { MountainProgress } from "../components/MountainProgress";

function flatten(style: unknown): Record<string, unknown> {
  return Object.assign({}, ...[style].flat(Infinity));
}

type Screen = Awaited<ReturnType<typeof render>>;

function frameX(screen: Screen) {
  const transform = flatten(screen.getByTestId("hiker-sprite").props.style)
    .transform as { translateX?: number }[];
  // `-0` (frame 0) and `0` are both "standing"; normalize so toBe(0) works.
  return Math.abs(transform.find((t) => "translateX" in t)!.translateX!);
}

async function renderLaidOut(step: number) {
  const screen = await render(<MountainProgress hikerStep={step} />);
  await fireEvent(screen.getByTestId("mountain-progress"), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width: 400, height: 800 } },
  });
  return screen;
}

describe("MountainProgress hiker animation", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("doesn't animate the hiker on first render", async () => {
    const screen = await renderLaidOut(0);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });

    expect(frameX(screen)).toBe(0);
  });

  it("walks when the hiker moves to a new step, then stands again", async () => {
    const screen = await renderLaidOut(0);

    await screen.rerender(<MountainProgress hikerStep={1} />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(150);
    });
    expect(frameX(screen)).toBeGreaterThan(0);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(500);
    });
    expect(frameX(screen)).toBe(0);
  });

  it("walks again on each subsequent move", async () => {
    const screen = await renderLaidOut(0);

    await screen.rerender(<MountainProgress hikerStep={1} />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(600);
    });
    await screen.rerender(<MountainProgress hikerStep={2} />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(150);
    });

    expect(frameX(screen)).toBeGreaterThan(0);
  });

  it("doesn't walk when the step is unchanged", async () => {
    const screen = await renderLaidOut(3);

    await screen.rerender(<MountainProgress hikerStep={3} />);
    await act(async () => {
      await jest.advanceTimersByTimeAsync(300);
    });

    expect(frameX(screen)).toBe(0);
  });
});
