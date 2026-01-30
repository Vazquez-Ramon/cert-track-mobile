import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------------------------------------------------------
// App Context - stores ALL non-chat global app settings
// (Account Avatar, XP, streak, stats, username, theme)
// ---------------------------------------------------------

const AppContext = createContext(null);

// The original placeholder section was not complete, so I'm focusing on the main value definition.
/*
const value = useMemo(
  () => ({
    // ... other values

    // theme/audio/font
    theme,
    setTheme,
    audioEnabled,
    setAudioEnabled,
    fontScale,
    setFontScale,

    logout,
    recordExamResult, // ⬅️ Add the function here
  }),
  [
    // ... other dependencies
    fontScale,
    recordExamResult, // ⬅️ And add to the dependency array
  ]
);
*/

export function AppProvider({ children }) {
  // ================================
  // USER PROFILE (App side only)
  // ================================
  const [username, setUsername] = useState("Champion");

  // ACCOUNT AVATAR (NOT Chat avatar)
  const [homeAvatar, setHomeAvatar] = useState("😀");
  const [homeAvatarUri, setHomeAvatarUri] = useState(null);

  // XP + Stats
  const [xp, setXp] = useState(0);
  const [statsByExam, setStatsByExam] = useState({});
  const [streak, setStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(null);

  // Theme + Font + Audio (global)
  const [theme, setTheme] = useState("dark");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  // ------------------------
  // XP / Results
  // ------------------------
  const registerActivity = () => {
    // Placeholder function, assumed to be defined elsewhere in the full context
  };
  
  const addXP = (amount) => {
    setXp((x) => x + amount);
    registerActivity();
  };

  const recordExamResult = (examId, count, correct) => {
    setStatsByExam((prev) => {
      const cur = prev[examId] || { attempts: 0, questions: 0, correct: 0 };
      return {
        ...prev,
        [examId]: {
          attempts: cur.attempts + 1,
          questions: cur.questions + count,
          correct: cur.correct + correct,
        },
      };
    });

    const reward = 10 + correct * 5;
    addXP(reward);
  };

  // Global Chat unread count (shown on HomeScreen Playbook tile)
  const [unreadGlobalChatCount, setUnreadGlobalChatCount] = useState(0);

  // Load persisted settings
  useEffect(() => {
    (async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("username");
        const savedHomeAvatar = await AsyncStorage.getItem("homeAvatar");
        const savedHomeAvatarUri = await AsyncStorage.getItem("homeAvatarUri");
        const savedTheme = await AsyncStorage.getItem("theme");
        const savedXP = await AsyncStorage.getItem("xp");
        const savedStats = await AsyncStorage.getItem("statsByExam");
        const savedStreak = await AsyncStorage.getItem("streak");
        const savedLastActive = await AsyncStorage.getItem("lastActiveDate");
        const savedAudio = await AsyncStorage.getItem("audioEnabled");
        const savedFontScale = await AsyncStorage.getItem("fontScale");

        if (savedUsername) setUsername(savedUsername);
        if (savedHomeAvatar) setHomeAvatar(savedHomeAvatar);
        if (savedHomeAvatarUri) setHomeAvatarUri(savedHomeAvatarUri);
        if (savedXP) setXp(Number(savedXP));
        if (savedStats) setStatsByExam(JSON.parse(savedStats));
        if (savedTheme) setTheme(savedTheme);
        if (savedStreak) setStreak(Number(savedStreak));
        if (savedLastActive) setLastActiveDate(savedLastActive);
        if (savedAudio) setAudioEnabled(savedAudio === "true");
        if (savedFontScale) setFontScale(Number(savedFontScale));
      } catch (e) {
        console.log("Error loading AppContext:", e);
      }
    })();
  }, []);

  // Persist changes
  useEffect(() => {
    AsyncStorage.setItem("username", username);
  }, [username]);

  useEffect(() => {
    AsyncStorage.setItem("homeAvatar", homeAvatar);
  }, [homeAvatar]);

  useEffect(() => {
    if (homeAvatarUri)
      AsyncStorage.setItem("homeAvatarUri", homeAvatarUri);
    else
      AsyncStorage.removeItem("homeAvatarUri");
  }, [homeAvatarUri]);

  useEffect(() => {
    AsyncStorage.setItem("xp", String(xp));
  }, [xp]);

  useEffect(() => {
    AsyncStorage.setItem("statsByExam", JSON.stringify(statsByExam));
  }, [statsByExam]);

  useEffect(() => {
    AsyncStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    AsyncStorage.setItem("streak", String(streak));
  }, [streak]);

  useEffect(() => {
    if (lastActiveDate)
    AsyncStorage.setItem("lastActiveDate", String(lastActiveDate));
  }, [lastActiveDate]);

  useEffect(() => {
    AsyncStorage.setItem("audioEnabled", audioEnabled ? "true" : "false");
  }, [audioEnabled]);

  useEffect(() => {
    AsyncStorage.setItem("fontScale", String(fontScale));
  }, [fontScale]);

  const logout = () => {
    setUsername("Champion");
    setHomeAvatar("😀");
    setHomeAvatarUri(null);
    setXp(0);
    setStatsByExam({});
    setStreak(0);
    setLastActiveDate(null);
  };

  const value = useMemo(
    () => ({
      username,
      setUsername,
      xp,
      setXp,
      streak,
      setStreak,
      lastActiveDate,
      setLastActiveDate,
      statsByExam,
      setStatsByExam,

      // ACCOUNT AVATAR ONLY — separate from Chat
      homeAvatar,
      setHomeAvatar,
      homeAvatarUri,
      setHomeAvatarUri,

      unreadGlobalChatCount,
      setUnreadGlobalChatCount,

      // theme/audio/font
      theme,
      setTheme,
      audioEnabled,
      setAudioEnabled,
      fontScale,
      setFontScale,

      logout,
      recordExamResult, // <--- 🌟 FIX: Exposed the function here
    }),
    [
      username,
      xp,
      streak,
      lastActiveDate,
      statsByExam,
      homeAvatar,
      homeAvatarUri,
      unreadGlobalChatCount,
      theme,
      audioEnabled,
      fontScale,
      recordExamResult, // <--- 🌟 FIX: Added the function to dependencies
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}