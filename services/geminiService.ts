import { evaluate } from "mathjs";

export const solveProblem = async (text: string) => {
  try {
    const result = evaluate(text); // "10+20" → 30
    console.log("Result:", result);
    return result;
  } catch (error) {
    console.error("Invalid expression:", error);
  }
};
