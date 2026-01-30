// =============================================================
// 🌐 GlobalChatScreen — EXACT LIGHT THEME MATCH (FINAL VERSION)
// Matches your uploaded UI pixel-for-pixel
// =============================================================

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";

import { useChat } from "../chat/ChatContext";

export function GlobalChatScreen({ navigation }) {
  const { chatUser, globalMessages, sendGlobalMessage, globalTyping } = useChat();

  const [text, setText] = useState("");
  const flatListRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 140);
  }, [globalMessages, globalTyping]);

  // SEND
  const handleSend = () => {
    if (!text.trim()) return;
    sendGlobalMessage(text.trim());
    setText("");
  };

  // MESSAGE BUBBLE
  const renderMessage = ({ item }) => {
    const isMe = item.sender === chatUser.displayName;

    return (
      <View
        style={[
          styles.msgRow,
          { justifyContent: isMe ? "flex-end" : "flex-start" },
        ]}
      >
        {!isMe && (
          <Image
            source={{ uri: item.avatar }}
            style={styles.msgAvatar}
          />
        )}

        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
          ]}
        >
          <Text style={[styles.msgText, isMe ? styles.msgMeText : styles.msgOtherText]}>
            {item.text}
          </Text>

          <Text style={styles.msgTime}>{item.time}</Text>
        </View>

        {isMe && (
          <Image
            source={{ uri: chatUser.avatar }}
            style={styles.msgAvatar}
          />
        )}
      </View>
    );
  };

  // TYPING INDICATOR (above input)
  const typingBubble = () =>
    globalTyping ? (
      <View style={styles.typingContainer}>
        <Image
          source={{ uri: globalTyping.avatar }}
          style={[styles.msgAvatar, { width: 28, height: 28 }]}
        />
        <View style={styles.typingBubble}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    ) : null;

  // HEADER
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <FontAwesome5 name="arrow-left" size={20} color="#7C3AED" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Global Chat</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={globalMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />

      {typingBubble()}

      {/* INPUT BAR */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inputRow}
      >
        <View style={styles.inputBox}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message the world..."
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
        </View>

        <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
          <FontAwesome5 name="paper-plane" size={18} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =============================================================
   STYLES — EXACT AESTHETIC MATCH
============================================================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F8FF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginLeft: 14,
  },

  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },

  msgAvatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    marginHorizontal: 6,
  },

  bubble: {
    maxWidth: "70%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  bubbleMe: {
    backgroundColor: "#7C3AED",
    borderBottomRightRadius: 2,
  },

  bubbleOther: {
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 2,
  },

  msgText: {
    fontSize: 14,
  },

  msgMeText: {
    color: "#fff",
    fontWeight: "500",
  },

  msgOtherText: {
    color: "#111",
  },

  msgTime: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },

  // TYPING
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingBottom: 10,
  },

  typingBubble: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6B7280",
    marginHorizontal: 3,
  },

  // INPUT
  inputRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },

  inputBox: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  input: {
    fontSize: 14,
    color: "#111",
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#7C3AED",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});