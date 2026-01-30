// screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { styles } from '../styles';
import { useApp } from '../context/AppContext';

export function LoginScreen({ navigation }) {
  const { setUsername, setLastActiveDate } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState(false);
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [opacity]);

  const validateName = () => {
    if (!name.trim()) {
      setNameError(true);
      return false;
    }
    setNameError(false);
    return true;
  };

  const start = () => {
    if (!validateName()) return;
    setUsername(name.trim());
    setLastActiveDate(Date.now());   // ✅ FIXED
    navigation.replace('Home');
  };

  const continueGuest = () => {
    if (!validateName()) return;
    setUsername(name.trim());
    setLastActiveDate(Date.now());   // ✅ FIXED
    navigation.replace('Home');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.loginScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.onboardContainer, { opacity }]}>

              <Text style={styles.appTitle}>frAIah Prep</Text>
              <Text style={styles.appSubtitle}>
                Log in to track XP, streaks, and your study journey.
              </Text>

              <Text style={styles.label}>
                Display name
                {nameError && <Text style={styles.requiredAsterisk}> *</Text>}
              </Text>

              <TextInput
                style={[
                  styles.textInput,
                  nameError && { borderColor: '#f97373' },
                ]}
                placeholder="What should we call you?"
                placeholderTextColor="#777"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError(false);
                }}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              {nameError && (
                <Text style={styles.inputErrorText}>
                  Please enter a display name to continue.
                </Text>
              )}

              <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="you@example.com"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#777"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={start}>
                <Text style={styles.primaryBtnText}>Log in &amp; start 🚀</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={continueGuest}>
                <Text style={styles.secondaryBtnText}>Continue as guest</Text>
              </TouchableOpacity>

              <Text style={styles.helperText}>
                This is local-only for now. We’ll add real auth later.
              </Text>

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}