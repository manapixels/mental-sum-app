This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

Mental Sum App is designed to help users improve their mental arithmetic skills through targeted practice and feedback.

### Core Functionality

- **Customizable Practice:** Users can select problem types (addition, subtraction, multiplication, division), difficulty levels, and session lengths.
- **Multiple User Profiles:** Supports multiple users, each with their own preferences and progress tracking.
- **Interactive Sessions:** Timed problems with immediate feedback.
- **Mobile-First Design:** Responsive interface suitable for various screen sizes.

### Advanced Progress & Adaptive Learning (Phase 8)

This set of features enhances the learning experience by providing detailed insights and personalized practice:

- **Strategy-Specific Performance Tracking:** The app now tracks user performance (accuracy, attempts) for various mental math strategies (e.g., "Bridging to 10s" for addition, "Times 5" for multiplication).
- **Adaptive Problem Selection:** An intelligent algorithm selects problems by prioritizing strategies where the user is weaker, based on accuracy and number of attempts. This ensures practice is focused where it's needed most.
- **Focused Practice Mode:** Users can choose to practice a specific mental math strategy. This can be accessed from the new Progress page.
- **Progress Dashboard (`/`):**
  - Displays overall user statistics (total problems, accuracy, streaks, average time, etc.).
  - Provides a detailed breakdown of performance for each mental math strategy, showing accuracy, attempts, and a visual progress bar.
- \*\*Review Mistakes (`/review`):
  - Allows users to review problems they answered incorrectly.
  - Shows the problem, user's answer, correct answer, and the intended strategy.
  - Includes options to sort and filter incorrect problems (e.g., by date, by strategy).
  - Provides a "Practice this Skill" button to start a focused session on the strategy of an incorrectly answered problem.
- **Learn Strategies (Placeholder):** Each strategy card on the Progress page includes a "Learn More" (help icon) button. This opens a modal with placeholder content and examples for the selected strategy, which will be expanded with detailed tutorials in the future.

## Learn More about Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
