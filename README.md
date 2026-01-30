# Cert Track Mobile

Cert Track Mobile is a mobile application built with Expo and React Native that helps users prepare for certification exams by tracking test performance, progress, and improvement over time.

This project was developed as a real-world software engineering exercise, focusing on application flow, state-driven UI, and incremental feature development rather than static demo screens.

Internal project name: FixFraiah

---

## Overview

Most certification preparation tools focus primarily on delivering questions. Cert Track Mobile focuses on measuring learning progress, identifying weak areas, and showing improvement over time.

The application is structured to support scalable certification categories, realistic exam flows, and progress tracking that mirrors how users prepare for professional certifications.

---

## Features

- User onboarding and authentication flow (UI-level)
- Certification category selection
- Practice test and timed exam modes
- Question navigation and answer selection
- Automatic scoring and results calculation
- Progress statistics and performance tracking
- Leaderboard and comparison views
- Account and profile management screens
- Modular, screen-based architecture

---

## Technology Stack

- Expo
- React Native
- JavaScript
- React Navigation
- Local state management
- Custom styling

---

## Project Structure

```text
cert-track-mobile/
├── screens/
│   ├── OnboardingScreen.js
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── CategoryScreen.js
│   ├── TestScreen.js
│   ├── ExamScreen.js
│   ├── ResultsScreen.js
│   ├── StatsScreen.js
│   ├── LeaderboardScreen.js
│   └── AccountScreen.js
├── styles.js
├── App.js
├── package.json
├── app.json
└── README.md
```

Each screen is intentionally isolated to keep navigation logic, state handling, and UI concerns separated and maintainable.

---

## Development Approach

This repository is structured to demonstrate progressive development through Git commit history.

The project evolved through the following phases:

1. Expo project initialization and application scaffold
2. Navigation setup and core screen architecture
3. Certification category selection
4. Exam and test flow implementation
5. Results calculation and progress tracking
6. Leaderboard and comparison features
7. Account management screens
8. UI and layout refinement
9. Documentation and repository cleanup

Commits are intentionally organized to reflect how the application was built incrementally rather than delivered as a single static upload.

---

## Running the Project Locally

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

The application can be run on an emulator or a physical device using the Expo client.

---

## Future Improvements

- Backend persistence using Firebase or Supabase
- Real authentication and user accounts
- External certification question bank integration
- Adaptive testing and difficulty scaling
- Advanced analytics and insights dashboards
- Admin tools for managing certifications and questions

---

## License

This project is intended for educational and portfolio purposes.