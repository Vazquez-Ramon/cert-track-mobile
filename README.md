# Cert Track Mobile

Cert Track Mobile is a mobile application built with **Expo and React Native** designed to track certifications, user progress, and real-time interaction. The project demonstrates modern mobile app architecture, reusable UI components, global state management, and structured feature development.

---

## 📱 Overview

This application was built as a portfolio project to demonstrate the ability to design, build, and structure a real-world mobile application. It focuses on scalability, clean architecture, and professional development workflows.

---

## 🧱 Tech Stack

- Expo
- React Native
- JavaScript
- React Context API
- Firebase (service integration)
- Git & GitHub

---

## 🗂 Project Structure

```
cert-track-mobile/
├── App.js                 # Application bootstrap and global providers
├── index.js               # Entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── styles.js              # Centralized styling
├── firebase.js            # Backend service integration
├── assets/                # App icons and assets
│
├── components/            # Reusable UI components
│   ├── BackButton.js
│   ├── BottomNav.js
│   ├── BuzzButton.js
│   ├── MenuTile.js
│   ├── PieProgress.js
│   ├── Calendar.js
│   ├── AvatarPickerModal.js
│   ├── InlineChat.js
│   ├── PresenceDropdown.js
│   └── SplashScreen.js
│
├── chat/                  # Chat system
│   ├── ChatContext.js     # Global chat state
│   └── ChatRoomPane.js    # Chat UI logic
│
├── context/               # Global application state
│   └── AppContext.js
│
├── data/                  # Certification datasets and constants
│   ├── *.json
│   └── constants.js
│
└── screens/               # Application screens
    ├── HomeScreen.js
    ├── LoginScreen.js
    ├── LeaderboardScreen.js
    ├── ChatHomeScreen.js
    ├── VideoCallScreen.js
    ├── VideoCallScreen.js
    ├── VoiceCallScreen.js
    └── ...
```

---

## ✨ Features

- Modular and reusable UI components
- Bottom navigation and screen-based routing
- Global application state using React Context
- Structured certification and progress tracking
- Chat system with shared state
- Modal-based UI interactions
- Calendar and progress visualization
- Firebase service integration
- Clean Git commit history demonstrating staged development

---

## 🧠 Architectural Highlights

- Component-based design for reusability
- Context API for shared global state
- Data-driven architecture separating logic and datasets
- Scalable folder structure suitable for backend expansion
- Professional Git workflow with staged commits and milestones

---

## 🎯 Purpose

This project was built to showcase:
- Mobile application architecture
- UI/UX design thinking
- State management
- Feature-based development
- Professional Git and GitHub practices

---

## 🚀 Getting Started

```bash
npm install
npx expo start
```

---

## 📌 Notes

This repository is intended as a portfolio demonstration and learning project. It is structured to scale with additional backend services, authentication, and API integrations.

---

## 👤 Author

Built and maintained by: Ramon Vazquez
