"use client";

import React, { useState } from "react";
import { StrategyId } from "@/lib/types";
import { STRATEGY_DISPLAY_DETAILS } from "@/components/user/user-strategy-progress-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Target,
  Lightbulb,
  Check,
} from "lucide-react";

interface InteractiveTutorialProps {
  strategyId: StrategyId;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  problem?: string;
  targetAnswer?: string;
  hint?: string;
  interactive?: boolean;
  explanation?: string;
}

// Tutorial content for each strategy
const TUTORIAL_STEPS: Partial<Record<StrategyId, TutorialStep[]>> = {
  AdditionBridgingTo10s: [
    {
      id: 1,
      title: "Understanding Bridging to 10s",
      description:
        "Bridging to 10s means we break down addition by first reaching the nearest 10. This makes calculations much easier!",
      problem: "27 + 8",
      hint: "Look at 27. What's the nearest 10 above it?",
    },
    {
      id: 2,
      title: "Find the nearest 10",
      description:
        "For 27 + 8, we see that 27 is close to 30. How much do we need to add to 27 to reach 30?",
      problem: "27 + ? = 30",
      targetAnswer: "3",
      interactive: true,
      hint: "30 - 27 = ?",
    },
    {
      id: 3,
      title: "Bridge to 30",
      description:
        "Great! We need 3 to get from 27 to 30. So we take 3 from our 8.",
      explanation: "27 + 3 = 30",
      hint: "Now we have 30 + what's left of 8",
    },
    {
      id: 4,
      title: "Add the remaining",
      description:
        "We used 3 from the 8, so we have 8 - 3 = 5 remaining. Now add: 30 + 5",
      problem: "30 + 5",
      targetAnswer: "35",
      interactive: true,
      explanation: "Final answer: 35",
    },
    {
      id: 5,
      title: "You did it! 🎉",
      description:
        "You successfully used bridging to 10s! The complete solution was: 27 + 8 = (27 + 3) + 5 = 30 + 5 = 35",
      explanation:
        "This method works great when you're close to a multiple of 10!",
    },
  ],

  AdditionDoubles: [
    {
      id: 1,
      title: "Understanding Doubles Strategy",
      description:
        "The doubles strategy uses known doubles (like 7+7=14) to solve near-doubles problems quickly!",
      problem: "7 + 8",
      hint: "Notice that 7 and 8 are very close to each other",
    },
    {
      id: 2,
      title: "Find the double",
      description:
        "Since we have 7 + 8, we can use the double 7 + 7. What is 7 + 7?",
      problem: "7 + 7",
      targetAnswer: "14",
      interactive: true,
      hint: "This should be memorized as a basic double",
    },
    {
      id: 3,
      title: "Adjust for the difference",
      description:
        "We calculated 7 + 7 = 14, but we need 7 + 8. Since 8 is 1 more than 7, we add 1 to our double.",
      problem: "14 + 1",
      targetAnswer: "15",
      interactive: true,
      explanation: "So 7 + 8 = 15",
    },
    {
      id: 4,
      title: "Perfect! 🎉",
      description:
        "You mastered the doubles strategy! 7 + 8 = (7 + 7) + 1 = 14 + 1 = 15",
      explanation:
        "This works for any near-doubles: use the closest double, then adjust!",
    },
  ],

  MultiplicationTimes5: [
    {
      id: 1,
      title: "The Times 5 Trick",
      description:
        "Multiplying by 5 is easy when you know this trick: 5 = 10 ÷ 2, so multiply by 10 then divide by 2!",
      problem: "18 × 5",
      hint: "Think: what's an easy way to multiply by 10?",
    },
    {
      id: 2,
      title: "Multiply by 10",
      description: "First, multiply 18 by 10. This is easy - just add a zero!",
      problem: "18 × 10",
      targetAnswer: "180",
      interactive: true,
      hint: "Adding a zero to 18 gives us...",
    },
    {
      id: 3,
      title: "Divide by 2",
      description: "Now divide 180 by 2 to get our final answer.",
      problem: "180 ÷ 2",
      targetAnswer: "90",
      interactive: true,
      explanation: "So 18 × 5 = 90",
    },
    {
      id: 4,
      title: "Excellent! 🎉",
      description:
        "You've mastered multiplying by 5! 18 × 5 = (18 × 10) ÷ 2 = 180 ÷ 2 = 90",
      explanation: "This trick works for any number times 5!",
    },
  ],

  AdditionBreakingApart: [
    {
      id: 1,
      title: "Breaking Apart Strategy",
      description:
        "Break numbers into tens and ones to make addition easier. This uses the distributive property!",
      problem: "34 + 28",
      hint: "Think about breaking each number into tens and ones",
    },
    {
      id: 2,
      title: "Break apart the first number",
      description: "Let's break 34 into tens and ones. 34 = 30 + 4",
      explanation: "34 = 30 + 4",
      hint: "The tens place of 34 is 30, the ones place is 4",
    },
    {
      id: 3,
      title: "Break apart the second number",
      description: "Now break 28 into tens and ones. 28 = 20 + 8",
      explanation: "28 = 20 + 8",
      hint: "The tens place of 28 is 20, the ones place is 8",
    },
    {
      id: 4,
      title: "Add the tens",
      description: "Add the tens together: 30 + 20",
      problem: "30 + 20",
      targetAnswer: "50",
      interactive: true,
      hint: "Adding tens is just like adding single digits",
    },
    {
      id: 5,
      title: "Add the ones",
      description: "Now add the ones together: 4 + 8",
      problem: "4 + 8",
      targetAnswer: "12",
      interactive: true,
      hint: "This is a basic addition fact",
    },
    {
      id: 6,
      title: "Combine the results",
      description: "Finally, add the tens result and ones result: 50 + 12",
      problem: "50 + 12",
      targetAnswer: "62",
      interactive: true,
      explanation: "So 34 + 28 = 62",
    },
    {
      id: 7,
      title: "Fantastic! 🎉",
      description:
        "You mastered breaking apart! 34 + 28 = (30 + 4) + (20 + 8) = (30 + 20) + (4 + 8) = 50 + 12 = 62",
      explanation: "This method works for any two-digit addition!",
    },
  ],

  MultiplicationTimes9: [
    {
      id: 1,
      title: "The Times 9 Pattern",
      description:
        "Multiplying by 9 has a special pattern: 9 × n = (10 × n) - n. Let's learn this trick!",
      problem: "9 × 7",
      hint: "Think about how 9 is close to 10",
    },
    {
      id: 2,
      title: "Multiply by 10",
      description: "First, multiply 7 by 10. This is easy!",
      problem: "7 × 10",
      targetAnswer: "70",
      interactive: true,
      hint: "Multiplying by 10 just adds a zero",
    },
    {
      id: 3,
      title: "Subtract the original number",
      description:
        "Now subtract the original number (7) from our result: 70 - 7",
      problem: "70 - 7",
      targetAnswer: "63",
      interactive: true,
      explanation: "So 9 × 7 = 63",
    },
    {
      id: 4,
      title: "Bonus: Notice the Pattern!",
      description:
        "Look at 63: the digits 6 + 3 = 9! Also, 6 is one less than 7. This pattern works for all single-digit times 9!",
      explanation:
        "For 9 × 7 = 63: tens digit is 6 (one less than 7), ones digit is 3 (so 6+3=9)",
      hint: "Try this pattern with other numbers!",
    },
    {
      id: 5,
      title: "Amazing! 🎉",
      description:
        "You learned the times 9 trick! 9 × 7 = (10 × 7) - 7 = 70 - 7 = 63",
      explanation: "This method works for any number times 9!",
    },
  ],

  AdditionLeftToRight: [
    {
      id: 1,
      title: "Left-to-Right Addition",
      description:
        "Adding from left to right follows how we naturally read numbers. Start with the biggest digits first!",
      problem: "42 + 35",
      hint: "Look at the tens place first, then the ones place",
    },
    {
      id: 2,
      title: "Add the tens",
      description: "Start with the tens place: 40 + 30. What do you get?",
      problem: "40 + 30",
      targetAnswer: "70",
      interactive: true,
      hint: "Think of it as 4 tens + 3 tens = 7 tens",
    },
    {
      id: 3,
      title: "Add the ones",
      description: "Now add the ones place: 2 + 5",
      problem: "2 + 5",
      targetAnswer: "7",
      interactive: true,
      hint: "This is a basic addition fact",
    },
    {
      id: 4,
      title: "Combine the results",
      description: "Finally, combine: 70 + 7",
      problem: "70 + 7",
      targetAnswer: "77",
      interactive: true,
      explanation: "So 42 + 35 = 77",
    },
    {
      id: 5,
      title: "Perfect! 🎉",
      description:
        "You mastered left-to-right addition! 42 + 35 = (40 + 30) + (2 + 5) = 70 + 7 = 77",
      explanation:
        "This method gives you a quick sense of the answer size and is often faster!",
    },
  ],

  SubtractionBridgingDown: [
    {
      id: 1,
      title: "Bridging Down Strategy",
      description:
        "Bridge down to the nearest 10 below, then subtract the rest. This makes subtraction much easier!",
      problem: "32 - 15",
      hint: "Look at 32. What's the nearest 10 below it?",
    },
    {
      id: 2,
      title: "Bridge to the nearest 10",
      description:
        "32 is close to 30. How much do we subtract from 32 to reach 30?",
      problem: "32 - ? = 30",
      targetAnswer: "2",
      interactive: true,
      hint: "32 - 30 = ?",
    },
    {
      id: 3,
      title: "Calculate remaining to subtract",
      description:
        "We subtracted 2 from our 15, so we have 15 - 2 = 13 remaining to subtract.",
      explanation: "15 - 2 = 13 remaining",
      hint: "Now we need to subtract 13 from 30",
    },
    {
      id: 4,
      title: "Subtract the remaining",
      description: "Now subtract: 30 - 13",
      problem: "30 - 13",
      targetAnswer: "17",
      interactive: true,
      explanation: "So 32 - 15 = 17",
    },
    {
      id: 5,
      title: "Excellent! 🎉",
      description:
        "You mastered bridging down! 32 - 15 = (32 - 2) - 13 = 30 - 13 = 17",
      explanation: "This method works great when crossing tens boundaries!",
    },
  ],

  SubtractionAddingUp: [
    {
      id: 1,
      title: "Adding Up Strategy",
      description:
        "Instead of subtracting, add up from the smaller number to the larger number. Count how much you added!",
      problem: "63 - 27",
      hint: "Start from 27 and count up to 63",
    },
    {
      id: 2,
      title: "Bridge to the nearest 10",
      description: "Start from 27. How much do you add to reach 30?",
      problem: "27 + ? = 30",
      targetAnswer: "3",
      interactive: true,
      hint: "30 - 27 = ?",
    },
    {
      id: 3,
      title: "Add to get close to target",
      description: "From 30, how much do you add to reach 60 (close to 63)?",
      problem: "30 + ? = 60",
      targetAnswer: "30",
      interactive: true,
      hint: "Think in multiples of 10",
    },
    {
      id: 4,
      title: "Add the final amount",
      description: "From 60, how much do you add to reach 63?",
      problem: "60 + ? = 63",
      targetAnswer: "3",
      interactive: true,
      hint: "63 - 60 = ?",
    },
    {
      id: 5,
      title: "Add up all the jumps",
      description: "Total added: 3 + 30 + 3 = ?",
      problem: "3 + 30 + 3",
      targetAnswer: "36",
      interactive: true,
      explanation: "So 63 - 27 = 36",
    },
    {
      id: 6,
      title: "Brilliant! 🎉",
      description: "You mastered adding up! 63 - 27 = 3 + 30 + 3 = 36",
      explanation:
        "This method often feels more natural than traditional subtraction!",
    },
  ],

  SubtractionCompensation: [
    {
      id: 1,
      title: "Compensation Strategy",
      description:
        "Make subtraction easier by rounding one number, then compensating for the change!",
      problem: "64 - 29",
      hint: "Notice that 29 is very close to 30",
    },
    {
      id: 2,
      title: "Round to make it easier",
      description:
        "Instead of subtracting 29, let's subtract 30 (easier). What is 64 - 30?",
      problem: "64 - 30",
      targetAnswer: "34",
      interactive: true,
      hint: "Subtracting 30 is much easier than 29",
    },
    {
      id: 3,
      title: "Compensate for the change",
      description:
        "We subtracted 30 instead of 29, so we subtracted 1 too much. Add back 1: 34 + 1",
      problem: "34 + 1",
      targetAnswer: "35",
      interactive: true,
      explanation: "So 64 - 29 = 35",
    },
    {
      id: 4,
      title: "Fantastic! 🎉",
      description:
        "You mastered compensation! 64 - 29 = (64 - 30) + 1 = 34 + 1 = 35",
      explanation: "Round to friendly numbers, then compensate!",
    },
  ],

  MultiplicationDoubling: [
    {
      id: 1,
      title: "Doubling & Halving Strategy",
      description:
        "When one number is even, you can halve it and double the other number. The product stays the same!",
      problem: "18 × 5",
      hint: "Notice that 18 is even - we can halve it",
    },
    {
      id: 2,
      title: "Halve the even number",
      description: "Halve 18. What is 18 ÷ 2?",
      problem: "18 ÷ 2",
      targetAnswer: "9",
      interactive: true,
      hint: "Half of 18 is 9",
    },
    {
      id: 3,
      title: "Double the other number",
      description: "Double 5. What is 5 × 2?",
      problem: "5 × 2",
      targetAnswer: "10",
      interactive: true,
      hint: "Double 5 is 10",
    },
    {
      id: 4,
      title: "Multiply the new numbers",
      description: "Now multiply: 9 × 10",
      problem: "9 × 10",
      targetAnswer: "90",
      interactive: true,
      explanation: "So 18 × 5 = 90",
    },
    {
      id: 5,
      title: "Outstanding! 🎉",
      description:
        "You mastered doubling & halving! 18 × 5 = (18 ÷ 2) × (5 × 2) = 9 × 10 = 90",
      explanation:
        "This works because halving one and doubling the other doesn't change the product!",
    },
  ],

  MultiplicationBreakingApart: [
    {
      id: 1,
      title: "Breaking Apart for Multiplication",
      description:
        "Break one number into tens and ones, multiply each part, then add the products together!",
      problem: "23 × 4",
      hint: "Think about breaking 23 into 20 + 3",
    },
    {
      id: 2,
      title: "Break apart the number",
      description: "Break 23 into tens and ones: 23 = 20 + 3",
      explanation: "23 = 20 + 3",
      hint: "The tens place is 20, the ones place is 3",
    },
    {
      id: 3,
      title: "Multiply the tens part",
      description: "Multiply the tens part: 20 × 4",
      problem: "20 × 4",
      targetAnswer: "80",
      interactive: true,
      hint: "20 × 4 = 2 × 10 × 4 = 8 × 10 = 80",
    },
    {
      id: 4,
      title: "Multiply the ones part",
      description: "Multiply the ones part: 3 × 4",
      problem: "3 × 4",
      targetAnswer: "12",
      interactive: true,
      hint: "This is a basic multiplication fact",
    },
    {
      id: 5,
      title: "Add the products",
      description: "Add the two products together: 80 + 12",
      problem: "80 + 12",
      targetAnswer: "92",
      interactive: true,
      explanation: "So 23 × 4 = 92",
    },
    {
      id: 6,
      title: "Superb! 🎉",
      description:
        "You mastered breaking apart! 23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92",
      explanation: "This uses the distributive property of multiplication!",
    },
  ],

  MultiplicationNearSquares: [
    {
      id: 1,
      title: "Near Squares Strategy",
      description:
        "Use perfect squares to multiply numbers close to square numbers. This advanced technique is very powerful!",
      problem: "19 × 21",
      hint: "Notice that both numbers are close to 20",
    },
    {
      id: 2,
      title: "Find the perfect square",
      description: "Both 19 and 21 are near 20. What is 20²?",
      problem: "20²",
      targetAnswer: "400",
      interactive: true,
      hint: "20 × 20 = ?",
    },
    {
      id: 3,
      title: "Find the differences",
      description:
        "19 is 1 less than 20, and 21 is 1 more than 20. So we have (20-1) × (20+1)",
      explanation: "19 = 20 - 1, and 21 = 20 + 1",
      hint: "This follows the pattern (a-b)(a+b) = a² - b²",
    },
    {
      id: 4,
      title: "Apply the pattern",
      description: "For (20-1) × (20+1), we get 20² - 1². What is 1²?",
      problem: "1²",
      targetAnswer: "1",
      interactive: true,
      hint: "1 × 1 = ?",
    },
    {
      id: 5,
      title: "Calculate the result",
      description: "So we have 400 - 1. What is 400 - 1?",
      problem: "400 - 1",
      targetAnswer: "399",
      interactive: true,
      explanation: "So 19 × 21 = 399",
    },
    {
      id: 6,
      title: "Incredible! 🎉",
      description:
        "You mastered near squares! 19 × 21 = (20-1)(20+1) = 20² - 1² = 400 - 1 = 399",
      explanation:
        "This pattern works for any numbers equidistant from a perfect square!",
    },
  ],

  DivisionFactorRecognition: [
    {
      id: 1,
      title: "Factor Recognition Strategy",
      description:
        "Break down the divisor into smaller factors, then divide by each factor step by step!",
      problem: "144 ÷ 12",
      hint: "Think about what factors make up 12",
    },
    {
      id: 2,
      title: "Find factors of the divisor",
      description:
        "12 can be broken down as 4 × 3. So instead of dividing by 12, we can divide by 4, then by 3.",
      explanation: "12 = 4 × 3",
      hint: "4 and 3 are easier to divide by than 12",
    },
    {
      id: 3,
      title: "Divide by the first factor",
      description: "First divide 144 by 4. What is 144 ÷ 4?",
      problem: "144 ÷ 4",
      targetAnswer: "36",
      interactive: true,
      hint: "Think: 4 × ? = 144, or break 144 into groups of 4",
    },
    {
      id: 4,
      title: "Divide by the second factor",
      description: "Now divide 36 by 3. What is 36 ÷ 3?",
      problem: "36 ÷ 3",
      targetAnswer: "12",
      interactive: true,
      explanation: "So 144 ÷ 12 = 12",
    },
    {
      id: 5,
      title: "Excellent! 🎉",
      description:
        "You mastered factor recognition! 144 ÷ 12 = 144 ÷ 4 ÷ 3 = 36 ÷ 3 = 12",
      explanation: "Breaking divisors into factors makes division much easier!",
    },
  ],

  DivisionMultiplicationInverse: [
    {
      id: 1,
      title: "Multiplication Inverse Strategy",
      description:
        "Use multiplication facts in reverse! If you know a × b = c, then c ÷ a = b.",
      problem: "84 ÷ 12",
      hint: "Think: 12 times what number equals 84?",
    },
    {
      id: 2,
      title: "Reframe as multiplication",
      description:
        "Instead of 84 ÷ 12, think: 12 × ? = 84. What number times 12 equals 84?",
      explanation: "Division is the inverse of multiplication",
      hint: "Try some multiples of 12: 12×1=12, 12×2=24, 12×3=36...",
    },
    {
      id: 3,
      title: "Find the multiplication fact",
      description: "What is 12 × 7?",
      problem: "12 × 7",
      targetAnswer: "84",
      interactive: true,
      hint: "12 × 7 = (10 × 7) + (2 × 7) = 70 + 14 = 84",
    },
    {
      id: 4,
      title: "Apply the inverse",
      description: "Since 12 × 7 = 84, we know that 84 ÷ 12 = 7!",
      explanation: "So 84 ÷ 12 = 7",
      hint: "Multiplication and division are inverse operations",
    },
    {
      id: 5,
      title: "Perfect! 🎉",
      description:
        "You mastered multiplication inverse! 84 ÷ 12 = 7 because 12 × 7 = 84",
      explanation: "Strong multiplication facts make division much easier!",
    },
  ],

  DivisionEstimationAdjustment: [
    {
      id: 1,
      title: "Estimation & Adjustment Strategy",
      description:
        "Make a reasonable guess, test it by multiplying, then adjust up or down as needed!",
      problem: "156 ÷ 13",
      hint: "Start with a round number estimate",
    },
    {
      id: 2,
      title: "Make an estimate",
      description:
        "Let's estimate that 156 ÷ 13 is about 10. Let's test: what is 13 × 10?",
      problem: "13 × 10",
      targetAnswer: "130",
      interactive: true,
      hint: "Multiplying by 10 just adds a zero",
    },
    {
      id: 3,
      title: "Compare and adjust",
      description:
        "13 × 10 = 130, but we need 156. That's 26 more. Since 130 is too low, our answer is bigger than 10.",
      explanation: "156 - 130 = 26, so we need to adjust upward",
      hint: "We need a number bigger than 10",
    },
    {
      id: 4,
      title: "Try a better estimate",
      description: "Let's try 12. What is 13 × 12?",
      problem: "13 × 12",
      targetAnswer: "156",
      interactive: true,
      hint: "13 × 12 = 13 × 10 + 13 × 2 = 130 + 26 = 156",
    },
    {
      id: 5,
      title: "Verify the answer",
      description: "Perfect! 13 × 12 = 156, so 156 ÷ 13 = 12",
      explanation: "So 156 ÷ 13 = 12",
      hint: "Always verify by multiplying back",
    },
    {
      id: 6,
      title: "Outstanding! 🎉",
      description:
        "You mastered estimation & adjustment! Start with an estimate, test it, then adjust until you find the exact answer.",
      explanation: "This strategy helps when exact factors aren't obvious!",
    },
  ],

  // Add more strategies as needed - for now, we'll have fallback content
};

export function InteractiveTutorial({
  strategyId,
  isOpen,
  onClose,
  onBack,
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const details = STRATEGY_DISPLAY_DETAILS[strategyId];
  const steps = TUTORIAL_STEPS[strategyId] || [];
  const strategyName = details?.name || "Strategy";

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setUserInput("");
      setIsCorrect(null);
      setShowHint(false);
    }
  }, [isOpen]);

  const currentStepData = steps[currentStep];
  const progress =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserInput("");
      setIsCorrect(null);
      setShowHint(false);
    } else {
      // Tutorial completed
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setUserInput("");
      setIsCorrect(null);
      setShowHint(false);
    }
  };

  const handleSubmit = () => {
    if (!currentStepData?.targetAnswer || !currentStepData.interactive) return;

    const isAnswerCorrect = userInput.trim() === currentStepData.targetAnswer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      // Auto-advance after a short delay
      setTimeout(() => {
        handleNext();
      }, 1500);
    }
  };

  // Fallback for strategies without tutorial content yet
  if (steps.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Interactive Tutorial</DialogTitle>
            <DialogDescription>
              Interactive tutorial for {strategyName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Tutorial Not Found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find the interactive tutorial for {strategyName}.
              This might be a technical issue - please try again or contact
              support.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Guide
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                Interactive Tutorial: {strategyName}
              </DialogTitle>
              <DialogDescription>
                Step {currentStep + 1} of {steps.length}
              </DialogDescription>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 overflow-hidden">
          {/* Current step content */}
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  <Badge
                    variant="outline"
                    className="text-xs sm:text-sm shrink-0"
                  >
                    Step {currentStep + 1}
                  </Badge>
                  <h3 className="text-base sm:text-lg font-semibold break-words min-w-0">
                    {currentStepData?.title}
                  </h3>
                </div>

                <p className="text-muted-foreground">
                  {currentStepData?.description}
                </p>

                {/* Problem display */}
                {currentStepData?.problem && (
                  <div className="bg-muted/50 rounded-lg p-2 sm:p-4 text-center overflow-x-auto">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      Problem:
                    </p>
                    <div className="min-w-0 overflow-x-auto">
                      <p className="font-mono text-lg sm:text-xl lg:text-2xl font-bold whitespace-nowrap">
                        {currentStepData.problem}
                      </p>
                    </div>
                  </div>
                )}

                {/* Interactive input */}
                {currentStepData?.interactive && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Your answer..."
                      className="w-full px-2 sm:px-3 py-2 border rounded-md text-center font-mono text-sm sm:text-base min-w-0"
                      disabled={isCorrect === true}
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={!userInput.trim() || isCorrect === true}
                      className="w-full sm:w-auto mx-auto"
                      size="sm"
                    >
                      Submit
                    </Button>
                  </div>
                )}

                {/* Feedback */}
                {isCorrect === true && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Correct! Great job!</span>
                  </div>
                )}

                {isCorrect === false && (
                  <div className="text-red-600">
                    <p className="font-medium">Not quite right. Try again!</p>
                  </div>
                )}

                {/* Explanation */}
                {currentStepData?.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {currentStepData.explanation}
                    </p>
                  </div>
                )}

                {/* Hint */}
                {currentStepData?.hint && (
                  <div className="space-y-2">
                    {!showHint ? (
                      <Button
                        onClick={() => setShowHint(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Show Hint
                      </Button>
                    ) : (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          💡 {currentStepData.hint}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentStepData?.interactive && isCorrect !== true}
              >
                {currentStep === steps.length - 1 ? (
                  <Check className="h-4 w-4 ml-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
