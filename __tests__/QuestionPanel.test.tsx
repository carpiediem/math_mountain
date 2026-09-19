import { fireEvent, render } from "@testing-library/react-native";

import { QuestionPanel } from "../components/QuestionPanel";

const question = {
  prompt: "3 + 4",
  options: ["5", "7", "8", "12"],
  answer: "7",
};

describe("QuestionPanel", () => {
  it("shows the prompt", async () => {
    const { getByTestId } = await render(
      <QuestionPanel question={question} onAnswer={jest.fn()} />,
    );

    expect(getByTestId("question-prompt")).toHaveTextContent("3 + 4");
  });

  it("renders a button for each option", async () => {
    const { getAllByRole } = await render(
      <QuestionPanel question={question} onAnswer={jest.fn()} />,
    );

    expect(getAllByRole("button")).toHaveLength(4);
  });

  it("lays the buttons out in two rows of two, below the prompt", async () => {
    const { getByTestId, getByText } = await render(
      <QuestionPanel question={question} onAnswer={jest.fn()} />,
    );
    const rows = getByTestId("question-panel").children.slice(1) as {
      children: unknown[];
    }[];

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.children.length)).toEqual([2, 2]);
    ["5", "7", "8", "12"].forEach((o) => expect(getByText(o)).toBeVisible());
  });

  it("reports the pressed option", async () => {
    const onAnswer = jest.fn();
    const { getByText } = await render(
      <QuestionPanel question={question} onAnswer={onAnswer} />,
    );

    await fireEvent.press(getByText("8"));

    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer).toHaveBeenCalledWith("8");
  });
});
