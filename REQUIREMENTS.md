# Mental Sum App - Requirements Document

## Overview

A mental math training application designed to help users improve their calculation speed and accuracy through targeted practice sessions. The app focuses on building mental calculation strategies for the four basic arithmetic operations.

**Current Status**: Core functionality complete (Phases 1-6) - 85/137 tasks completed (62.0%)  
**Active Development**: Phase 7 - Audio & Sound System

## Tech Stack

- **Framework**: Next.js (React-based)
- **Storage**: localStorage (no database required)
- **Deployment**: Static export (no internet connection needed)
- **UI Components**: shadcn/ui (with Tailwind CSS)
- **Icons**: lucide-react
- **Animations**: Framer Motion
- **Audio**: Web Audio API or HTML5 Audio (in development)
- **State Management**: React hooks/context
- **Build Tool**: Next.js built-in tooling

## Core Features

### 1. Multi-User Support ✅

- **User Management**: Dropdown selection for switching between users
- **Individual Progress Tracking**: Each user maintains separate statistics
- **Data Structure**: Store user profiles with scores, performance history
- **Metrics per User**:
  - Total problems attempted
  - Correct answers count
  - Wrong answers count
  - Average time per problem
  - Performance by operation type
  - Session history
  - Performance metrics for each mental calculation strategy (accuracy, attempts, average time).
  - History of attempted problems, including user's answer, correct answer, and strategy used.

### 2. Customizable Problem Types ✅

- **Four Operation Types**: Addition, Subtraction, Multiplication, Division
- **Toggle Controls**: Individual on/off switches for each operation
- **Dynamic Problem Generation**: Only enabled operations appear in sessions
- **Settings Persistence**: User preferences saved in localStorage

### 3. Mobile-First Design ✅ 📱

- **Primary Platform**: Optimized for mobile phone usage
- **Touch-Friendly Interface**: Large buttons and touch targets
- **Portrait Orientation**: Designed primarily for vertical phone screens
- **Responsive Layout**: Adapts gracefully to tablets and desktop
- **Fast Loading**: Optimized for mobile networks
- **Offline Capability**: Works without internet connection
- **On-Screen Number Keypad**: Custom numeric keypad for answer input ✅
  - **Touch-Optimized**: Large, thumb-friendly number buttons
  - **Compact Layout**: 3x4 grid (1-9, 0, backspace, enter)
  - **Visual Feedback**: Button press animations and haptic feedback
  - **Smart Positioning**: Positioned for easy thumb reach
  - **Session Integration**: Seamless integration with answer input flow
- **Mobile UX Patterns**: ✅
  - Thumb-friendly navigation
  - Minimal scrolling during sessions
  - Clear visual hierarchy on small screens
  - Accessible font sizes (minimum 16px)
  - **No-Scroll Session View**: All session elements visible without scrolling
  - **Optimized Vertical Layout**: Compact arrangement for smaller screens

### 4. Mental Calculation Strategies & Problem Categories ✅

#### Addition Strategies

- **Bridging to 10s**: `88 + 99` → `89 + 100 - 2` → `187`
- **Doubles**: `47 + 48` → `47 + 47 + 1` → `95`
- **Breaking Apart**: `67 + 28` → `67 + 30 - 2` → `95`
- **Left-to-Right**: `45 + 37` → `40 + 30 + 5 + 7` → `82`

#### Subtraction Strategies

- **Bridging Down**: `83 - 47` → `83 - 50 + 3` → `36`
- **Adding Up**: `62 - 38` → "What + 38 = 62?" → `24`
- **Compensation**: `74 - 29` → `74 - 30 + 1` → `45`

#### Multiplication Strategies

- **Doubling**: `15 × 4` → `15 × 2 × 2` → `60`
- **Breaking Apart**: `23 × 7` → `(20 × 7) + (3 × 7)` → `161`
- **Near Squares**: `19 × 21` → `20² - 1²` → `399`
- **Times 5**: `46 × 5` → `46 ÷ 2 × 10` → `230`
- **Times 9**: `37 × 9` → `37 × 10 - 37` → `333`

#### Division Strategies

- **Factor Recognition**: `144 ÷ 12` → `144 ÷ 4 ÷ 3` → `30`
- **Multiplication Inverse**: `91 ÷ 7` → "What × 7 = 91?" → `13`
- **Estimation & Adjustment**: `156 ÷ 13` → Try `12`, adjust → `12`

### 5. Training Sessions ✅

- **Default Length**: 10 questions per session
- **Start Mechanism**: Dedicated "Start" button
- **Problem Selection**: Random from enabled operation types initially, evolving to adaptive selection.
- **Timing**: Track time per problem and total session time
- **Immediate Feedback**: Show correct/incorrect after each answer
- **Session Summary**:
  - Total correct/incorrect count
  - Time breakdown per problem
  - Overall session time
  - Performance insights
- **Adaptive Problem Selection**: The system should (internally, without explicit user toggle) prioritize generating problems that target strategies the user is weaker in, based on their performance history. This mechanism should become more influential as the user completes more problems.
- **Focused Strategy Practice**: Users can initiate training sessions focused on a single mental calculation strategy. These sessions are accessible via links next to their performance score for that specific strategy in their progress view.

### 6. Educational Feedback System ✅

- **Wrong Answer Teaching**: When user answers incorrectly, show:
  - The correct answer
  - Step-by-step mental strategy for that problem type
  - Alternative approaches if applicable
  - Practice suggestion for similar problems
- **Post-Session & Historical Review**:
  - Allow users to review a list of problems from their recent sessions or overall history.
  - Special focus/filter for problems answered incorrectly.
  - Display user's answer, the correct solution, and the recommended strategy for each reviewed problem.

### 7. Animations & Visual Effects 🎨 (Partially Complete)

#### **Problem Transitions** ✅

- **Slide Animations**: Smooth transitions between problems
- **Fade Effects**: Gentle fade-in for new problems
- **Scale Animations**: Emphasis on correct/incorrect feedback
- **Loading Animations**: Engaging session start indicators

#### **Answer Feedback** ✅

- **Success Animations**: Green checkmark with bounce effect
- **Error Animations**: Red shake animation for incorrect answers
- **Timer Urgency**: Pulsing red when time is low
- **Progress Animations**: Smooth progress bar filling

#### **Interactive Elements** ✅

- **Button Hover Effects**: Subtle scale and color transitions
- **Input Focus**: Glowing border animations
- **Card Hover**: Gentle elevation and shadow effects
- **Navigation Transitions**: Page transition animations

#### **Celebration Effects** ✅

- **Session Complete**: Confetti or star animations
- **Perfect Score**: Special celebration animation
- **Personal Best**: Achievement unlock animation
- **Streak Milestones**: Trophy or badge animations

#### **Mobile Optimization**: Respect device silent mode

### 8. Sound Effects & Audio Feedback 🔊 (In Development)

#### **Answer Feedback Sounds**

- **Correct Answer**: Pleasant chime or bell sound
- **Incorrect Answer**: Gentle error tone (not harsh)
- **Perfect Session**: Victory fanfare
- **Timeout**: Subtle warning tone

#### **Timer Audio Cues**

- **Low Time Warning**: Gentle ticking at 10 seconds
- **Critical Time**: Faster ticking at 5 seconds
- **Time Up**: Soft timeout sound

#### **Interface Sounds**

- **Button Clicks**: Subtle tap sounds
- **Page Transitions**: Whoosh or slide sounds
- **Settings Toggle**: Switch click sounds
- **Session Start**: Engaging start sound

#### **Achievement Sounds**

- **New Personal Best**: Achievement unlock sound
- **Streak Milestone**: Special milestone chime
- **Level Up**: Progression sound
- **Perfect Accuracy**: Excellence celebration

#### **Audio Controls**

- **Volume Control**: User-adjustable sound levels
- **Mute Toggle**: Complete audio disable option
- **Sound Categories**: Separate controls for feedback vs interface sounds
- **Mobile Optimization**: Respect device silent mode

### 9. Haptic Feedback (Mobile) 📳 ✅

- **Correct Answers**: Light haptic pulse
- **Incorrect Answers**: Double tap haptic
- **Timer Warnings**: Gentle vibration patterns
- **Session Complete**: Success haptic sequence
- **Button Interactions**: Subtle feedback on taps

## Additional Helpful Features

### Progressive Difficulty

- **Adaptive Difficulty**: Adjust problem complexity based on user performance
- **Skill Levels**: Beginner, Intermediate, Advanced modes
- **Custom Ranges**: Allow users to set number ranges for problems

### Performance Analytics

- **Progress Tracking**: Visual charts showing improvement over time
- **Weak Area Detection**: Identify operation types or number ranges where user struggles (expanded by strategy-specific tracking).
- **Performance Trends**: Daily/weekly/monthly performance summaries
- **Goal Setting**: Allow users to set target accuracy or speed goals
- **Strategy-Specific Progress**:
  - Display detailed progress for each mental math strategy (e.g., "Addition - Bridging to 10s", "Multiplication - Times 5").
  - Metrics to include: accuracy (correct/attempted), total attempts, average time per problem for that strategy.
  - Direct links from each strategy's progress display to initiate a "Focused Strategy Practice" session for that specific skill.

### Practice Modes

- **Endless Mode**: Continue practicing without session limits
- **Speed Rounds**: Time-pressured quick-fire sessions
- **Focus Mode**: Practice specific strategies or problem types
- **Review Mode**: Revisit previously missed problems

### Gamification Elements

- **Achievement Badges**: Unlock rewards for milestones
- **Streak Tracking**: Consecutive correct answers or daily practice
- **Personal Bests**: Track fastest times and highest accuracies
- **Challenge Mode**: Special problem sets with unique objectives

### Accessibility & UX

- **Keyboard Navigation**: Full keyboard support for faster interaction ✅
- **Visual Feedback**: Clear indicators for correct/incorrect answers ✅
- **Undo/Redo**: Allow correction of accidental inputs
- **Pause/Resume**: Ability to pause during sessions ✅
- **Export Data**: Allow users to backup their progress

### Educational Enhancements

- **Strategy Library**: Reference guide for all mental math techniques ✅
- **Practice Recommendations**: Suggest specific practice based on performance
- **Problem Explanations**: Show multiple solution methods for each problem ✅
- **Math Tips**: Daily tips for mental calculation improvement

## Development Status & Next Steps

### ✅ **Completed Phases (1-6)**

- Core infrastructure and architecture
- Complete user management system
- Full problem generation with mental math strategies
- Comprehensive training session system
- Results analytics and educational feedback
- Mobile-first design with number keypad
- Basic animations and haptic feedback

### 🔄 **Current Phase 7: Audio System**

- Web Audio API integration
- Sound effect implementation
- Volume controls and audio settings
- Mobile audio optimization

### 📋 **Future Enhancements**

- Advanced analytics and charts
- Achievement system
- Additional practice modes
- Accessibility improvements

## Success Metrics

- User engagement (sessions per day/week)
- Improvement in calculation speed over time
- Accuracy improvement across different operation types
- User retention and continued usage
- Effectiveness of teaching strategies (improvement after feedback)
- User satisfaction with animations and audio feedback

---

**For detailed task tracking and development progress, see TASKS.md**
.
