// App.js
import React, { useState, useEffect } from "react";
import { StatusBar } from "react-native";

// SAFE AREA FIX (REQUIRED)
import { SafeAreaProvider } from "react-native-safe-area-context";

// Contexts
import { AppProvider } from "./context/AppContext";
import { ChatProvider } from "./chat/ChatContext";

// Screens
import { SplashScreen } from "./components/SplashScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { CategoryScreen } from "./screens/CategoryScreen";
import { ExamScreen } from "./screens/ExamScreen";
import { TestScreen } from "./screens/TestScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { StatsScreen } from "./screens/StatsScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { AccountScreen } from "./screens/AccountScreen";

// Messenger Screens
import { GlobalChatScreen } from "./screens/GlobalChatScreen";
import { ChatHomeScreen } from "./screens/ChatHomeScreen";
import { ChatDmScreen } from "./screens/ChatDmScreen";
import Matchmaking from "./screens/Matchmaking";
import VideoCallScreen from "./screens/VideoCallScreen";
import VoiceCallScreen from "./screens/VoiceCallScreen";

// Data
import { SPLASH_MESSAGES } from "./data/constants";

function AppNavigator() {
  const [stack, setStack] = useState([{ name: "Login", params: {} }]);
  const [isLoading, setIsLoading] = useState(true);
  const [splashIndex, setSplashIndex] = useState(
    () => Math.floor(Math.random() * SPLASH_MESSAGES.length)
  );

  const current = stack[stack.length - 1];

  // Splash Animation Handler
  useEffect(() => {
    const interval = setInterval(() => {
      setSplashIndex((prev) => (prev + 1) % SPLASH_MESSAGES.length);
    }, 1500);

    const timer = setTimeout(() => setIsLoading(false), 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  // Custom navigation object
  const navigation = {
    navigate: (name, params = {}) => {
      setStack((prev) => [...prev, { name, params }]);
    },
    replace: (name, params = {}) => {
      setStack((prev) => [
        ...prev.slice(0, prev.length - 1),
        { name, params },
      ]);
    },
    goBack: () => {
      setStack((prev) =>
        prev.length > 1 ? prev.slice(0, prev.length - 1) : prev
      );
    },
    canGoBack: stack.length > 1,
  };

  // Screen Router
  let ScreenComponent;
  switch (current.name) {
    case "Login":
      ScreenComponent = LoginScreen;
      break;
    case "Onboarding":
      ScreenComponent = OnboardingScreen;
      break;
    case "Home":
      ScreenComponent = HomeScreen;
      break;
    case "Categories":
      ScreenComponent = CategoryScreen;
      break;
    case "Exams":
      ScreenComponent = ExamScreen;
      break;
    case "Test":
      ScreenComponent = TestScreen;
      break;
    case "Results":
      ScreenComponent = ResultsScreen;
      break;
    case "Stats":
      ScreenComponent = StatsScreen;
      break;
    case "Leaderboard":
      ScreenComponent = LeaderboardScreen;
      break;
    case "Account":
      ScreenComponent = AccountScreen;
      break;

    // Messenger
    case "Chat":
      ScreenComponent = ChatHomeScreen;
      break;
    case "ChatDM":
      ScreenComponent = ChatDmScreen;
      break;
    case "GlobalChat":
      ScreenComponent = GlobalChatScreen;
      break;
    case "Matchmaking":
      ScreenComponent = Matchmaking;
      break;
    case "VideoCallScreen":
      ScreenComponent = VideoCallScreen;
      break;
    case "VoiceCallScreen":
      ScreenComponent = VoiceCallScreen;
      break;

    default:
      ScreenComponent = LoginScreen;
  }

  if (isLoading) {
    return <SplashScreen message={SPLASH_MESSAGES[splashIndex]} />;
  }

  return (
    <ScreenComponent navigation={navigation} route={{ params: current.params }} />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ChatProvider>
          <StatusBar barStyle="light-content" />
          <AppNavigator />
        </ChatProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}