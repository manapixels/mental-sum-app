"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AnswerInput({
  value,
  onChange,
  onKeyPress,
  disabled = false,
  placeholder = "Enter your answer",
}: AnswerInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only numbers, negative sign, and decimal point
    if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Label
          htmlFor="answer-input"
          className="text-center block text-lg font-medium"
        >
          Your Answer
        </Label>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        whileFocus={{ scale: 1.02 }}
      >
        <Input
          id="answer-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleInputChange}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="text-center text-2xl sm:text-3xl text-blue-600 h-16 sm:h-20 font-mono border-2 focus:border-primary transition-all duration-300"
          autoComplete="off"
          autoFocus
        />
      </motion.div>
    </div>
  );
}
