export type Operation = "+" | "-" | "x" | "/";
export type Difficulty = 1 | 2 | 3;
export type Rng = () => number;

export type ArithmeticQuestion = {
  prompt: string;
  options: string[];
  answer: string;
};

type Fraction = { n: number; d: number };
type Operand = { value: Fraction; text: string; decimal: boolean };

const GLYPHS: Record<string, string> = {
  "1/2": "½",
  "1/3": "⅓",
  "2/3": "⅔",
  "1/4": "¼",
  "3/4": "¾",
};
const FRACTION_PARTS: Fraction[] = [
  { n: 1, d: 2 },
  { n: 1, d: 3 },
  { n: 2, d: 3 },
  { n: 1, d: 4 },
  { n: 3, d: 4 },
];
const OPERATIONS: Operation[] = ["+", "-", "x", "/"];
const MAX_BY_DIFFICULTY: Record<1 | 2, number> = { 1: 10, 2: 20 };

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const frac = (n: number, d = 1): Fraction => {
  const g = gcd(Math.abs(n), d) || 1;
  return { n: n / g, d: d / g };
};

const randInt = (rng: Rng, min: number, max: number) =>
  min + Math.floor(rng() * (max - min + 1));

const compare = (a: Fraction, b: Fraction) => a.n * b.d - b.n * a.d;

function apply(op: Operation, a: Fraction, b: Fraction): Fraction {
  switch (op) {
    case "+":
      return frac(a.n * b.d + b.n * a.d, a.d * b.d);
    case "-":
      return frac(a.n * b.d - b.n * a.d, a.d * b.d);
    case "x":
      return frac(a.n * b.n, a.d * b.d);
    case "/":
      return frac(a.n * b.d, a.d * b.n);
  }
}

function formatFraction({ n, d }: Fraction, asDecimal: boolean): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (d === 1) return asDecimal ? `${sign}${abs}.0` : `${sign}${abs}`;
  if (asDecimal) return (n / d).toFixed(2).replace(/(\.\d)0$/, "$1");
  const whole = Math.floor(abs / d);
  const rest = abs % d;
  const part = GLYPHS[`${rest}/${d}`] ?? `${rest}/${d}`;
  return `${sign}${whole > 0 ? `${whole} ` : ""}${part}`;
}

// A decimal is only used for display when it terminates in at most two
// places; otherwise (e.g. 0.5 / 0.3) the answer falls back to a fraction.
const terminatesInHundredths = ({ d }: Fraction) => 100 % d === 0;

function randomOperand(rng: Rng, difficulty: Difficulty): Operand {
  if (difficulty !== 3) {
    const n = randInt(rng, 0, MAX_BY_DIFFICULTY[difficulty]);
    return { value: frac(n), text: String(n), decimal: false };
  }
  if (rng() < 0.5) {
    const tenths = randInt(rng, 0, 100);
    return {
      value: frac(tenths, 10),
      text: (tenths / 10).toFixed(1),
      decimal: true,
    };
  }
  const whole = randInt(rng, 0, 9);
  const part = FRACTION_PARTS[randInt(rng, 0, FRACTION_PARTS.length - 1)];
  const value = frac(whole * part.d + part.n, part.d);
  return {
    value,
    text: `${whole > 0 ? `${whole} ` : ""}${GLYPHS[`${part.n}/${part.d}`]}`,
    decimal: false,
  };
}

function isZero(f: Fraction) {
  return f.n === 0;
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Whole-number levels get a clean division (an integer quotient) so the
// answer options stay integers; subtraction never goes negative.
function pickOperands(
  op: Operation,
  difficulty: Difficulty,
  rng: Rng,
): [Operand, Operand] {
  if (difficulty !== 3 && op === "/") {
    const max = MAX_BY_DIFFICULTY[difficulty];
    const divisor = randInt(rng, 1, max);
    const quotient = randInt(rng, 0, Math.floor(max / divisor));
    const operand = (n: number): Operand => ({
      value: frac(n),
      text: String(n),
      decimal: false,
    });
    return [operand(divisor * quotient), operand(divisor)];
  }
  let a = randomOperand(rng, difficulty);
  let b = randomOperand(rng, difficulty);
  if (op === "/") {
    while (isZero(b.value)) b = randomOperand(rng, difficulty);
  }
  if (op === "-" && compare(a.value, b.value) < 0) [a, b] = [b, a];
  return [a, b];
}

function distractors(
  correct: Fraction,
  op: Operation,
  a: Fraction,
  b: Fraction,
  asDecimal: boolean,
  rng: Rng,
): Fraction[] {
  const unit = asDecimal ? frac(1, 10) : frac(1, correct.d);
  const wrongOps = OPERATIONS.filter((o) => o !== op)
    .filter((o) => o !== "/" || !isZero(b))
    .map((o) => apply(o, a, b));
  const near: Fraction[] = [];
  for (let k = 1; k <= 12; k++) {
    for (const sign of [1, -1]) {
      near.push(
        frac(
          correct.n * unit.d + sign * k * unit.n * correct.d,
          correct.d * unit.d,
        ),
      );
    }
  }

  const seen = new Set([formatFraction(correct, asDecimal)]);
  const picked: Fraction[] = [];
  const consider = (candidate: Fraction) => {
    const key = formatFraction(candidate, asDecimal);
    if (picked.length >= 3 || seen.has(key) || candidate.n < 0) return;
    if (asDecimal && !terminatesInHundredths(candidate)) return;
    seen.add(key);
    picked.push(candidate);
  };

  // Prefer answers a student might reach by mistake (a different operation,
  // or an off-by-a-little slip), then fill up with nearby values.
  const mistakes = shuffle(wrongOps, rng).slice(0, 1);
  mistakes.forEach(consider);
  shuffle(near.slice(0, 6), rng).forEach(consider);
  shuffle(near.slice(6), rng).forEach(consider);
  return picked;
}

export function generateQuestion(
  op: Operation,
  difficulty: Difficulty,
  rng: Rng = Math.random,
): ArithmeticQuestion {
  const [a, b] = pickOperands(op, difficulty, rng);
  const correct = apply(op, a.value, b.value);
  // Any decimal operand means a decimal answer, unless that answer doesn't
  // terminate (e.g. 0.5 / 0.3), where the fraction form is the exact one.
  const useDecimal =
    (a.decimal || b.decimal) && terminatesInHundredths(correct);

  const answer = formatFraction(correct, useDecimal);
  const wrong = distractors(correct, op, a.value, b.value, useDecimal, rng);
  const options = shuffle(
    [answer, ...wrong.map((f) => formatFraction(f, useDecimal))],
    rng,
  );
  return { prompt: `${a.text} ${op} ${b.text}`, options, answer };
}
