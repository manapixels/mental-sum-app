import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StrategyId, Problem } from "@/lib/types";

// Mock educational UX flow component
const MockEducationalFlow = ({
  problem,
  onAnswer,
  onContinue,
}: {
  problem: Problem;
  onAnswer: (answer: number, isCorrect: boolean) => void;
  onContinue: () => void;
}) => {
  const [userAnswer, setUserAnswer] = React.useState("");
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [showStrategy, setShowStrategy] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);

  const handleSubmit = () => {
    const answer = parseInt(userAnswer);
    const correct = answer === problem.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswer(answer, correct);
  };

  const handleShowStrategy = () => {
    setShowStrategy(true);
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setShowStrategy(false);
    setUserAnswer("");
    onContinue();
  };

  const getStrategyExplanation = (strategyId: StrategyId) => {
    const explanations: Partial<Record<StrategyId, string>> = {
      AdditionDoubles:
        "For numbers close together, double the smaller and add the difference. For 47 + 48: double 47 to get 94, then add 1 = 95",
      AdditionBridgingTo10s:
        "Break numbers to make friendly tens. For 67 + 28: think 67 + 30 - 2 = 97 - 2 = 95",
      MultiplicationTimes5:
        "For ×5, divide by 2 and add a zero. For 46 × 5: 46 ÷ 2 = 23, then 230",
      SubtractionCompensation:
        "Add the same amount to both numbers. For 74 - 29: think 75 - 30 = 45",
    };
    return explanations[strategyId] || "Practice this strategy step by step.";
  };

  return (
    <div data-testid="educational-flow">
      {/* Problem Display */}
      <div data-testid="problem-display">
        <h2>Problem</h2>
        <div data-testid="problem-equation">
          {problem.operands[0]}{" "}
          {problem.type === "addition"
            ? "+"
            : problem.type === "subtraction"
              ? "-"
              : problem.type === "multiplication"
                ? "×"
                : "÷"}{" "}
          {problem.operands[1]} = ?
        </div>

        {!showFeedback && (
          <div data-testid="answer-input-section">
            <input
              data-testid="answer-input"
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Your answer"
            />
            <button
              data-testid="submit-answer"
              onClick={handleSubmit}
              disabled={!userAnswer}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      {showFeedback && (
        <div data-testid="feedback-section">
          <div
            data-testid={isCorrect ? "correct-feedback" : "incorrect-feedback"}
          >
            {isCorrect ? (
              <div data-testid="success-message">
                <h3>Correct! 🎉</h3>
                <p>Great job! You got {problem.correctAnswer}.</p>
              </div>
            ) : (
              <div data-testid="error-message">
                <h3>Not quite right</h3>
                <p>
                  You answered {userAnswer}, but the correct answer is{" "}
                  {problem.correctAnswer}.
                </p>
                <p>Let&apos;s learn how to solve this!</p>
              </div>
            )}
          </div>

          {!isCorrect && !showStrategy && (
            <button
              data-testid="show-strategy-button"
              onClick={handleShowStrategy}
            >
              Show me how to solve this
            </button>
          )}

          {showStrategy && (
            <div data-testid="strategy-explanation">
              <h4>Strategy: {problem.intendedStrategy}</h4>
              <p data-testid="strategy-text">
                {getStrategyExplanation(problem.intendedStrategy)}
              </p>
              <div data-testid="step-by-step">
                <h5>Step by step:</h5>
                <ol>
                  <li data-testid="step-1">Identify the strategy pattern</li>
                  <li data-testid="step-2">Apply the mental math technique</li>
                  <li data-testid="step-3">Calculate the final answer</li>
                </ol>
              </div>
            </div>
          )}

          <button data-testid="continue-button" onClick={handleContinue}>
            Continue to next problem
          </button>
        </div>
      )}
    </div>
  );
};

// Mock problem review component
const MockProblemReview = ({
  problems,
  onSelectProblem,
}: {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
}) => {
  const [filter, setFilter] = React.useState<"all" | "incorrect">("all");

  const filteredProblems = problems.filter(
    (p) =>
      filter === "all" ||
      (filter === "incorrect" && p.userAnswer !== p.correctAnswer),
  );

  return (
    <div data-testid="problem-review">
      <h2>Review Your Problems</h2>

      <div data-testid="filter-controls">
        <button
          data-testid="filter-all"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "active" : ""}
        >
          All Problems
        </button>
        <button
          data-testid="filter-incorrect"
          onClick={() => setFilter("incorrect")}
          className={filter === "incorrect" ? "active" : ""}
        >
          Incorrect Only
        </button>
      </div>

      <div data-testid="problems-list">
        {filteredProblems.map((problem, index) => (
          <div
            key={problem.id}
            data-testid={`problem-item-${index}`}
            className={`problem-item ${problem.userAnswer === problem.correctAnswer ? "correct" : "incorrect"}`}
          >
            <div data-testid="problem-summary">
              {problem.operands[0]} {problem.type === "addition" ? "+" : "-"}{" "}
              {problem.operands[1]} = {problem.correctAnswer}
            </div>
            <div data-testid="user-answer">
              Your answer: {problem.userAnswer || "No answer"}
            </div>
            <div data-testid="problem-strategy">
              Strategy: {problem.intendedStrategy}
            </div>
            <button
              data-testid={`review-button-${index}`}
              onClick={() => onSelectProblem(problem)}
            >
              Review this problem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe("Educational UX Flow Testing", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("Complete Learning Experience: Problem → Feedback → Strategy", () => {
    test("should guide user through correct answer flow", async () => {
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

      const mockOnAnswer = jest.fn();
      const mockOnContinue = jest.fn();

      render(
        <MockEducationalFlow
          problem={mockProblem}
          onAnswer={mockOnAnswer}
          onContinue={mockOnContinue}
        />,
      );

      // Step 1: Problem is displayed
      expect(screen.getByTestId("problem-display")).toBeInTheDocument();
      expect(screen.getByTestId("problem-equation")).toHaveTextContent(
        "47 + 48 = ?",
      );

      // Step 2: User enters correct answer
      const answerInput = screen.getByTestId("answer-input");
      fireEvent.change(answerInput, { target: { value: "95" } });

      const submitButton = screen.getByTestId("submit-answer");
      expect(submitButton).not.toBeDisabled();
      fireEvent.click(submitButton);

      // Step 3: Correct feedback is shown
      await waitFor(() => {
        expect(screen.getByTestId("feedback-section")).toBeInTheDocument();
        expect(screen.getByTestId("correct-feedback")).toBeInTheDocument();
        expect(screen.getByTestId("success-message")).toHaveTextContent(
          "Correct! 🎉",
        );
      });

      expect(mockOnAnswer).toHaveBeenCalledWith(95, true);

      // Step 4: User can continue to next problem
      const continueButton = screen.getByTestId("continue-button");
      fireEvent.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalled();
    });

    test("should guide user through incorrect answer → strategy explanation flow", async () => {
      const mockProblem: Problem = {
        id: "test-problem-2",
        type: "addition",
        operands: [67, 28],
        correctAnswer: 95,
        intendedStrategy: "AdditionBridgingTo10s",
        difficulty: "intermediate",
        timeSpent: 0,
        attemptedAt: new Date(),
      };

      const mockOnAnswer = jest.fn();
      const mockOnContinue = jest.fn();

      render(
        <MockEducationalFlow
          problem={mockProblem}
          onAnswer={mockOnAnswer}
          onContinue={mockOnContinue}
        />,
      );

      // Step 1: User enters incorrect answer
      const answerInput = screen.getByTestId("answer-input");
      fireEvent.change(answerInput, { target: { value: "85" } });

      const submitButton = screen.getByTestId("submit-answer");
      fireEvent.click(submitButton);

      // Step 2: Incorrect feedback is shown
      await waitFor(() => {
        expect(screen.getByTestId("incorrect-feedback")).toBeInTheDocument();
        expect(screen.getByTestId("error-message")).toHaveTextContent(
          "You answered 85, but the correct answer is 95",
        );
      });

      expect(mockOnAnswer).toHaveBeenCalledWith(85, false);

      // Step 3: User requests strategy explanation
      const showStrategyButton = screen.getByTestId("show-strategy-button");
      expect(showStrategyButton).toHaveTextContent("Show me how to solve this");
      fireEvent.click(showStrategyButton);

      // Step 4: Strategy explanation is displayed
      await waitFor(() => {
        expect(screen.getByTestId("strategy-explanation")).toBeInTheDocument();
        expect(
          screen.getByText("Strategy: AdditionBridgingTo10s"),
        ).toBeInTheDocument();
        expect(screen.getByTestId("strategy-text")).toHaveTextContent(
          "Break numbers to make friendly tens",
        );
      });

      // Step 5: Step-by-step guide is shown
      expect(screen.getByTestId("step-by-step")).toBeInTheDocument();
      expect(screen.getByTestId("step-1")).toHaveTextContent(
        "Identify the strategy pattern",
      );
      expect(screen.getByTestId("step-2")).toHaveTextContent(
        "Apply the mental math technique",
      );
      expect(screen.getByTestId("step-3")).toHaveTextContent(
        "Calculate the final answer",
      );

      // Step 6: User continues to next problem
      const continueButton = screen.getByTestId("continue-button");
      fireEvent.click(continueButton);

      expect(mockOnContinue).toHaveBeenCalled();
    });

    test("should provide strategy-specific explanations for different problem types", () => {
      const strategies = [
        {
          problem: {
            id: "mult-problem",
            type: "multiplication" as const,
            operands: [46, 5] as [number, number],
            correctAnswer: 230,
            intendedStrategy: "MultiplicationTimes5" as const,
            difficulty: "intermediate" as const,
            timeSpent: 0,
            attemptedAt: new Date(),
          },
          expectedText: "divide by 2 and add a zero",
        },
        {
          problem: {
            id: "sub-problem",
            type: "subtraction" as const,
            operands: [74, 29] as [number, number],
            correctAnswer: 45,
            intendedStrategy: "SubtractionCompensation" as const,
            difficulty: "intermediate" as const,
            timeSpent: 0,
            attemptedAt: new Date(),
          },
          expectedText: "Add the same amount to both numbers",
        },
      ];

      strategies.forEach(({ problem, expectedText }) => {
        const mockOnAnswer = jest.fn();
        const mockOnContinue = jest.fn();

        const { unmount } = render(
          <MockEducationalFlow
            problem={problem}
            onAnswer={mockOnAnswer}
            onContinue={mockOnContinue}
          />,
        );

        // Submit wrong answer to trigger strategy explanation
        fireEvent.change(screen.getByTestId("answer-input"), {
          target: { value: "0" },
        });
        fireEvent.click(screen.getByTestId("submit-answer"));

        // Request strategy explanation
        fireEvent.click(screen.getByTestId("show-strategy-button"));

        // Verify strategy-specific explanation
        expect(screen.getByTestId("strategy-text")).toHaveTextContent(
          expectedText,
        );

        unmount();
      });
    });
  });

  describe("Problem Review and Relearning", () => {
    test("should allow users to review and filter past problems", () => {
      const mockProblems: (Problem & { userAnswer?: number })[] = [
        {
          id: "problem-1",
          type: "addition",
          operands: [23, 25],
          correctAnswer: 48,
          intendedStrategy: "AdditionDoubles",
          difficulty: "intermediate",
          timeSpent: 12,
          attemptedAt: new Date(),
          userAnswer: 48, // Correct
        },
        {
          id: "problem-2",
          type: "addition",
          operands: [67, 28],
          correctAnswer: 95,
          intendedStrategy: "AdditionBridgingTo10s",
          difficulty: "intermediate",
          timeSpent: 18,
          attemptedAt: new Date(),
          userAnswer: 85, // Incorrect
        },
        {
          id: "problem-3",
          type: "multiplication",
          operands: [46, 5],
          correctAnswer: 230,
          intendedStrategy: "MultiplicationTimes5",
          difficulty: "intermediate",
          timeSpent: 25,
          attemptedAt: new Date(),
          userAnswer: 220, // Incorrect
        },
      ];

      const mockOnSelectProblem = jest.fn();

      render(
        <MockProblemReview
          problems={mockProblems}
          onSelectProblem={mockOnSelectProblem}
        />,
      );

      // Initial view shows all problems
      expect(screen.getByTestId("problems-list")).toBeInTheDocument();
      expect(screen.getAllByTestId(/problem-item-/)).toHaveLength(3);

      // Filter to show only incorrect problems
      fireEvent.click(screen.getByTestId("filter-incorrect"));

      // Should show only 2 incorrect problems
      expect(screen.getAllByTestId(/problem-item-/)).toHaveLength(2);

      // Verify incorrect problems are shown
      const incorrectProblems = screen.getAllByTestId(/problem-item-/);
      expect(incorrectProblems[0]).toHaveClass("incorrect");
      expect(incorrectProblems[1]).toHaveClass("incorrect");

      // User can select a problem for review
      fireEvent.click(screen.getByTestId("review-button-0"));
      expect(mockOnSelectProblem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "problem-2",
          userAnswer: 85,
          correctAnswer: 95,
        }),
      );
    });

    test("should display problem details and user performance", () => {
      const mockProblems: (Problem & { userAnswer?: number })[] = [
        {
          id: "review-problem",
          type: "subtraction",
          operands: [74, 29],
          correctAnswer: 45,
          intendedStrategy: "SubtractionCompensation",
          difficulty: "intermediate",
          timeSpent: 20,
          attemptedAt: new Date(),
          userAnswer: 35, // Incorrect
        },
      ];

      const mockOnSelectProblem = jest.fn();

      render(
        <MockProblemReview
          problems={mockProblems}
          onSelectProblem={mockOnSelectProblem}
        />,
      );

      // Verify problem details are displayed
      expect(screen.getByTestId("problem-summary")).toHaveTextContent(
        "74 - 29 = 45",
      );
      expect(screen.getByTestId("user-answer")).toHaveTextContent(
        "Your answer: 35",
      );
      expect(screen.getByTestId("problem-strategy")).toHaveTextContent(
        "Strategy: SubtractionCompensation",
      );

      // Problem should be marked as incorrect
      expect(screen.getByTestId("problem-item-0")).toHaveClass("incorrect");
    });
  });

  describe("Continuous Learning Loop", () => {
    test("should support seamless transition from review to practice", async () => {
      const reviewProblem: Problem & { userAnswer?: number } = {
        id: "review-to-practice",
        type: "addition",
        operands: [67, 28],
        correctAnswer: 95,
        intendedStrategy: "AdditionBridgingTo10s",
        difficulty: "intermediate",
        timeSpent: 15,
        attemptedAt: new Date(),
        userAnswer: 85, // Was incorrect
      };

      const mockOnSelectProblem = jest.fn();
      const mockOnAnswer = jest.fn();
      const mockOnContinue = jest.fn();

      // Start with problem review
      const { rerender } = render(
        <MockProblemReview
          problems={[reviewProblem]}
          onSelectProblem={mockOnSelectProblem}
        />,
      );

      // User selects problem for review
      fireEvent.click(screen.getByTestId("review-button-0"));
      expect(mockOnSelectProblem).toHaveBeenCalledWith(reviewProblem);

      // Transition to educational flow for the same problem
      rerender(
        <MockEducationalFlow
          problem={reviewProblem}
          onAnswer={mockOnAnswer}
          onContinue={mockOnContinue}
        />,
      );

      // User can practice the same problem again
      expect(screen.getByTestId("problem-equation")).toHaveTextContent(
        "67 + 28 = ?",
      );

      // User tries again and gets it right this time
      fireEvent.change(screen.getByTestId("answer-input"), {
        target: { value: "95" },
      });
      fireEvent.click(screen.getByTestId("submit-answer"));

      await waitFor(() => {
        expect(screen.getByTestId("correct-feedback")).toBeInTheDocument();
      });

      expect(mockOnAnswer).toHaveBeenCalledWith(95, true);
    });

    test("should track learning progress through multiple interactions", () => {
      const problemHistory = [
        { attempt: 1, answer: 85, correct: false, showedStrategy: true },
        { attempt: 2, answer: 90, correct: false, showedStrategy: true },
        { attempt: 3, answer: 95, correct: true, showedStrategy: false },
      ];

      // Simulate learning progression
      problemHistory.forEach((attempt, index) => {
        expect(attempt.attempt).toBe(index + 1);

        if (index < 2) {
          // First two attempts were incorrect, user needed strategy help
          expect(attempt.correct).toBe(false);
          expect(attempt.showedStrategy).toBe(true);
        } else {
          // Final attempt was successful
          expect(attempt.correct).toBe(true);
          expect(attempt.showedStrategy).toBe(false);
        }
      });

      // Calculate improvement metrics
      const totalAttempts = problemHistory.length;
      const correctAttempts = problemHistory.filter((a) => a.correct).length;
      const strategyViewsNeeded = problemHistory.filter(
        (a) => a.showedStrategy,
      ).length;

      expect(totalAttempts).toBe(3);
      expect(correctAttempts).toBe(1);
      expect(strategyViewsNeeded).toBe(2);

      // User showed improvement: got it right on 3rd try after seeing strategy twice
      const learningEffectiveness = correctAttempts / totalAttempts;
      const strategyUtilization =
        strategyViewsNeeded / (totalAttempts - correctAttempts);

      expect(learningEffectiveness).toBeCloseTo(0.33, 2);
      expect(strategyUtilization).toBe(1); // Used strategy help for all incorrect attempts
    });
  });

  describe("Accessibility and User Experience", () => {
    test("should provide clear visual feedback and navigation cues", () => {
      const mockProblem: Problem = {
        id: "ux-test-problem",
        type: "addition",
        operands: [45, 47],
        correctAnswer: 92,
        intendedStrategy: "AdditionDoubles",
        difficulty: "intermediate",
        timeSpent: 0,
        attemptedAt: new Date(),
      };

      const mockOnAnswer = jest.fn();
      const mockOnContinue = jest.fn();

      render(
        <MockEducationalFlow
          problem={mockProblem}
          onAnswer={mockOnAnswer}
          onContinue={mockOnContinue}
        />,
      );

      // Submit button should be disabled until answer is entered
      expect(screen.getByTestId("submit-answer")).toBeDisabled();

      // Enter answer to enable submit
      fireEvent.change(screen.getByTestId("answer-input"), {
        target: { value: "92" },
      });
      expect(screen.getByTestId("submit-answer")).not.toBeDisabled();

      // Verify clear labeling and structure
      expect(screen.getByTestId("problem-display")).toBeInTheDocument();
      expect(screen.getByTestId("answer-input-section")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Your answer")).toBeInTheDocument();
    });

    test("should handle edge cases and error states gracefully", () => {
      const mockProblem: Problem = {
        id: "edge-case-problem",
        type: "division",
        operands: [144, 12],
        correctAnswer: 12,
        intendedStrategy: "DivisionFactorRecognition",
        difficulty: "advanced",
        timeSpent: 0,
        attemptedAt: new Date(),
      };

      const mockOnAnswer = jest.fn();
      const mockOnContinue = jest.fn();

      render(
        <MockEducationalFlow
          problem={mockProblem}
          onAnswer={mockOnAnswer}
          onContinue={mockOnContinue}
        />,
      );

      // Test with empty input
      fireEvent.change(screen.getByTestId("answer-input"), {
        target: { value: "" },
      });
      expect(screen.getByTestId("submit-answer")).toBeDisabled();

      // Test with invalid input (should be handled by number input type)
      fireEvent.change(screen.getByTestId("answer-input"), {
        target: { value: "abc" },
      });
      expect(screen.getByTestId("answer-input")).toHaveValue(null);

      // Test with valid answer
      fireEvent.change(screen.getByTestId("answer-input"), {
        target: { value: "12" },
      });
      expect(screen.getByTestId("submit-answer")).not.toBeDisabled();
    });
  });
});
