/**
 * Centralized Performance Thresholds Configuration
 *
 * This file defines all accuracy and attempt thresholds used throughout the app
 * to ensure consistent categorization of strategy performance across components.
 */

export const PERFORMANCE_THRESHOLDS = {
  /**
   * Strategy mastery criteria
   * A strategy is considered mastered when user consistently performs well
   */
  MASTERY: {
    ACCURACY: 0.9, // 90% accuracy required
    MIN_ATTEMPTS: 10, // Minimum attempts to qualify for mastery
  },

  /**
   * Good performance criteria
   * Represents solid understanding but not yet mastered
   */
  GOOD: {
    ACCURACY: 0.7, // 70% accuracy threshold
  },

  /**
   * Weakness detection criteria
   * Identifies strategies that need focused practice
   */
  WEAKNESS: {
    ACCURACY: 0.7, // Below 70% is considered weak
    MIN_ATTEMPTS: 3, // Minimum attempts to qualify as weak (avoids false positives)
  },

  /**
   * Untried strategy criteria
   */
  UNTRIED: {
    ATTEMPTS: 0, // No attempts made
  },

  /**
   * UI color coding thresholds
   * Used for visual feedback in progress displays
   */
  UI_COLORS: {
    EXCELLENT: 0.9, // 90%+ = green/excellent
    GOOD: 0.7, // 70%+ = yellow/good
    // Below 70% = red/needs improvement
  },

  /**
   * Session performance rating thresholds
   * Used for star ratings and celebration feedback
   */
  SESSION_RATING: {
    THREE_STARS: 0.9, // 90%+ = 3 stars/excellent
    TWO_STARS: 0.7, // 70%+ = 2 stars/good
    // Below 70% = 1 star/keep practicing
  },

  /**
   * Adaptive learning weights
   * Used by problem engine for strategy selection
   */
  ADAPTIVE_WEIGHTS: {
    UNTRIED_STRATEGY: 1.0, // High weight for new strategies
    MASTERED_STRATEGY: 0.01, // Very low weight for mastered strategies
    MIN_TRIED_STRATEGY: 0.05, // Minimum weight for attempted strategies
    LOW_ATTEMPT_BOOST_FACTOR: 0.2, // Boost factor for strategies with few attempts
    ATTEMPT_THRESHOLD: 5, // Threshold for low attempt boost
  },
} as const;

/**
 * Helper functions for common threshold checks
 */
export const PerformanceUtils = {
  /**
   * Check if a strategy is mastered
   */
  isMastered: (correct: number, totalAttempts: number): boolean => {
    if (totalAttempts < PERFORMANCE_THRESHOLDS.MASTERY.MIN_ATTEMPTS)
      return false;
    const accuracy = correct / totalAttempts;
    return accuracy >= PERFORMANCE_THRESHOLDS.MASTERY.ACCURACY;
  },

  /**
   * Check if a strategy is weak and needs practice
   */
  isWeak: (correct: number, totalAttempts: number): boolean => {
    if (totalAttempts < PERFORMANCE_THRESHOLDS.WEAKNESS.MIN_ATTEMPTS)
      return false;
    const accuracy = correct / totalAttempts;
    return accuracy < PERFORMANCE_THRESHOLDS.WEAKNESS.ACCURACY;
  },

  /**
   * Check if a strategy is untried
   */
  isUntried: (totalAttempts: number): boolean => {
    return totalAttempts === PERFORMANCE_THRESHOLDS.UNTRIED.ATTEMPTS;
  },

  /**
   * Get performance category for a strategy
   */
  getPerformanceCategory: (
    correct: number,
    totalAttempts: number,
  ): "untried" | "weak" | "good" | "mastered" => {
    if (PerformanceUtils.isUntried(totalAttempts)) return "untried";
    if (PerformanceUtils.isMastered(correct, totalAttempts)) return "mastered";
    if (PerformanceUtils.isWeak(correct, totalAttempts)) return "weak";
    return "good";
  },

  /**
   * Get UI color class based on accuracy
   */
  getAccuracyColorClass: (accuracy: number): string => {
    if (accuracy >= PERFORMANCE_THRESHOLDS.UI_COLORS.EXCELLENT * 100) {
      return "text-green-600 dark:text-green-400";
    }
    if (accuracy >= PERFORMANCE_THRESHOLDS.UI_COLORS.GOOD * 100) {
      return "text-yellow-600 dark:text-yellow-400";
    }
    return "text-red-600 dark:text-red-400";
  },

  /**
   * Get session star rating based on accuracy
   */
  getSessionStars: (accuracy: number): 1 | 2 | 3 => {
    if (accuracy >= PERFORMANCE_THRESHOLDS.SESSION_RATING.THREE_STARS * 100)
      return 3;
    if (accuracy >= PERFORMANCE_THRESHOLDS.SESSION_RATING.TWO_STARS * 100)
      return 2;
    return 1;
  },

  /**
   * Get session performance color class
   */
  getSessionPerformanceColor: (accuracy: number): string => {
    if (accuracy >= PERFORMANCE_THRESHOLDS.SESSION_RATING.THREE_STARS * 100) {
      return "text-green-600";
    }
    if (accuracy >= PERFORMANCE_THRESHOLDS.SESSION_RATING.TWO_STARS * 100) {
      return "text-yellow-600";
    }
    return "text-red-600";
  },
};
