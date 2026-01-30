// components/BuzzButton.js
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, Animated, Vibration, StyleSheet } from 'react-native';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useChat } from '../chat/ChatContext';
import { ACCENT, FG } from '../styles';

export function BuzzButton({ onPress }) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const glowStyle = {
    shadowColor: '#A855F7',
    shadowOpacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.8] }),
    shadowRadius: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 10] }),
    shadowOffset: { width: 0, height: 0 },
  };

  const handleBuzz = () => {
    Vibration.vibrate(150);
    onPress && onPress();
  };

  return (
    <Animated.View style={[styles.glow, glowStyle]}>
      <TouchableOpacity style={styles.btn} onPress={handleBuzz} activeOpacity={0.7}>
        <Text style={styles.text}>⚡</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    backgroundColor: '#1E1B4B',
    borderRadius: 999,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  text: {
    color: FG,
    fontSize: 18,
    fontWeight: '700',
  },
});