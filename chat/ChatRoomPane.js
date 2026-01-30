// chat/ChatRoomPane.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { useChat } from './ChatContext';
import { BG, CARD, FG, MUTED, ACCENT } from '../styles';

export const ChatRoomPane = ({ roomId }) => {
  const { chatUser } = useChat();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(data);
      if (listRef.current && data.length > 0)
        setTimeout(() => listRef.current.scrollToEnd({ animated: true }), 50);
    });
    return unsub;
  }, [roomId]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      text,
      senderId: chatUser.uid,
      senderName: chatUser.displayName,
      createdAt: serverTimestamp(),
    });
    setInput('');
  }, [input, chatUser, roomId]);

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === chatUser.uid;
    const usernameColor = isMe ? ACCENT : '#FBBF24';
    return (
      <View style={styles.messageRow}>
        <Text style={[styles.username, { color: usernameColor }]}>
          {item.senderName || 'User'}:
        </Text>
        <Text style={styles.messageText}> {item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.chatPane}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContent}
        />
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={MUTED}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  chatPane: { flex: 1, backgroundColor: '#020617' },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  messageRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  username: { fontWeight: '700', fontSize: 13 },
  messageText: { fontSize: 13, color: FG },
  inputBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#111827',
    backgroundColor: CARD,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 80,
    borderRadius: 999,
    backgroundColor: '#020617',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: FG,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  sendBtn: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: ACCENT,
  },
  sendBtnText: { color: FG, fontSize: 13, fontWeight: '600' },
});