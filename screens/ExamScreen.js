// screens/ExamScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { styles, ACCENT } from '../styles';
import { CATEGORIES, EXAMS } from '../data/constants';
import { BackButton } from '../components/BackButton';
import { BottomNav } from '../components/BottomNav';

const NAV_TABS = [
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'questions', label: 'Questions' },
  { key: 'timers', label: 'Timers' },
];

export function ExamScreen({ route, navigation }) {
  const { categoryId } = route.params;
  const exams = EXAMS.filter((e) => e.categoryId === categoryId);
  const category = CATEGORIES.find((c) => c.id === categoryId);

  // Config state for starting tests
  const [difficulty, setDifficulty] = useState('mixed'); // 'easy' | 'medium' | 'hard' | 'mixed'
  const [questionCount, setQuestionCount] = useState(10); // 10 | 25 | 60 | 'custom'
  const [customQuestionCount, setCustomQuestionCount] = useState('');
  // Per-question timer (seconds): '60', '120', '180', 'custom', or ''
  const [questionSeconds, setQuestionSeconds] = useState('');
  const [customQuestionSeconds, setCustomQuestionSeconds] = useState('');

  // Horizontal nav overlay state (no default tab selected)
  const [activeTab, setActiveTab] = useState(null); // 'difficulty' | 'questions' | 'timers' | null
  const slideAnim = useRef(new Animated.Value(-12)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!activeTab) return;
    // Animate dropdown panel whenever a tab is activated
    slideAnim.setValue(-12);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, slideAnim, opacityAnim]);

  const handleStartExam = (examId) => {
    const num =
      questionCount === 'custom'
        ? Math.max(1, Number(customQuestionCount) || 10)
        : questionCount;

    let perQ = null;
    if (questionSeconds === 'custom') {
      // Custom seconds entered by user
      perQ = Number(customQuestionSeconds) || null;
    } else if (Number(questionSeconds) > 0) {
      // Chips already store seconds
      perQ = Number(questionSeconds);
    }

    const config = {
      difficulty,            // 'easy' | 'medium' | 'hard' | 'mixed'
      numQuestions: num,     // 10 / 25 / 60 / custom
      questionSeconds: perQ, // per-question timer (seconds) or null
      testSeconds: null,     // total test timer disabled for now
    };

    // Close overlay and start
    setActiveTab(null);
    navigation.navigate('Test', { examId, config });
  };

  // ===== Overlay content per tab =====
  const renderOverlayContent = () => {
    if (activeTab === 'difficulty') {
      return (
        <View>
          <Text style={styles.smallLabel}>Select difficulty</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {['easy', 'medium', 'hard', 'mixed'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.chip,
                  difficulty === level && styles.chipActive,
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text
                  style={[
                    styles.chipText,
                    difficulty === level && styles.chipTextActive,
                  ]}
                >
                  {level[0].toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (activeTab === 'questions') {
      return (
        <View>
          <Text style={styles.smallLabel}>How many questions?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {[10, 25, 60].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.chip,
                  questionCount === num && styles.chipActive,
                ]}
                onPress={() => {
                  setQuestionCount(num);
                  setCustomQuestionCount('');
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    questionCount === num && styles.chipTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.chip,
                questionCount === 'custom' && styles.chipActive,
              ]}
              onPress={() => setQuestionCount('custom')}
            >
              <Text
                style={[
                  styles.chipText,
                  questionCount === 'custom' && styles.chipTextActive,
                ]}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {questionCount === 'custom' && (
            <TextInput
              style={[styles.fillInput, { marginTop: 8, maxWidth: 140 }]}
              keyboardType="number-pad"
              placeholder="e.g. 30"
              placeholderTextColor="#777"
              value={customQuestionCount}
              onChangeText={setCustomQuestionCount}
            />
          )}
        </View>
      );
    }

    if (activeTab === 'timers') {
      return (
        <View>
          <Text style={styles.smallLabel}>Per-question timer</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {[1, 2, 3].map((min) => {
              const seconds = min * 60;
              const isActive = Number(questionSeconds) === seconds;
              return (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.chip,
                    isActive && styles.chipActive,
                  ]}
                  onPress={() => {
                    setQuestionSeconds(String(seconds));
                    setCustomQuestionSeconds('');
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive && styles.chipTextActive,
                    ]}
                  >
                    {min} min
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.chip,
                questionSeconds === 'custom' && styles.chipActive,
              ]}
              onPress={() => setQuestionSeconds('custom')}
            >
              <Text
                style={[
                  styles.chipText,
                  questionSeconds === 'custom' && styles.chipTextActive,
                ]}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {questionSeconds === 'custom' && (
            <TextInput
              style={[styles.fillInput, { marginTop: 8, maxWidth: 140 }]}
              keyboardType="number-pad"
              placeholder="Seconds"
              placeholderTextColor="#777"
              value={customQuestionSeconds}
              onChangeText={setCustomQuestionSeconds}
            />
          )}

          <Text style={[styles.smallLabel, { marginTop: 12, opacity: 0.7 }]}>
            If empty, there is no per-question timer.
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderHeader = () => (
  <View
    style={{
      paddingBottom: 16,
      marginHorizontal: -16, // ⬅️ cancel FlatList padding so header matches Home
    }}
  >
    <View style={styles.simpleHeader}>
      <Text style={styles.headerTitle}>
        {category?.icon} {category?.name} exams
      </Text>
      <Text style={[styles.smallLabel, { color: ACCENT }]}>
        Tap a tab to configure, then pick an exam.
      </Text>
    </View>

      {/* Horizontal navigation menu (no default selected) */}
      <View style={styles.examNavTabs}>
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.examNavTab}
              onPress={() =>
                setActiveTab((prev) => (prev === tab.key ? null : tab.key))
              }
            >
              <Text
                style={[
                  styles.examNavTabText,
                  isActive && styles.examNavTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.examNavTabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
        <Text style={[styles.smallLabel, { color: '#9CA3AF' }]}>
          Tap an exam below to start with your current settings.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1, paddingBottom: 72 }}>
        {/* Back button overlaid so it DOESN'T push the header down */}
        {categoryId ? (
          <View
            style={{
              position: 'absolute',
              top: 16,
              left: 0,
              right: 0,
              zIndex: 20,
            }}
            pointerEvents="box-none"
          >
            <BackButton navigation={navigation} />
          </View>
        ) : null}

        <FlatList
          data={exams}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.examCard}
              onPress={() => handleStartExam(item.id)}
            >
              <Text style={styles.examTitle}>{item.name}</Text>
              <Text style={styles.examDescription}>{item.description}</Text>
              <View style={styles.examMetaRow}>
                <Text style={styles.examDifficulty}>{item.difficulty}</Text>
                <Text style={styles.examStart}>Start ➜</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Overlay: dim background + sliding dropdown panel UNDER tabs */}
        {activeTab && (
          <View style={styles.examOverlayRoot} pointerEvents="box-none">
            {/* Dim only the content below the tabs */}
            <TouchableOpacity
              style={styles.examOverlayBackdrop}
              activeOpacity={1}
              onPress={() => setActiveTab(null)}
            />

            {/* Dropdown panel anchored just under the tabs */}
            <Animated.View
              style={[
                styles.examOverlayPanel,
                {
                  opacity: opacityAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {renderOverlayContent()}
            </Animated.View>
          </View>
        )}
      </View>

      <BottomNav navigation={navigation} current="Paths" />
    </SafeAreaView>
  );
}