// components/PresenceDropdown.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useChat } from '../chat/ChatContext';
import { ACCENT, FG, BG, MUTED } from '../styles';

const options = [
  { label: '🟢 Online', value: 'online', color: '#22C55E' },
  { label: '🟡 Away', value: 'away', color: '#FACC15' },
  { label: '🔴 Busy', value: 'busy', color: '#EF4444' },
  { label: '🟣 Do Not Disturb', value: 'dnd', color: '#A855F7' },
  { label: '⚫ Offline', value: 'offline', color: '#6B7280' },
];

export function PresenceDropdown() {
  const { chatUser } = useChat();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(chatUser?.presence || 'online');
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [open]);

  const handleSelect = async (value) => {
    setSelected(value);
    setOpen(false);
    if (chatUser?.uid) {
      await updateDoc(doc(db, 'users', chatUser.uid), {
        presence: value,
        lastActive: serverTimestamp(),
      });
    }
  };

  const current = options.find((o) => o.value === selected);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.current, { borderColor: current?.color }]}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.7}
      >
        <Text style={styles.currentText}>{current?.label}</Text>
      </TouchableOpacity>

      {open && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              transform: [{ scaleY: scaleAnim }],
              opacity: scaleAnim,
            },
          ]}
        >
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={styles.option}
              onPress={() => handleSelect(opt.value)}
            >
              <Text style={[styles.optionText, { color: opt.color }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 50 },
  current: {
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#0F172A',
  },
  currentText: {
    color: FG,
    fontSize: 13,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 34,
    right: 0,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 8,
    paddingVertical: 6,
    shadowColor: '#A855F7',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});