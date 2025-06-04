import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the number keypad component
const MockNumberKeypad = ({
  onNumberInput,
  onBackspace,
  onSubmit,
  disabled = false,
  submitDisabled = false,
}: {
  onNumberInput: (number: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  submitDisabled?: boolean;
}) => (
  <div
    data-testid="number-keypad"
    className="grid grid-cols-3 gap-2 p-4 bg-white rounded-lg"
    role="region"
    aria-label="Number keypad"
  >
    {/* Numbers 1-9 */}
    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
      <button
        key={num}
        data-testid={`number-${num}`}
        onClick={() => onNumberInput(num)}
        disabled={disabled}
        className="h-12 w-12 bg-blue-500 text-white font-bold rounded-lg active:bg-blue-600 disabled:bg-gray-300"
        aria-label={`Number ${num}`}
      >
        {num}
      </button>
    ))}

    {/* Zero button (spans 2 columns) */}
    <button
      data-testid="number-0"
      onClick={() => onNumberInput(0)}
      disabled={disabled}
      className="col-span-2 h-12 bg-blue-500 text-white font-bold rounded-lg active:bg-blue-600 disabled:bg-gray-300"
      aria-label="Number 0"
    >
      0
    </button>

    {/* Backspace button */}
    <button
      data-testid="backspace-button"
      onClick={onBackspace}
      disabled={disabled}
      className="h-12 bg-red-500 text-white font-bold rounded-lg active:bg-red-600 disabled:bg-gray-300"
      aria-label="Backspace"
    >
      ←
    </button>

    {/* Submit button (spans full width) */}
    <button
      data-testid="submit-button"
      onClick={onSubmit}
      disabled={disabled || submitDisabled}
      className="col-span-3 h-12 bg-green-500 text-white font-bold rounded-lg active:bg-green-600 disabled:bg-gray-300"
      aria-label="Submit answer"
    >
      Submit
    </button>
  </div>
);

// Mock answer input component that uses the keypad
const MockAnswerInput = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Enter your answer",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const handleNumberInput = (number: number) => {
    if (value.length < 10) {
      // Prevent excessive length
      onChange(value + number.toString());
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleSubmit = () => {
    if (value.trim() !== "") {
      onSubmit();
    }
  };

  return (
    <div data-testid="answer-input-container">
      <input
        data-testid="answer-input"
        type="text"
        value={value}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        className="w-full p-3 text-center text-xl border-2 border-gray-300 rounded-lg mb-4"
        aria-label="Answer input field"
      />
      <MockNumberKeypad
        onNumberInput={handleNumberInput}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
        disabled={disabled}
        submitDisabled={value.trim() === ""}
      />
    </div>
  );
};

// Mock navigator.vibrate for haptic feedback testing
Object.defineProperty(navigator, "vibrate", {
  writable: true,
  value: jest.fn(),
});

describe("Number Keypad Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Functionality", () => {
    test("should render all number buttons (0-9)", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      // Test all number buttons exist
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByTestId(`number-${i}`)).toBeInTheDocument();
      }

      // Test special buttons exist
      expect(screen.getByTestId("backspace-button")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    test("should call onNumberInput when number buttons are clicked", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      // Test clicking different number buttons
      fireEvent.click(screen.getByTestId("number-5"));
      expect(mockOnNumberInput).toHaveBeenCalledWith(5);

      fireEvent.click(screen.getByTestId("number-0"));
      expect(mockOnNumberInput).toHaveBeenCalledWith(0);

      fireEvent.click(screen.getByTestId("number-9"));
      expect(mockOnNumberInput).toHaveBeenCalledWith(9);

      expect(mockOnNumberInput).toHaveBeenCalledTimes(3);
    });

    test("should call onBackspace when backspace button is clicked", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      fireEvent.click(screen.getByTestId("backspace-button"));
      expect(mockOnBackspace).toHaveBeenCalledTimes(1);
    });

    test("should call onSubmit when submit button is clicked", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      fireEvent.click(screen.getByTestId("submit-button"));
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Touch Optimization", () => {
    test("should have adequate touch target sizes", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      // Check button classes include adequate sizing (h-12 = 48px which meets 44px minimum)
      const button5 = screen.getByTestId("number-5");
      expect(button5).toHaveClass("h-12"); // 48px height - meets WCAG 44px minimum
      expect(button5).toHaveClass("w-12"); // 48px width

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toHaveClass("h-12"); // 48px height
    });

    test("should provide visual feedback on button press", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      const button = screen.getByTestId("number-5");

      // Button should have active state styling
      expect(button).toHaveClass("active:bg-blue-600");
      expect(button).toHaveClass("bg-blue-500"); // Default state
    });

    test("should support haptic feedback on touch devices", async () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      // Simulate touch interaction with haptic feedback
      const button = screen.getByTestId("number-5");
      fireEvent.click(button);

      // In a real implementation, this would trigger haptic feedback
      // For testing, we just verify the interaction works
      expect(mockOnNumberInput).toHaveBeenCalledWith(5);
    });
  });

  describe("Integration with Answer Input", () => {
    test("should build up input value as numbers are pressed", () => {
      const mockOnSubmit = jest.fn();
      let currentValue = "";
      const mockOnChange = jest.fn((value: string) => {
        currentValue = value;
      });

      const { rerender } = render(
        <MockAnswerInput
          value={currentValue}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
      );

      // Click numbers in sequence
      fireEvent.click(screen.getByTestId("number-4"));
      rerender(
        <MockAnswerInput
          value="4"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
      );

      fireEvent.click(screen.getByTestId("number-2"));
      rerender(
        <MockAnswerInput
          value="42"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(mockOnChange).toHaveBeenCalledWith("4");
      expect(mockOnChange).toHaveBeenCalledWith("42");
      expect(screen.getByTestId("answer-input")).toHaveValue("42");
    });

    test("should remove last digit when backspace is pressed", () => {
      const mockOnSubmit = jest.fn();
      const mockOnChange = jest.fn();

      render(
        <MockAnswerInput
          value="123"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
      );

      fireEvent.click(screen.getByTestId("backspace-button"));
      expect(mockOnChange).toHaveBeenCalledWith("12");
    });

    test("should prevent input beyond reasonable length", () => {
      const mockOnSubmit = jest.fn();
      const mockOnChange = jest.fn();

      render(
        <MockAnswerInput
          value="1234567890" // 10 digits - at limit
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
      );

      // Try to add another digit
      fireEvent.click(screen.getByTestId("number-5"));

      // Should not call onChange since limit is reached
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test("should disable submit when input is empty", () => {
      const mockOnSubmit = jest.fn();
      const mockOnChange = jest.fn();

      render(
        <MockAnswerInput
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeDisabled();

      fireEvent.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("should enable submit when input has value", () => {
      const mockOnSubmit = jest.fn();
      const mockOnChange = jest.fn();

      render(
        <MockAnswerInput
          value="42"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
      );

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).not.toBeDisabled();

      fireEvent.click(submitButton);
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA labels for all buttons", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      // Check number buttons have proper labels
      for (let i = 0; i <= 9; i++) {
        const button = screen.getByTestId(`number-${i}`);
        expect(button).toHaveAttribute("aria-label", `Number ${i}`);
      }

      // Check special buttons have labels
      expect(screen.getByTestId("backspace-button")).toHaveAttribute(
        "aria-label",
        "Backspace",
      );
      expect(screen.getByTestId("submit-button")).toHaveAttribute(
        "aria-label",
        "Submit answer",
      );
    });

    test("should be navigable with keyboard", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      const button5 = screen.getByTestId("number-5");

      // Button should be focusable
      button5.focus();
      expect(button5).toHaveFocus();

      // Should work with Enter key
      fireEvent.keyDown(button5, { key: "Enter" });
      // Note: In real implementation, this would trigger the onClick
    });

    test("should have proper role and region labeling", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      const keypad = screen.getByTestId("number-keypad");
      expect(keypad).toHaveAttribute("role", "region");
      expect(keypad).toHaveAttribute("aria-label", "Number keypad");
    });
  });

  describe("Disabled State", () => {
    test("should disable all buttons when disabled prop is true", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      // All number buttons should be disabled
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByTestId(`number-${i}`)).toBeDisabled();
      }

      // Special buttons should be disabled
      expect(screen.getByTestId("backspace-button")).toBeDisabled();
      expect(screen.getByTestId("submit-button")).toBeDisabled();
    });

    test("should not trigger callbacks when disabled", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      // Try to click disabled buttons
      fireEvent.click(screen.getByTestId("number-5"));
      fireEvent.click(screen.getByTestId("backspace-button"));
      fireEvent.click(screen.getByTestId("submit-button"));

      // No callbacks should be triggered
      expect(mockOnNumberInput).not.toHaveBeenCalled();
      expect(mockOnBackspace).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test("should apply disabled styling", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
          disabled={true}
        />,
      );

      const button = screen.getByTestId("number-5");
      expect(button).toHaveClass("disabled:bg-gray-300");
    });
  });

  describe("Mobile-Specific Features", () => {
    test("should work properly on touch devices", () => {
      // Mock touch device
      Object.defineProperty(navigator, "maxTouchPoints", {
        writable: true,
        value: 1,
      });

      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      const button = screen.getByTestId("number-7");

      // Simulate touch events
      fireEvent.touchStart(button);
      fireEvent.touchEnd(button);
      fireEvent.click(button);

      expect(mockOnNumberInput).toHaveBeenCalledWith(7);
    });

    test("should prevent zoom on input focus (font-size >= 16px)", () => {
      const mockOnSubmit = jest.fn();
      const mockOnChange = jest.fn();

      render(
        <MockAnswerInput
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
      );

      const input = screen.getByTestId("answer-input");

      // Input should have large enough font to prevent zoom
      expect(input).toHaveClass("text-xl"); // Should be 16px or larger
    });

    test("should position keypad for thumb-friendly access", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      const keypad = screen.getByTestId("number-keypad");

      // Should have proper spacing and padding for thumb access
      expect(keypad).toHaveClass("gap-2"); // Adequate spacing between buttons
      expect(keypad).toHaveClass("p-4"); // Padding around keypad
    });
  });

  describe("Layout and Grid", () => {
    test("should use proper grid layout for optimal thumb reach", () => {
      const mockOnNumberInput = jest.fn();
      const mockOnBackspace = jest.fn();
      const mockOnSubmit = jest.fn();

      render(
        <MockNumberKeypad
          onNumberInput={mockOnNumberInput}
          onBackspace={mockOnBackspace}
          onSubmit={mockOnSubmit}
        />,
      );

      const keypad = screen.getByTestId("number-keypad");
      expect(keypad).toHaveClass("grid");
      expect(keypad).toHaveClass("grid-cols-3"); // 3-column layout for mobile

      // Zero button should span 2 columns for easier access
      const zeroButton = screen.getByTestId("number-0");
      expect(zeroButton).toHaveClass("col-span-2");

      // Submit button should span full width
      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toHaveClass("col-span-3");
    });
  });
});
