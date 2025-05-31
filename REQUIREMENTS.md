# Mental Sum App - Requirements Document

## Overview

A mental math training application designed to help users improve their calculation speed and accuracy through targeted practice sessions. The app focuses on building mental calculation strategies for the four basic arithmetic operations.

## Tech Stack

- **Framework**: Next.js (React-based)
- **Storage**: localStorage (no database required)
- **Deployment**: Static export (no internet connection needed)
- **UI Components**: shadcn/ui (with Tailwind CSS)
- **Icons**: lucide-react
- **Animations**: Framer Motion or CSS animations
- **Audio**: Web Audio API or HTML5 Audio
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
- **Mobile UX Patterns**:
  - Thumb-friendly navigation
  - Minimal scrolling during sessions
  - Clear visual hierarchy on small screens
  - Accessible font sizes (minimum 16px)

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
- **Problem Selection**: Random from enabled operation types
- **Timing**: Track time per problem and total session time
- **Immediate Feedback**: Show correct/incorrect after each answer
- **Session Summary**:
  - Total correct/incorrect count
  - Time breakdown per problem
  - Overall session time
  - Performance insights

### 6. Educational Feedback System ✅

- **Wrong Answer Teaching**: When user answers incorrectly, show:
  - The correct answer
  - Step-by-step mental strategy for that problem type
  - Alternative approaches if applicable
  - Practice suggestion for similar problems

### 7. Animations & Visual Effects 🎨

#### **Problem Transitions**

- **Slide Animations**: Smooth transitions between problems
- **Fade Effects**: Gentle fade-in for new problems
- **Scale Animations**: Emphasis on correct/incorrect feedback
- **Loading Animations**: Engaging session start indicators

#### **Answer Feedback**

- **Success Animations**: Green checkmark with bounce effect
- **Error Animations**: Red shake animation for incorrect answers
- **Timer Urgency**: Pulsing red when time is low
- **Progress Animations**: Smooth progress bar filling

#### **Interactive Elements**

- **Button Hover Effects**: Subtle scale and color transitions
- **Input Focus**: Glowing border animations
- **Card Hover**: Gentle elevation and shadow effects
- **Navigation Transitions**: Page transition animations

#### **Celebration Effects**

- **Session Complete**: Confetti or star animations
- **Perfect Score**: Special celebration animation
- **Personal Best**: Achievement unlock animation
- **Streak Milestones**: Trophy or badge animations

### 8. Sound Effects & Audio Feedback 🔊

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

### 9. Haptic Feedback (Mobile) 📳

- **Correct Answers**: Light haptic pulse
- **Incorrect Answers**: Double tap haptic
- **Timer Warnings**: Gentle vibration patterns
- **Session Complete**: Success haptic sequence
- **Button Interactions**: Subtle feedback on taps

## Tasks Breakdown

### Phase 1: Core Infrastructure ✅

- [x] **Project Setup**

  - [x] Initialize Next.js project
  - [x] Configure for static export
  - [x] Set up basic folder structure
  - [x] Install and configure styling framework

- [x] **Data Management**
  - [x] Design localStorage schema for users
  - [x] Implement user CRUD operations
  - [x] Create data persistence utilities
  - [x] Design session/statistics data structure

### Phase 2: User Management ✅

- [x] **User Interface**

  - [x] Create user selection dropdown
  - [x] Implement add new user functionality
  - [x] Add delete user option
  - [x] Design user statistics display

- [x] **User Data**
  - [x] Track individual user performance
  - [x] Store user preferences (operation toggles)
  - [x] Implement data migration/backup features

### Phase 3: Problem Generation & Settings ✅

- [x] **Problem Generator**

  - [x] Create algorithms for each operation type
  - [x] Implement difficulty progression
  - [x] Ensure problem variety and appropriate ranges
  - [x] Add problem categorization for teaching

- [x] **Settings Interface**
  - [x] Design toggle controls for operations
  - [x] Add session length customization
  - [x] Implement difficulty level selection
  - [x] Create settings persistence

### Phase 4: Training Session ✅

- [x] **Session Flow**

  - [x] Design start screen with current settings
  - [x] Implement problem presentation interface
  - [x] Create answer input and validation
  - [x] Add timing functionality per problem

- [x] **Progress Tracking**
  - [x] Real-time session progress indicator
  - [x] Timer display during problems
  - [x] Immediate feedback on answers

### Phase 5: Results & Teaching ✅

- [x] **Session Summary**

  - [x] Design results page layout
  - [x] Show performance statistics
  - [x] Display time analytics
  - [x] Add session history

- [x] **Educational Components**
  - [x] Create teaching modals for wrong answers
  - [x] Implement strategy explanations
  - [x] Add visual aids for mental calculation methods
  - [x] Design tip system for improvement

### Phase 6: Enhanced Features

- [ ] **Advanced Analytics**

  - [ ] Progress over time graphs
  - [ ] Weak area identification
  - [ ] Performance comparison between users
  - [ ] Achievement system

- [x] **User Experience**
  - [x] Mobile-first responsive design
  - [x] Touch-friendly interface with large tap targets
  - [x] Keyboard shortcuts for faster input
  - [ ] Sound effects and animations
  - [ ] Dark/light mode toggle

### Phase 7: Animations & Audio 🆕

- [ ] **Visual Animations**

  - [ ] Problem transition animations
  - [ ] Answer feedback animations (correct/incorrect)
  - [ ] Timer urgency animations
  - [ ] Progress bar animations
  - [ ] Session completion celebrations
  - [ ] Button and interaction micro-animations

- [ ] **Sound Effects**

  - [ ] Answer feedback sounds (correct/incorrect)
  - [ ] Timer warning sounds
  - [ ] Interface interaction sounds
  - [ ] Achievement and milestone sounds
  - [ ] Session completion audio
  - [ ] Audio settings and controls

- [ ] **Haptic Feedback**
  - [ ] Answer feedback vibrations
  - [ ] Timer warning haptics
  - [ ] Button interaction feedback
  - [ ] Achievement celebration haptics

## Additional Helpful Features

### 8. Progressive Difficulty

- **Adaptive Difficulty**: Adjust problem complexity based on user performance
- **Skill Levels**: Beginner, Intermediate, Advanced modes
- **Custom Ranges**: Allow users to set number ranges for problems

### 9. Performance Analytics

- **Progress Tracking**: Visual charts showing improvement over time
- **Weak Area Detection**: Identify operation types or number ranges where user struggles
- **Performance Trends**: Daily/weekly/monthly performance summaries
- **Goal Setting**: Allow users to set target accuracy or speed goals

### 10. Practice Modes

- **Endless Mode**: Continue practicing without session limits
- **Speed Rounds**: Time-pressured quick-fire sessions
- **Focus Mode**: Practice specific strategies or problem types
- **Review Mode**: Revisit previously missed problems

### 11. Gamification Elements

- **Achievement Badges**: Unlock rewards for milestones
- **Streak Tracking**: Consecutive correct answers or daily practice
- **Personal Bests**: Track fastest times and highest accuracies
- **Challenge Mode**: Special problem sets with unique objectives

### 12. Accessibility & UX

- **Keyboard Navigation**: Full keyboard support for faster interaction
- **Visual Feedback**: Clear indicators for correct/incorrect answers
- **Undo/Redo**: Allow correction of accidental inputs
- **Pause/Resume**: Ability to pause during sessions
- **Export Data**: Allow users to backup their progress

### 13. Educational Enhancements

- **Strategy Library**: Reference guide for all mental math techniques
- **Practice Recommendations**: Suggest specific practice based on performance
- **Problem Explanations**: Show multiple solution methods for each problem
- **Math Tips**: Daily tips for mental calculation improvement

## Success Metrics

- User engagement (sessions per day/week)
- Improvement in calculation speed over time
- Accuracy improvement across different operation types
- User retention and continued usage
- Effectiveness of teaching strategies (improvement after feedback)
- User satisfaction with animations and audio feedback
