// screens/OnboardingScreen.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { styles } from '../styles.js';
import { useApp } from '../context/AppContext';
import { BackButton } from '../components/BackButton';

export function OnboardingScreen({ navigation }) {
  const { username, setUsername, registerActivity } = useApp();
  const [nameDraft, setNameDraft] = useState(username || '');
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [opacity]);

  const start = () => {
    if (nameDraft.trim()) {
      setUsername(nameDraft.trim());
    }
    registerActivity();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <BackButton navigation={navigation} />
      <Animated.View style={[styles.onboardContainer, { opacity }]}>
        <Text style={styles.appTitle}>frAIah Prep</Text>
        <Text style={styles.appSubtitle}>
          AI-powered test prep for Trades, Tech, Finance &amp; Business.
        </Text>
        <Text style={styles.label}>What should we call you?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Your name or handle"
          placeholderTextColor="#777"
          value={nameDraft}
          onChangeText={setNameDraft}
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={start}>
          <Text style={styles.primaryBtnText}>Enter the Arena ⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { marginTop: 8 }]}
          onPress={() => navigation.replace('Home')}
        >
          <Text style={styles.secondaryBtnText}>Skip for now</Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>You can change this later in your profile.</Text>
      </Animated.View>
    </SafeAreaView>
  );
}