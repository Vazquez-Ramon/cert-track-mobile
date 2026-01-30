// ======================================================================
// ChatContext.js — V6: Fixed Deletion Logic (For Me/For All)
// ======================================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

// ======================================================
// TIME FORMATTER
// ======================================================
function formatTime(d = new Date()) {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const am = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${am}`;
}

// ======================================================
// PERSONALITY ENGINES
// ======================================================
const PERSONALITIES = {
  byteBug: {
    mood: "chaotic gamer",
    typingSpeed: 1200,
    opener: ["Yo Rah what you on?", "Brooooo 💀", "You awake?"],
    responses: [
      "ngl you right 😂",
      "ain’t no way you said that 😭",
      "Bruh my ping is wild rn",
      "your router still in hospice??",
      "bet bet say less",
    ],
  },

  pixelKitty: {
    mood: "soft flirty energy",
    typingSpeed: 1500,
    opener: [
      "Hiiii :3",
      "I was literally thinking of you lol",
      "Guess what?? 😼",
    ],
    responses: [
      "aaa youre funny 💕",
      "wait fr?? omg",
      "noooo you're lying 😂",
      "*blushes aggressively*",
      "I cannot with you 😭",
    ],
  },

  sysCrash: {
    mood: "burnt out IT tech",
    typingSpeed: 2200,
    opener: [
      "Bro I'm tired.",
      "Long day at work man.",
      "If another server crashes I'm quitting.",
    ],
    responses: [
      "Same stuff different day.",
      "Tell me why my coworker unplugged the switch 💀",
      "Bro I need sleep.",
      "I'm not paid enough for this.",
      "Real talk? I'm exhausted.",
    ],
  },

  glitchGhost: {
    mood: "troll hacker energy",
    typingSpeed: 1700,
    opener: ["Accessing… 👻", "I see you 👀", "you online or hiding?"],
    responses: [
      "system breach complete",
      "you've been compromised 😂",
      "sending payload… jk… unless?",
      "ping me again and I haunt your wifi",
      "hold up updating my scripts",
    ],
  },

  zeroLag: {
    mood: "calm intelligent analyst",
    typingSpeed: 900,
    opener: [
      "I just finished analyzing that data set.",
      "Have you eaten today?",
      "Yo check your email.",
    ],
    responses: [
      "Efficient solution ngl.",
      "I like that idea.",
      "Let’s optimize it.",
      "Send it, I’ll look.",
      "You're improving fast man.",
    ],
  },
};

// ======================================================
// MOCK USERS
// ======================================================
const MOCK_USERS = [
  {
    uid: "u1",
    displayName: "byteBug",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    presence: "online",
    lastSeen: null,
    statusMessage: "Grinding Ranked 🎮",
  },
  {
    uid: "u2",
    displayName: "pixelKitty",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    presence: "online",
    lastSeen: null,
    statusMessage: "Drawing cats & chaos 🐾",
  },
  {
    uid: "u3",
    displayName: "sysCrash",
    avatar: "https://randomuser.me/api/portraits/men/13.jpg",
    presence: "offline",
    lastSeen: "2:11 PM",
    statusMessage: "Please let me sleep 😪",
  },
  {
    uid: "u4",
    displayName: "glitchGhost",
    avatar: "https://randomuser.me/api/portraits/men/43.jpg",
    presence: "away",
    lastSeen: "3:45 PM",
    statusMessage: "Haunting servers 👻",
  },
  {
    uid: "u5",
    displayName: "zeroLag",
    avatar: "https://randomuser.me/api/portraits/women/35.jpg",
    presence: "busy",
    lastSeen: "11:22 AM",
    statusMessage: "Deep in analytics 📊",
  },
];

// ======================================================
// PRELOADED CHAT
// ======================================================
const PRELOADED = {
  u1: [
    {
      id: 1000,
      sender: "You",
      text: "Hey, what are you up to tonight? Need to talk about that new game update.",
      time: formatTime(),
      seen: true,
      reactions: {},
      replyingToId: null,
      forwardingId: null,
    },
    {
      id: 1001,
      sender: "byteBug",
      text: "Yo Rah what you on? Bruh my ping is wild rn. I'm grinding ranked.",
      time: formatTime(),
      seen: false,
      reactions: {},
      replyingToId: null,
      forwardingId: null,
    },
    // Add a message for testing reply/forward context
    {
      id: 1002,
      sender: "You",
      text: "That last message was meant for my boss, not you, lol.",
      time: formatTime(),
      seen: false,
      reactions: { '😂': 1 },
      replyingToId: null,
      forwardingId: null,
    },
    {
      id: 1003,
      sender: "byteBug",
      text: "I know, I saw. I'm replying to your message about the boss now.",
      time: formatTime(),
      seen: false,
      reactions: {},
      replyingToId: 1002, // Replying to message with ID 1002
      forwardingId: null,
    },
  ],
  u2: [],
  u3: [],
  u4: [],
  u5: [],
};

// ======================================================
// PROVIDER
// ======================================================
export function ChatProvider({ children }) {
  const [chatUser, setChatUser] = useState({
    uid: "self",
    displayName: "savageCoder",
    avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
    presence: "online",
    lastSeen: null,
  });

  const [users, setUsers] = useState(MOCK_USERS);
  const [messages, setMessages] = useState({});
  const [typingMap, setTypingMap] = useState({});
  const [disappearingChats, setDisappearingChats] = useState({}); 

  // ======================================================
  // LOAD MESSAGES
  // ======================================================
  useEffect(() => {
    // NOTE: Changed key to 'messages_v6' to refresh mock data structure
    (async () => {
      const saved = await AsyncStorage.getItem("messages_v6"); 
      if (saved) setMessages(JSON.parse(saved));
      else setMessages(PRELOADED);
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("messages_v6", JSON.stringify(messages));
  }, [messages]);

  // ======================================================
  // INTERNAL HELPERS
  // ======================================================
  const updateChatUser = (u) => setChatUser((p) => ({ ...p, ...u }));

  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ======================================================
  // AUTO STATUS TOGGLE (RANDOM ONLINE/OFFLINE)
  // ======================================================
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prev) =>
        prev.map((u) => {
          // 20% chance each second to change status
          if (Math.random() < 0.2) {
            const states = ["online", "offline", "busy", "away"];
            const newState = randomItem(states);

            return {
              ...u,
              presence: newState,
              lastSeen:
                newState === "offline" ? formatTime() : u.lastSeen,
            };
          }
          return u;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // ======================================================
  // SEND MESSAGE (UPDATED)
  // ======================================================
  const sendMessage = (otherUser, text, replyingToId = null, forwardingId = null) => {
    const newMsg = {
      id: Date.now(),
      sender: "You",
      text,
      time: formatTime(),
      seen: false,
      reactions: {}, 
      replyingToId,  
      forwardingId,  
    };

    setMessages((p) => ({
      ...p,
      [otherUser.uid]: [...(p[otherUser.uid] || []), newMsg],
    }));

    simulateReply(otherUser.uid);
  };

  // ======================================================
  // AUTO-REPLY ENGINE
  // ======================================================
  const simulateReply = (uid) => {
    const user = users.find((u) => u.uid === uid);
    if (!user) return;

    const personality = PERSONALITIES[user.displayName];

    // show typing
    setTypingMap((p) => ({ ...p, [uid]: true }));

    const typingDelay =
      personality.typingSpeed + Math.random() * 800;

    setTimeout(() => {
      setTypingMap((p) => ({ ...p, [uid]: false }));

      const reply = {
        id: Date.now() + 1,
        sender: user.displayName,
        text: randomItem(personality.responses),
        time: formatTime(),
        seen: false,
        reactions: {},
        replyingToId: null,
        forwardingId: null,
      };

      setMessages((p) => ({
        ...p,
        [uid]: [...(p[uid] || []), reply],
      }));
    }, typingDelay);
  };

  // ======================================================
  // MARK SEEN
  // ======================================================
  const markSeen = (uid) => {
    setMessages((p) => {
      const updated = { ...p };
      updated[uid] = (p[uid] || []).map((m) =>
        m.sender === "You" ? { ...m, seen: true } : m
      );
      return updated;
    });
  };

  // ======================================================
  // ADD REACTION
  // ======================================================
  const addReaction = (uid, messageId, emoji) => {
    setMessages((p) => {
      const updated = { ...p };
      updated[uid] = (p[uid] || []).map((m) => {
        if (m.id === messageId) {
          const newReactions = { ...m.reactions };

          if (newReactions[emoji]) {
            // If reaction already exists, remove it
            delete newReactions[emoji];
          } else {
            // Add reaction
            newReactions[emoji] = 1;
          }
          
          return { ...m, reactions: newReactions }; 
        }
        return m;
      });
      return updated;
    });
  };

  // ======================================================
  // DELETE MESSAGE (RENAMED/SPLIT FOR CLARITY & FIX)
  // ======================================================
  const deleteMessageForMe = (uid, messageId) => {
    // Deletes message from the local chat history
    setMessages((p) => {
      const updated = { ...p };
      updated[uid] = (p[uid] || []).filter((m) => m.id !== messageId);
      return updated;
    });
  };

  const deleteMessageForAll = (uid, messageId) => {
    // Mocks the universal unsend functionality by removing it locally
    deleteMessageForMe(uid, messageId); 
  };


  // ======================================================
  // DELETE CONVERSATION
  // ======================================================
  const deleteConversation = (uid) => {
    setMessages((p) => {
        const updated = { ...p };
        delete updated[uid];
        return updated;
    });
  };

  // ======================================================
  // DISAPPEARING MESSAGES TOGGLE
  // ======================================================
  const toggleDisappearingMessages = (uid, status) => {
    setDisappearingChats(p => {
        if (p[uid] === status) {
            return p;
        }
        return { ...p, [uid]: status };
    });
  };


  // ======================================================
  // EXPOSE EVERYTHING
  // ======================================================
  return (
    <ChatContext.Provider
      value={{
        chatUser,
        updateChatUser,
        users,
        messages,
        typingMap,
        sendMessage,
        markSeen,
        deleteMessageForMe,   
        deleteMessageForAll,  
        deleteConversation,
        toggleDisappearingMessages,
        addReaction, 
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}