# Mental Sum App - Requirements Document

## Overview

A mental math training application designed to help users improve their calculation speed and accuracy through targeted practice sessions. The app focuses on building mental calculation strategies for the four basic arithmetic operations.

## Tech Stack

- **Framework**: Next.js (React-based)
- **Storage**: localStorage (no database required)
- **Deployment**: Static export (no internet connection needed)
- **UI Components**: shadcn/ui (with Tailwind CSS)
- **Icons**: lucide-react
- **State Management**: React hooks/context
- **Build Tool**: Next.js built-in tooling

## Core Features

### 1. Multi-User Support

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

### 2. Customizable Problem Types

- **Four Operation Types**: Addition, Subtraction, Multiplication, Division
- **Toggle Controls**: Individual on/off switches for each operation
- **Dynamic Problem Generation**: Only enabled operations appear in sessions
- **Settings Persistence**: User preferences saved in localStorage

### 3. Mental Calculation Strategies & Problem Categories

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

### 4. Training Sessions

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

### 5. Educational Feedback System

- **Wrong Answer Teaching**: When user answers incorrectly, show:
  - The correct answer
  - Step-by-step mental strategy for that problem type
  - Alternative approaches if applicable
  - Practice suggestion for similar problems

## Tasks Breakdown

### Phase 1: Core Infrastructure

- [ ] **Project Setup**

  - [ ] Initialize Next.js project
  - [ ] Configure for static export
  - [ ] Set up basic folder structure
  - [ ] Install and configure styling framework

- [ ] **Data Management**
  - [ ] Design localStorage schema for users
  - [ ] Implement user CRUD operations
  - [ ] Create data persistence utilities
  - [ ] Design session/statistics data structure

### Phase 2: User Management

- [ ] **User Interface**

  - [ ] Create user selection dropdown
  - [ ] Implement add new user functionality
  - [ ] Add delete user option
  - [ ] Design user statistics display

- [ ] **User Data**
  - [ ] Track individual user performance
  - [ ] Store user preferences (operation toggles)
  - [ ] Implement data migration/backup features

### Phase 3: Problem Generation & Settings

- [ ] **Problem Generator**

  - [ ] Create algorithms for each operation type
  - [ ] Implement difficulty progression
  - [ ] Ensure problem variety and appropriate ranges
  - [ ] Add problem categorization for teaching

- [ ] **Settings Interface**
  - [ ] Design toggle controls for operations
  - [ ] Add session length customization
  - [ ] Implement difficulty level selection
  - [ ] Create settings persistence

### Phase 4: Training Session

- [ ] **Session Flow**

  - [ ] Design start screen with current settings
  - [ ] Implement problem presentation interface
  - [ ] Create answer input and validation
  - [ ] Add timing functionality per problem

- [ ] **Progress Tracking**
  - [ ] Real-time session progress indicator
  - [ ] Timer display during problems
  - [ ] Immediate feedback on answers

### Phase 5: Results & Teaching

- [ ] **Session Summary**

  - [ ] Design results page layout
  - [ ] Show performance statistics
  - [ ] Display time analytics
  - [ ] Add session history

- [ ] **Educational Components**
  - [ ] Create teaching modals for wrong answers
  - [ ] Implement strategy explanations
  - [ ] Add visual aids for mental calculation methods
  - [ ] Design tip system for improvement

### Phase 6: Enhanced Features

- [ ] **Advanced Analytics**

  - [ ] Progress over time graphs
  - [ ] Weak area identification
  - [ ] Performance comparison between users
  - [ ] Achievement system

- [ ] **User Experience**
  - [ ] Keyboard shortcuts for faster input
  - [ ] Sound effects and animations
  - [ ] Dark/light mode toggle
  - [ ] Responsive design for mobile

## Additional Helpful Features

### 7. Progressive Difficulty

- **Adaptive Difficulty**: Adjust problem complexity based on user performance
- **Skill Levels**: Beginner, Intermediate, Advanced modes
- **Custom Ranges**: Allow users to set number ranges for problems

### 8. Performance Analytics

- **Progress Tracking**: Visual charts showing improvement over time
- **Weak Area Detection**: Identify operation types or number ranges where user struggles
- **Performance Trends**: Daily/weekly/monthly performance summaries
- **Goal Setting**: Allow users to set target accuracy or speed goals

### 9. Practice Modes

- **Endless Mode**: Continue practicing without session limits
- **Speed Rounds**: Time-pressured quick-fire sessions
- **Focus Mode**: Practice specific strategies or problem types
- **Review Mode**: Revisit previously missed problems

### 10. Gamification Elements

- **Achievement Badges**: Unlock rewards for milestones
- **Streak Tracking**: Consecutive correct answers or daily practice
- **Personal Bests**: Track fastest times and highest accuracies
- **Challenge Mode**: Special problem sets with unique objectives

### 11. Accessibility & UX

- **Keyboard Navigation**: Full keyboard support for faster interaction
- **Visual Feedback**: Clear indicators for correct/incorrect answers
- **Undo/Redo**: Allow correction of accidental inputs
- **Pause/Resume**: Ability to pause during sessions
- **Export Data**: Allow users to backup their progress

### 12. Educational Enhancements

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
