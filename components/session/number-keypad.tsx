"use client";

import { motion } from "framer-motion";
import { Delete, Check } from "lucide-react";
import { useSoundEffects } from "@/lib/hooks/use-audio";
import { useHaptic } from "@/lib/hooks/use-haptic";

interface NumberKeypadProps {
  onNumberPress: (number: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function NumberKeypad({
  onNumberPress,
  onBackspace,
  onSubmit,
  disabled = false,
}: NumberKeypadProps) {
  const { playKeypadTap } = useSoundEffects();
  const { vibrateKeypadTap, vibrateButtonClick } = useHaptic();

  const handleButtonPress = async (
    action: () => void,
    playSound: boolean = true,
    hapticType: "keypad" | "button" = "keypad",
  ) => {
    if (disabled) return;

    // Play sound effect only if requested
    if (playSound) {
      await playKeypadTap();
    }

    // Trigger appropriate haptic feedback
    if (hapticType === "keypad") {
      vibrateKeypadTap();
    } else {
      vibrateButtonClick();
    }

    // Execute the action
    action();
  };

  const buttonVariants = {
    initial: { scale: 1 },
    pressed: { scale: 0.95 },
    hover: { scale: 1.05 },
  };

  const KeypadButton = ({
    children,
    onClick,
    className = "",
    variant = "number",
    playSound = true,
    hapticType = "keypad",
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    variant?: "number" | "action";
    playSound?: boolean;
    hapticType?: "keypad" | "button";
  }) => (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="pressed"
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={() => handleButtonPress(onClick, playSound, hapticType)}
      disabled={disabled}
      className={`
        relative h-12 rounded-xl font-bold text-lg
        transition-all duration-150
        active:shadow-inner
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          variant === "number"
            ? "bg-white border-2 border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100"
            : variant === "action"
              ? "bg-blue-500 border-2 border-blue-600 text-white hover:bg-blue-600 active:bg-blue-700"
              : ""
        }
        ${className}
      `}
    >
      <div className="flex items-center justify-center h-full">{children}</div>
    </motion.button>
  );

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Keypad Grid */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
        {/* Row 1: 1, 2, 3 */}
        <KeypadButton onClick={() => onNumberPress("1")}>1</KeypadButton>
        <KeypadButton onClick={() => onNumberPress("2")}>2</KeypadButton>
        <KeypadButton onClick={() => onNumberPress("3")}>3</KeypadButton>

        {/* Row 2: 4, 5, 6 */}
        <KeypadButton onClick={() => onNumberPress("4")}>4</KeypadButton>
        <KeypadButton onClick={() => onNumberPress("5")}>5</KeypadButton>
        <KeypadButton onClick={() => onNumberPress("6")}>6</KeypadButton>

        {/* Row 3: 7, 8, 9 */}
        <KeypadButton onClick={() => onNumberPress("7")}>7</KeypadButton>
        <KeypadButton onClick={() => onNumberPress("8")}>8</KeypadButton>
        <KeypadButton onClick={() => onNumberPress("9")}>9</KeypadButton>

        {/* Row 4: Backspace, 0, Submit */}
        <KeypadButton
          onClick={onBackspace}
          variant="action"
          className="bg-gray-500 border-gray-600 hover:bg-gray-600 active:bg-gray-700"
          hapticType="button"
        >
          <Delete className="h-5 w-5" />
        </KeypadButton>

        <KeypadButton onClick={() => onNumberPress("0")}>0</KeypadButton>

        <KeypadButton
          onClick={onSubmit}
          variant="action"
          className="bg-green-500 border-green-600 hover:bg-green-600 active:bg-green-700"
          playSound={false}
          hapticType="button"
        >
          <Check className="h-5 w-5" />
        </KeypadButton>
      </div>
    </div>
  );
}
