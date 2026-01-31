// components/FraiahInlineChat.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { styles } from '../styles';

/* -----------------------------
   Helpers for Fraiah responses
------------------------------*/

function getQuestionAnswerSummary(question) {
  if (!question) return 'No question loaded.';

  const type = question.type || 'single';

  if (type === 'fill') {
    if (Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0) {
      return `Correct answer(s): ${question.correctAnswers.join(', ')}.`;
    }
    if (question.correctAnswer) {
      return `Correct answer: ${question.correctAnswer}.`;
    }
    return 'There is a fill-in answer, but it is not configured.';
  }

  if (type === 'multi') {
    if (!Array.isArray(question.correctIndices) || !question.options) {
      return 'This is a multi-select question but the correct options are not fully configured.';
    }
    const parts = question.correctIndices.map((idx) => {
      const letter = String.fromCharCode(65 + idx);
      const text = question.options[idx] ?? '';
      return `${letter}. ${text}`;
    });
    return `Correct option(s): ${parts.join(' | ')}.`;
  }

  // single choice
  if (
    typeof question.correctIndex === 'number' &&
    question.options &&
    question.options[question.correctIndex]
  ) {
    const letter = String.fromCharCode(65 + question.correctIndex);
    return `Correct answer: ${letter}. ${question.options[question.correctIndex]}.`;
  }

  return 'The correct answer is not fully configured.';
}

function generateFraiahResponse(question, userMessage) {
  const baseIntro = question
    ? `Let’s break down this question:\n\n"${question.text}"`
    : 'Ask me anything about your test or career path.';

  const answerSummary = question ? `\n\n${getQuestionAnswerSummary(question)}` : '';
  const explanation = question?.explanation
    ? `\n\nReason: ${question.explanation}`
    : '';

  const coaching =
    '\n\nFocus on understanding the pattern, not just this one answer. Every question is a rep. 💪';

  return baseIntro + answerSummary + explanation + coaching;
}

/* -----------------------------
   Inline Fraiah Chat Component
------------------------------*/

export function FraiahInlineChat({ visible, question, onClose }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    {
      id: 'f1',
      from: 'bot',
      text: 'Hey, I’m Fraiah 🔮 Your tiny GPT study buddy. What are you stuck on?',
    },
  ]);

  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    if (!visible) {
      // reset when closing
      setInput('');
      setHistory([
        {
          id: 'f1',
          from: 'bot',
          text: 'Hey, I’m Fraiah 🔮 Your tiny GPT study buddy. What are you stuck on?',
        },
      ]);
    }
  }, [visible, slideAnim]);

  const send = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setHistory((h) => [...h, { id: `u-${Date.now()}`, from: 'user', text: userText }]);
    setInput('');
    const botText = generateFraiahResponse(question, userText);
    setTimeout(() => {
      setHistory((h) => [...h, { id: `b-${Date.now()}`, from: 'bot', text: botText }]);
    }, 400);
  };

  const containerStyle = {
    maxHeight: slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 260],
    }),
    opacity: slideAnim,
    overflow: 'hidden',
  };

  return (
    <Animated.View style={[styles.fraiahInlineContainer, containerStyle]}>
      <View style={[styles.fraiahInlineHeader, { paddingHorizontal: 12, paddingTop: 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.fraiahIcon}
            resizeMode="contain"
          />
          <Text style={styles.fraiahInlineTitle}>Ask Fraiah</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.fraiahInlineClose}>✕</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.fraiahInlineMessages}
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.chatBubble,
              item.from === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot,
            ]}
          >
            <Text style={styles.chatBubbleText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={[styles.fraiahInlineInputRow, { paddingHorizontal: 12 }]}>
        <TextInput
          style={styles.fraiahInlineInput}
          placeholder="Ask Fraiah anything..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.fraiahInlineSendBtn} onPress={send}>
          <Text style={styles.fraiahInlineSendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
