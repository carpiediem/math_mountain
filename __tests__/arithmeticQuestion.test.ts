import {
  generateQuestion,
  type Difficulty,
  type Operation,
} from "../utils/arithmeticQuestion";

const OPS: Operation[] = ["+", "-", "x", "/"];
const LEVELS: Difficulty[] = [1, 2, 3];
const RUNS = 300;

const GLYPH_VALUES: Record<string, number> = {
  "½": 1 / 2,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 1 / 4,
  "¾": 3 / 4,
};

// Parses "3", "2.5", "½", "3 ¾" or "5/6" (the un-glyphed fallback).
function parse(text: string): number {
  return text
    .trim()
    .split(" ")
    .reduce((sum, part) => {
      if (part in GLYPH_VALUES) return sum + GLYPH_VALUES[part];
      if (part.includes("/")) {
        const [n, d] = part.split("/").map(Number);
        return sum + n / d;
      }
      return sum + Number(part);
    }, 0);
}

function evaluate(prompt: string): number {
  const [, left, op, right] = prompt.match(/^(.+?) ([+\-x/]) (.+)$/)!;
  const a = parse(left);
  const b = parse(right);
  return { "+": a + b, "-": a - b, x: a * b, "/": a / b }[op as Operation];
}

// Seeded generator so failures are reproducible.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe.each(OPS)("generateQuestion with %s", (op) => {
  describe.each(LEVELS)("at difficulty %i", (level) => {
    const questions = Array.from({ length: RUNS }, (_, i) =>
      generateQuestion(op, level, seeded(i + 1)),
    );

    it("uses the requested operator", () => {
      for (const q of questions) expect(q.prompt).toContain(` ${op} `);
    });

    it("has a correct answer that matches the prompt", () => {
      for (const q of questions) {
        expect(parse(q.answer)).toBeCloseTo(evaluate(q.prompt), 2);
      }
    });

    it("offers four distinct options including the answer", () => {
      for (const q of questions) {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.options).toContain(q.answer);
      }
    });

    it("never offers a negative or non-finite option", () => {
      for (const q of questions) {
        for (const option of q.options) {
          const value = parse(option);
          expect(Number.isFinite(value)).toBe(true);
          expect(value).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it("keeps operands within range", () => {
      const max = level === 1 ? 10 : level === 2 ? 20 : 10;
      for (const q of questions) {
        const [, left, , right] = q.prompt.match(/^(.+?) ([+\-x/]) (.+)$/)!;
        for (const operand of [left, right]) {
          const value = parse(operand);
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(max);
        }
      }
    });
  });
});

describe("whole-number levels", () => {
  it.each([1, 2] as Difficulty[])(
    "level %i uses integers only, with exact division",
    (level) => {
      for (let i = 0; i < RUNS; i++) {
        const q = generateQuestion("/", level, seeded(i + 1));
        expect(q.prompt).toMatch(/^\d+ \/ \d+$/);
        expect(q.prompt.endsWith(" / 0")).toBe(false);
        expect(Number.isInteger(parse(q.answer))).toBe(true);
        q.options.forEach((o) => expect(o).toMatch(/^\d+$/));
      }
    },
  );
});

describe("difficulty 3", () => {
  it("only uses fractions or single-digit decimals as operands", () => {
    for (const op of OPS) {
      for (let i = 0; i < RUNS; i++) {
        const q = generateQuestion(op, 3, seeded(i + 1));
        const [, left, , right] = q.prompt.match(/^(.+?) ([+\-x/]) (.+)$/)!;
        for (const operand of [left, right]) {
          expect(operand).toMatch(/^(\d+\.\d|(\d+ )?[½⅓⅔¼¾])$/);
        }
      }
    }
  });

  it("produces both decimal and fraction operands", () => {
    const prompts = Array.from(
      { length: RUNS },
      (_, i) => generateQuestion("+", 3, seeded(i + 1)).prompt,
    );
    expect(prompts.some((p) => /\d\.\d/.test(p))).toBe(true);
    expect(prompts.some((p) => /[½⅓⅔¼¾]/.test(p))).toBe(true);
  });
});

describe("edge cases", () => {
  it("never divides by zero", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const q = generateQuestion("/", level, seeded(i + 1));
        expect(Number.isFinite(parse(q.answer))).toBe(true);
      }
    }
  });

  it("swaps operands so subtraction is never negative", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const q = generateQuestion("-", level, seeded(i + 1));
        expect(parse(q.answer)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is deterministic for a given random source", () => {
    expect(generateQuestion("x", 3, seeded(7))).toEqual(
      generateQuestion("x", 3, seeded(7)),
    );
  });

  it("uses Math.random by default", () => {
    const q = generateQuestion("+", 1);
    expect(q.options).toHaveLength(4);
  });
});
