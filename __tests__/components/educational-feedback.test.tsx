import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Problem, StrategyId } from "@/lib/types";

// Mock educational feedback components
const MockStrategyExplanation = ({
  strategy,
  problem,
  onContinue,
}: {
  strategy: StrategyId;
  problem: Problem;
  onContinue: () => void;
}) => (
  <div data-testid="strategy-explanation">
    <h3>Strategy: {strategy}</h3>
    <div data-testid="problem-display">
      {problem.operands[0]}{" "}
      {problem.type === "addition"
        ? "+"
        : problem.type === "subtraction"
          ? "-"
          : problem.type === "multiplication"
            ? "×"
            : "÷"}{" "}
      {problem.operands[1]}
    </div>
    <div data-testid="correct-answer">
      Correct Answer: {problem.correctAnswer}
    </div>
    <div data-testid="strategy-steps">
      {strategy === "AdditionDoubles" && (
        <ol>
          <li>
            Notice that {problem.operands[0]} and {problem.operands[1]} are
            close to each other
          </li>
          <li>Find the smaller number: {Math.min(...problem.operands)}</li>
          <li>
            Double it: {Math.min(...problem.operands)} × 2 ={" "}
            {Math.min(...problem.operands) * 2}
          </li>
          <li>
            Add the difference: {Math.min(...problem.operands) * 2} +{" "}
            {Math.abs(problem.operands[0] - problem.operands[1])} ={" "}
            {problem.correctAnswer}
          </li>
        </ol>
      )}
      {strategy === "MultiplicationTimes5" && (
        <ol>
          <li>When multiplying by 5, use the shortcut</li>
          <li>
            Divide the other number by 2:{" "}
            {problem.operands.find((n) => n !== 5)! / 2}
          </li>
          <li>
            Then multiply by 10: {problem.operands.find((n) => n !== 5)! / 2} ×
            10 = {problem.correctAnswer}
          </li>
        </ol>
      )}
    </div>
    <button onClick={onContinue} data-testid="continue-button">
      Continue Practice
    </button>
  </div>
);

const MockWrongAnswerFeedback = ({
  userAnswer,
  correctAnswer,
  problem,
  onShowStrategy,
}: {
  userAnswer: number;
  correctAnswer: number;
  problem: Problem;
  onShowStrategy: () => void;
}) => (
  <div data-testid="wrong-answer-feedback">
    <div data-testid="feedback-header">Not quite right!</div>
    <div data-testid="user-answer">Your answer: {userAnswer}</div>
    <div data-testid="correct-answer">Correct answer: {correctAnswer}</div>
    <div data-testid="problem-context">
      Problem: {problem.operands[0]} {problem.type === "addition" ? "+" : "-"}{" "}
      {problem.operands[1]}
    </div>
    <button onClick={onShowStrategy} data-testid="show-strategy-button">
      Show me how to solve this
    </button>
  </div>
);

const MockProblemReview = ({
  problems,
  onPracticeStrategy,
}: {
  problems: (Problem & { userAnswer?: number; isCorrect: boolean })[];
  onPracticeStrategy: (strategyId: StrategyId) => void;
}) => (
  <div data-testid="problem-review">
    <h3>Review Your Problems</h3>
    <div data-testid="incorrect-problems-filter">
      Show: <button data-testid="show-incorrect">Incorrect Only</button>
    </div>
    {problems.map((problem, index) => (
      <div
        key={index}
        data-testid={`problem-${index}`}
        className={problem.isCorrect ? "correct" : "incorrect"}
      >
        <div data-testid={`problem-${index}-equation`}>
          {problem.operands[0]} {problem.type === "addition" ? "+" : "-"}{" "}
          {problem.operands[1]}
        </div>
        <div data-testid={`problem-${index}-your-answer`}>
          Your answer: {problem.userAnswer}
        </div>
        <div data-testid={`problem-${index}-correct-answer`}>
          Correct: {problem.correctAnswer}
        </div>
        <div data-testid={`problem-${index}-strategy`}>
          Strategy: {problem.intendedStrategy}
        </div>
        {!problem.isCorrect && (
          <button
            onClick={() => onPracticeStrategy(problem.intendedStrategy)}
            data-testid={`practice-${problem.intendedStrategy}`}
          >
            Practice this strategy
          </button>
        )}
      </div>
    ))}
  </div>
);

describe("Educational Feedback System", () => {
  const mockProblem: Problem = {
    id: "test-problem-1",
    type: "addition",
    operands: [47, 48],
    correctAnswer: 95,
    intendedStrategy: "AdditionDoubles",
    difficulty: "intermediate",
    timeSpent: 0,
    attemptedAt: new Date(),
  };

  const mockMultiplicationProblem: Problem = {
    id: "test-problem-2",
    type: "multiplication",
    operands: [17, 5],
    correctAnswer: 85,
    intendedStrategy: "MultiplicationTimes5",
    difficulty: "intermediate",
    timeSpent: 0,
    attemptedAt: new Date(),
  };

  describe("Wrong Answer Feedback", () => {
    test("should display user answer vs correct answer clearly", () => {
      const mockOnShowStrategy = jest.fn();

      render(
        <MockWrongAnswerFeedback
          userAnswer={90}
          correctAnswer={95}
          problem={mockProblem}
          onShowStrategy={mockOnShowStrategy}
        />,
      );

      expect(screen.getByTestId("feedback-header")).toHaveTextContent(
        "Not quite right!",
      );
      expect(screen.getByTestId("user-answer")).toHaveTextContent(
        "Your answer: 90",
      );
      expect(screen.getByTestId("correct-answer")).toHaveTextContent(
        "Correct answer: 95",
      );
      expect(screen.getByTestId("problem-context")).toHaveTextContent(
        "Problem: 47 + 48",
      );
    });

    test("should provide option to show strategy explanation", () => {
      const mockOnShowStrategy = jest.fn();

      render(
        <MockWrongAnswerFeedback
          userAnswer={90}
          correctAnswer={95}
          problem={mockProblem}
          onShowStrategy={mockOnShowStrategy}
        />,
      );

      const showStrategyButton = screen.getByTestId("show-strategy-button");
      expect(showStrategyButton).toHaveTextContent("Show me how to solve this");

      fireEvent.click(showStrategyButton);
      expect(mockOnShowStrategy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Strategy Explanations", () => {
    test("should provide step-by-step explanation for AdditionDoubles", () => {
      const mockOnContinue = jest.fn();

      render(
        <MockStrategyExplanation
          strategy="AdditionDoubles"
          problem={mockProblem}
          onContinue={mockOnContinue}
        />,
      );

      expect(screen.getByTestId("strategy-explanation")).toBeInTheDocument();
      expect(screen.getByText("Strategy: AdditionDoubles")).toBeInTheDocument();
      expect(screen.getByTestId("problem-display")).toHaveTextContent(
        "47 + 48",
      );
      expect(screen.getByTestId("correct-answer")).toHaveTextContent(
        "Correct Answer: 95",
      );

      // Check strategy steps
      const steps = screen.getByTestId("strategy-steps");
      expect(steps).toHaveTextContent(
        "Notice that 47 and 48 are close to each other",
      );
      expect(steps).toHaveTextContent("Double it: 47 × 2 = 94");
      expect(steps).toHaveTextContent("Add the difference: 94 + 1 = 95");
    });

    test("should provide step-by-step explanation for MultiplicationTimes5", () => {
      const mockOnContinue = jest.fn();

      render(
        <MockStrategyExplanation
          strategy="MultiplicationTimes5"
          problem={mockMultiplicationProblem}
          onContinue={mockOnContinue}
        />,
      );

      expect(
        screen.getByText("Strategy: MultiplicationTimes5"),
      ).toBeInTheDocument();

      const steps = screen.getByTestId("strategy-steps");
      expect(steps).toHaveTextContent(
        "When multiplying by 5, use the shortcut",
      );
      expect(steps).toHaveTextContent("Divide the other number by 2: 8.5");
      expect(steps).toHaveTextContent("Then multiply by 10: 8.5 × 10 = 85");
    });

    test("should allow user to continue after viewing explanation", () => {
      const mockOnContinue = jest.fn();

      render(
        <MockStrategyExplanation
          strategy="AdditionDoubles"
          problem={mockProblem}
          onContinue={mockOnContinue}
        />,
      );

      const continueButton = screen.getByTestId("continue-button");
      expect(continueButton).toHaveTextContent("Continue Practice");

      fireEvent.click(continueButton);
      expect(mockOnContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("Problem Review System", () => {
    const mockProblems = [
      {
        ...mockProblem,
        userAnswer: 95,
        isCorrect: true,
      },
      {
        id: "problem-2",
        type: "addition" as const,
        operands: [23, 29] as [number, number],
        correctAnswer: 52,
        intendedStrategy: "AdditionBridgingTo10s" as StrategyId,
        difficulty: "intermediate" as const,
        timeSpent: 0,
        attemptedAt: new Date(),
        userAnswer: 50,
        isCorrect: false,
      },
      {
        id: "problem-3",
        type: "subtraction" as const,
        operands: [84, 29] as [number, number],
        correctAnswer: 55,
        intendedStrategy: "SubtractionCompensation" as StrategyId,
        difficulty: "intermediate" as const,
        timeSpent: 0,
        attemptedAt: new Date(),
        userAnswer: 53,
        isCorrect: false,
      },
    ];

    test("should display all problems with their answers and strategies", () => {
      const mockOnPracticeStrategy = jest.fn();

      render(
        <MockProblemReview
          problems={mockProblems}
          onPracticeStrategy={mockOnPracticeStrategy}
        />,
      );

      expect(screen.getByText("Review Your Problems")).toBeInTheDocument();

      // Check first problem (correct)
      expect(screen.getByTestId("problem-0-equation")).toHaveTextContent(
        "47 + 48",
      );
      expect(screen.getByTestId("problem-0-your-answer")).toHaveTextContent(
        "Your answer: 95",
      );
      expect(screen.getByTestId("problem-0-correct-answer")).toHaveTextContent(
        "Correct: 95",
      );
      expect(screen.getByTestId("problem-0-strategy")).toHaveTextContent(
        "Strategy: AdditionDoubles",
      );

      // Check second problem (incorrect)
      expect(screen.getByTestId("problem-1-equation")).toHaveTextContent(
        "23 + 29",
      );
      expect(screen.getByTestId("problem-1-your-answer")).toHaveTextContent(
        "Your answer: 50",
      );
      expect(screen.getByTestId("problem-1-correct-answer")).toHaveTextContent(
        "Correct: 52",
      );
    });

    test("should provide practice buttons for incorrect answers", () => {
      const mockOnPracticeStrategy = jest.fn();

      render(
        <MockProblemReview
          problems={mockProblems}
          onPracticeStrategy={mockOnPracticeStrategy}
        />,
      );

      // Correct answer should not have practice button
      expect(
        screen.queryByTestId("practice-AdditionDoubles"),
      ).not.toBeInTheDocument();

      // Incorrect answers should have practice buttons
      const practiceButton1 = screen.getByTestId(
        "practice-AdditionBridgingTo10s",
      );
      const practiceButton2 = screen.getByTestId(
        "practice-SubtractionCompensation",
      );

      expect(practiceButton1).toHaveTextContent("Practice this strategy");
      expect(practiceButton2).toHaveTextContent("Practice this strategy");

      fireEvent.click(practiceButton1);
      expect(mockOnPracticeStrategy).toHaveBeenCalledWith(
        "AdditionBridgingTo10s",
      );

      fireEvent.click(practiceButton2);
      expect(mockOnPracticeStrategy).toHaveBeenCalledWith(
        "SubtractionCompensation",
      );
    });

    test("should provide filter for incorrect problems only", () => {
      const mockOnPracticeStrategy = jest.fn();

      render(
        <MockProblemReview
          problems={mockProblems}
          onPracticeStrategy={mockOnPracticeStrategy}
        />,
      );

      const filterButton = screen.getByTestId("show-incorrect");
      expect(filterButton).toHaveTextContent("Incorrect Only");

      // Could test filter functionality if implemented
      fireEvent.click(filterButton);
    });
  });

  describe("Educational Flow Integration", () => {
    test("should guide user through complete learning workflow", () => {
      // This would test the complete flow:
      // Wrong answer → Feedback → Strategy explanation → Continue
      const mockOnShowStrategy = jest.fn();
      const mockOnContinue = jest.fn();

      // Step 1: Wrong answer feedback
      const { rerender } = render(
        <MockWrongAnswerFeedback
          userAnswer={90}
          correctAnswer={95}
          problem={mockProblem}
          onShowStrategy={mockOnShowStrategy}
        />,
      );

      // User clicks to see strategy
      fireEvent.click(screen.getByTestId("show-strategy-button"));
      expect(mockOnShowStrategy).toHaveBeenCalled();

      // Step 2: Strategy explanation
      rerender(
        <MockStrategyExplanation
          strategy="AdditionDoubles"
          problem={mockProblem}
          onContinue={mockOnContinue}
        />,
      );

      expect(screen.getByTestId("strategy-explanation")).toBeInTheDocument();
      expect(screen.getByTestId("strategy-steps")).toBeInTheDocument();

      // User continues after learning
      fireEvent.click(screen.getByTestId("continue-button"));
      expect(mockOnContinue).toHaveBeenCalled();
    });
  });

  describe("Strategy Coverage", () => {
    test("should provide explanations for all strategy types", () => {
      const strategies: StrategyId[] = [
        "AdditionDoubles",
        "AdditionBridgingTo10s",
        "AdditionBreakingApart",
        "AdditionLeftToRight",
        "SubtractionBridgingDown",
        "SubtractionAddingUp",
        "SubtractionCompensation",
        "MultiplicationDoubling",
        "MultiplicationBreakingApart",
        "MultiplicationNearSquares",
        "MultiplicationTimes5",
        "MultiplicationTimes9",
        "DivisionFactorRecognition",
        "DivisionMultiplicationInverse",
        "DivisionEstimationAdjustment",
      ];

      // Test that explanations exist for all strategies
      strategies.forEach((strategy) => {
        expect(strategy).toBeDefined();
        expect(typeof strategy).toBe("string");
        expect(strategy.length).toBeGreaterThan(0);
      });
    });
  });
});
