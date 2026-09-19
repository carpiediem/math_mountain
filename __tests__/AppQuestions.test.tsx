import { fireEvent, render } from "@testing-library/react-native";

import App, { difficultyForStep } from "../App";
import { STEP_COUNT } from "../components/mountainSteps";
import { generateQuestion } from "../utils/arithmeticQuestion";

jest.mock("../utils/arithmeticQuestion", () => ({
  generateQuestion: jest.fn(),
}));
jest.mock("../components/MountainProgress", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  return {
    MountainProgress: ({ hikerStep }: { hikerStep: number }) => (
      <Text testID="mountain-progress">{`step ${hikerStep}`}</Text>
    ),
  };
});

const mockGenerateQuestion = generateQuestion as jest.Mock;

// Every question is "N + 0" with correct answer "right" and one wrong option.
let count: number;
beforeEach(() => {
  count = 0;
  mockGenerateQuestion.mockReset();
  mockGenerateQuestion.mockImplementation(() => ({
    prompt: `q${++count}`,
    options: ["right", "wrong1", "wrong2", "wrong3"],
    answer: "right",
  }));
});

describe("difficultyForStep", () => {
  it("maps the climb to levels 1-3 in thirds", () => {
    expect(difficultyForStep(0)).toBe(1);
    expect(difficultyForStep(4)).toBe(1);
    expect(difficultyForStep(5)).toBe(2);
    expect(difficultyForStep(9)).toBe(2);
    expect(difficultyForStep(10)).toBe(3);
    expect(difficultyForStep(STEP_COUNT - 1)).toBe(3);
  });
});

describe("App question flow", () => {
  it("starts at step 0 with a level 1 question", async () => {
    const { getByTestId } = await render(<App />);

    expect(getByTestId("mountain-progress")).toHaveTextContent("step 0");
    expect(getByTestId("question-prompt")).toHaveTextContent("q1");
    expect(mockGenerateQuestion).toHaveBeenCalledWith(
      expect.stringMatching(/^[+\-x/]$/),
      1,
    );
  });

  it("moves up a step and asks a new question on a correct answer", async () => {
    const { getByTestId, getByText } = await render(<App />);

    await fireEvent.press(getByText("right"));

    expect(getByTestId("mountain-progress")).toHaveTextContent("step 1");
    expect(getByTestId("question-prompt")).toHaveTextContent("q2");
  });

  it("moves down a step on a wrong answer", async () => {
    const { getByTestId, getByText } = await render(<App />);

    await fireEvent.press(getByText("right"));
    await fireEvent.press(getByText("right"));
    await fireEvent.press(getByText("wrong1"));

    expect(getByTestId("mountain-progress")).toHaveTextContent("step 1");
    expect(getByTestId("question-prompt")).toHaveTextContent("q4");
  });

  it("stays at the bottom on a wrong answer, but still asks a new question", async () => {
    const { getByTestId, getByText } = await render(<App />);

    await fireEvent.press(getByText("wrong2"));

    expect(getByTestId("mountain-progress")).toHaveTextContent("step 0");
    expect(getByTestId("question-prompt")).toHaveTextContent("q2");
  });

  it("stays at the peak on a correct answer", async () => {
    const { getByTestId, getByText } = await render(<App />);

    for (let i = 0; i < STEP_COUNT + 2; i++) {
      await fireEvent.press(getByText("right"));
    }

    expect(getByTestId("mountain-progress")).toHaveTextContent(
      `step ${STEP_COUNT - 1}`,
    );
  });

  it("raises the difficulty as the hiker climbs", async () => {
    const { getByText } = await render(<App />);

    for (let i = 0; i < 5; i++) {
      await fireEvent.press(getByText("right"));
    }

    expect(mockGenerateQuestion).toHaveBeenLastCalledWith(
      expect.any(String),
      2,
    );
  });
});
