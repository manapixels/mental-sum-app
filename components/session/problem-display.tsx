"use client";

import { Problem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnswerInput } from "./answer-input";
import { NumberKeypad } from "./number-keypad";
import { AnswerFeedback } from "./answer-feedback";
import { motion } from "framer-motion";

interface ProblemDisplayProps {
  problem: Problem;
  showStrategy?: boolean;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onNumberPress: (number: string) => void;
  onBackspace: () => void;
  onKeypadSubmit: () => void;
  onFeedbackComplete: () => void;
  disabled?: boolean;
  feedbackType: "correct" | "incorrect" | "timeout" | null;
}

export function ProblemDisplay({
  problem,
  userAnswer,
  onAnswerChange,
  onSubmit,
  onKeyPress,
  onNumberPress,
  onBackspace,
  onKeypadSubmit,
  onFeedbackComplete,
  disabled = false,
  feedbackType,
}: ProblemDisplayProps) {
  const getOperationSymbol = (operation: string) => {
    switch (operation) {
      case "addition":
        return "+";
      case "subtraction":
        return "−";
      case "multiplication":
        return "×";
      case "division":
        return "÷";
      default:
        return "+";
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "addition":
        return "text-green-600";
      case "subtraction":
        return "text-red-600";
      case "multiplication":
        return "text-blue-600";
      case "division":
        return "text-purple-600";
      default:
        return "text-green-600";
    }
  };

  return (
    <motion.div
      key={problem.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full max-w-md"
    >
      <Card className="w-full max-w-md border-0 shadow-none">
        <CardContent className="p-0">
          {/* Math problem with integrated answer */}
          <div className="text-center space-y-6">
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold font-mono tracking-wide">
              <span>{problem.operands[0].toLocaleString()}</span>
              <span
                className={`mx-3 sm:mx-4 ${getOperationColor(problem.type)}`}
              >
                {getOperationSymbol(problem.type)}
              </span>
              <span>{problem.operands[1].toLocaleString()}</span>
            </div>

            <div className="text-4xl sm:text-5xl font-bold font-mono text-muted-foreground flex items-center justify-center gap-3">
              <span>=</span>

              {/* Mobile Answer Display */}
              <div className="min-w-[120px] px-4 py-2 text-3xl sm:text-4xl font-bold text-center text-blue-600 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center md:hidden">
                {userAnswer || "?"}
              </div>

              {/* Desktop Answer Input */}
              <div className="min-w-[120px] hidden md:block">
                <AnswerInput
                  value={userAnswer}
                  onChange={onAnswerChange}
                  onKeyPress={onKeyPress}
                  disabled={disabled}
                  placeholder="?"
                />
              </div>
            </div>

            {/* Desktop Submit Button */}
            <div className="hidden md:flex justify-center mt-4">
              <Button
                onClick={onSubmit}
                disabled={
                  !userAnswer.trim() || disabled || feedbackType !== null
                }
                size="lg"
                className="px-8 h-12"
              >
                Submit Answer
              </Button>
            </div>
          </div>

          {/* Answer Feedback - Universal (all screen sizes) */}
          <div className="mt-6 w-full">
            <div className="w-full min-h-[280px] md:min-h-0 items-center justify-center">
              {/* Mobile Number Keypad */}
              <div className="md:hidden">
                {!feedbackType && (
                  <NumberKeypad
                    onNumberPress={onNumberPress}
                    onBackspace={onBackspace}
                    onSubmit={onKeypadSubmit}
                    disabled={disabled || feedbackType !== null}
                  />
                )}
              </div>
              {feedbackType && (
                <AnswerFeedback
                  key={`${problem.id}-${feedbackType}`}
                  type={feedbackType}
                  correctAnswer={problem.correctAnswer}
                  userAnswer={userAnswer ? parseInt(userAnswer) : undefined}
                  onComplete={onFeedbackComplete}
                  playSound={true}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
