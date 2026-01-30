// screens/StatsScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles, ACCENT } from '../styles';
import { useApp } from '../context/AppContext';
import { EXAMS } from '../data/constants';
import StudyCalendar from '../components/Calendar';
import { BottomNav } from '../components/BottomNav';

function getBadge(accuracy) {
  if (accuracy >= 90) {
    return { label: 'Legend', description: 'You are crushing it. Exam ready.', color: '#22c55e' };
  }
  if (accuracy >= 75) {
    return { label: 'Expert', description: 'Strong performance. Keep refining.', color: '#3b82f6' };
  }
  if (accuracy >= 50) {
    return { label: 'Rising', description: 'Good base. Focus on weak spots.', color: '#eab308' };
  }
  if (accuracy > 0) {
    return { label: 'Warming up', description: 'Great start. Keep drilling.', color: '#f97316' };
  }
  return { label: 'No data yet', description: 'Take a test to unlock stats.', color: '#6b7280' };
}

const MAX_STARS = 5;

export function StatsScreen({ navigation }) {
  const { statsByExam } = useApp();

  const examStats = Object.entries(statsByExam).map(([examId, stat]) => ({
    examId,
    stat,
    exam: EXAMS.find((e) => e.id === examId),
  }));

  // Overall aggregates
  const totalQuestions = examStats.reduce((sum, e) => sum + e.stat.questions, 0);
  const totalCorrect = examStats.reduce((sum, e) => sum + e.stat.correct, 0);
  const totalAttempts = examStats.reduce((sum, e) => sum + e.stat.attempts, 0);

  // null = all exams, or a specific examId
  const [selectedExamId, setSelectedExamId] = useState(null);

  const selectedExam = selectedExamId
    ? examStats.find((e) => e.examId === selectedExamId)
    : null;

  // Values for the currently selected scope
  const displayQuestions = selectedExam ? selectedExam.stat.questions : totalQuestions;
  const displayCorrect = selectedExam ? selectedExam.stat.correct : totalCorrect;
  const displayIncorrect = Math.max(displayQuestions - displayCorrect, 0);
  const displayAccuracy = displayQuestions
    ? Math.round((displayCorrect / displayQuestions) * 100)
    : 0;
  const displayAttempts = selectedExam ? selectedExam.stat.attempts : totalAttempts;
  const displayLabel = selectedExam
    ? (selectedExam.exam?.name || selectedExam.examId)
    : 'All exams';

  const badge = getBadge(displayAccuracy);

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;       // drives bar + percent
  const [animatedPercent, setAnimatedPercent] = useState(0);        // displayed % text

  // Per-star animations (for pop-in / fill timing)
  const starAnims = useRef(
    Array.from({ length: MAX_STARS }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    progressAnim.setValue(0);
    setAnimatedPercent(0);
    starAnims.forEach((v) => v.setValue(0));

    const listenerId = progressAnim.addListener(({ value }) => {
      setAnimatedPercent(Math.round(value));
    });

    // Animate bar + % 0 → accuracy
    Animated.timing(progressAnim, {
      toValue: displayAccuracy,
      duration: 900,
      useNativeDriver: false,
    }).start();

    // Animate stars one-by-one (pop in)
    Animated.stagger(
      120,
      starAnims.map((v) =>
        Animated.spring(v, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        })
      )
    ).start();

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, [displayAccuracy, progressAnim, starAnims, selectedExamId]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // 5-star rating with quarter steps, based on animatedPercent (0 → target)
  const starScore = (animatedPercent / 100) * MAX_STARS; // 0–5

  const renderStars = () => (
    <View style={localStyles.starsRow}>
      {Array.from({ length: MAX_STARS }).map((_, idx) => {
        const rawFill = starScore - idx;                 // how much of THIS star is filled
        const clamped = Math.max(0, Math.min(1, rawFill)); // 0–1

        // Snap to 0, 0.25, 0.5, 0.75, 1 to get quarter/half/3/4/full
        let step = 0;
        if (clamped >= 0.875) step = 1;
        else if (clamped >= 0.625) step = 0.75;
        else if (clamped >= 0.375) step = 0.5;
        else if (clamped >= 0.125) step = 0.25;

        const scale = starAnims[idx].interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        });
        const opacity = starAnims[idx];

        return (
          <View key={idx} style={localStyles.starShell}>
            <Animated.View style={{ transform: [{ scale }], opacity }}>
              {/* Empty star base */}
              <Text style={localStyles.starEmptyText}>★</Text>

              {/* Filled overlay, width shows how much of the star is lit up */}
              {step > 0 && (
                <View
                  style={[
                    localStyles.starFillMask,
                    { width: `${step * 100}%` },
                  ]}
                >
                  <Text style={localStyles.starFilledText}>★</Text>
                </View>
              )}
            </Animated.View>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1, paddingBottom: 72 }}>
        {/* Header matches GlobalChatScreen spacing/placement */}
        <View style={styles.simpleHeader}>
          <Text style={styles.headerTitle}>Your Stats</Text>
          <Text style={[styles.smallLabel, { color: ACCENT }]}>
            Know where you dominate and where to drill more.
          </Text>
        </View>

        <FlatList
          data={examStats}
          keyExtractor={(item) => item.examId}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
            paddingTop: 16, // align with GlobalChatScreen
          }}
          // Header: main stats card + "By exam" label
          ListHeaderComponent={
            <>
              {/* MAIN CARD – same width as By exam cards, tap to reset to All exams */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSelectedExamId(null)}
              >
                <View style={[styles.examStatCard, localStyles.mainCard]}>
                  {/* Top row: label + scope + animated stars */}
                  <View style={localStyles.rowHeader}>
                    <View>
                      <Text style={styles.heroStatLabel}>Accuracy</Text>
                      <Text style={localStyles.scopeLabel}>{displayLabel}</Text>
                    </View>

                    {renderStars()}
                  </View>

                  {/* Percent + badge inline */}
                  <View style={localStyles.percentRow}>
                    <Text style={styles.resultsScore}>{animatedPercent}%</Text>
                    <View
                      style={[
                        localStyles.badgePill,
                        localStyles.badgePillInline,
                        { backgroundColor: badge.color },
                      ]}
                    >
                      <Text style={localStyles.badgeText}>{badge.label}</Text>
                    </View>
                  </View>

                  {/* Badge description under the row */}
                  <Text style={localStyles.badgeDescription}>
                    {badge.description}
                  </Text>

                  {/* Gradient bar */}
                  <View style={localStyles.progressWrapper}>
                    <View style={localStyles.progressBackground}>
                      <Animated.View
                        style={[localStyles.progressFill, { width: animatedWidth }]}
                      >
                        <LinearGradient
                          colors={['#ff3b30', '#ff9500', '#ffcc00', '#34c759']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={localStyles.gradientFill}
                        />
                      </Animated.View>
                    </View>
                  </View>

                  {/* Totals row: Questions (left) + Total tests (right) */}
                  <View style={localStyles.statsRow}>
                    {/* Questions block — shifted left by 2px */}
                    <View
                      style={[
                        localStyles.statColumn,
                        { transform: [{ translateX: -10 }] },
                      ]}
                    >
                      <Text style={styles.heroStatLabel}>Questions answered</Text>
                      <Text style={styles.heroStatValue}>{displayQuestions}</Text>
                      <Text style={[styles.smallLabel, { marginTop: 4 }]}>
                        Correct: {displayCorrect} • Incorrect: {displayIncorrect}
                      </Text>
                    </View>

                    {/* Tests block */}
                    <View style={[localStyles.statColumn, { marginLeft: 16 }]}>
                      <Text style={styles.heroStatLabel}>Total tests</Text>
                      <Text style={styles.heroStatValue}>{displayAttempts}</Text>
                      <Text style={[styles.smallLabel, { marginTop: 4 }]}>
                        Attempted: {displayAttempts} • Completed: {displayAttempts}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* By-exam header text */}
              {examStats.length ? (
                <Text style={styles.sectionTitle}>By exam</Text>
              ) : (
                <Text style={styles.helperText}>
                  Take a test to start building stats.
                </Text>
              )}
            </>
          }
          renderItem={({ item }) => {
            const acc = item.stat.questions
              ? Math.round((item.stat.correct / item.stat.questions) * 100)
              : 0;
            const isSelected = selectedExamId === item.examId;
            const incorrect = Math.max(
              (item.stat.questions || 0) - (item.stat.correct || 0),
              0
            );

            return (
              <TouchableOpacity
                onPress={() =>
                  setSelectedExamId(isSelected ? null : item.examId)
                }
              >
                <View
                  style={[
                    styles.examStatCard,
                    isSelected && localStyles.examCardActive,
                  ]}
                >
                  <Text style={styles.examTitle}>
                    {item.exam?.name || item.examId}
                  </Text>
                  <Text style={styles.examDescription}>
                    Accuracy: {acc}% • Total tests: {displayAttempts}
                  </Text>
                  {/* If you ever want per-exam incorrect visible:
                      <Text style={styles.smallLabel}>
                        Correct: {item.stat.correct} • Incorrect: {incorrect}
                      </Text>
                  */}
                </View>
              </TouchableOpacity>
            );
          }}
          // Footer: calendar at the bottom (width aligned via paddingHorizontal)
          ListFooterComponent={
            <View style={{ marginTop: 8 }}>
              <StudyCalendar />
            </View>
          }
        />
      </View>

      <BottomNav navigation={navigation} current="Stats" />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  /* --- Main card extra --- */
  mainCard: {
    marginBottom: 12,
  },

  /* --- Stars / scope --- */
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scopeLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Stars row
  starsRow: {
    flexDirection: 'row',
  },
  starShell: {
    width: 28,
    height: 28,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  starEmptyText: {
    fontSize: 24,
    color: '#334155',
    fontWeight: '900',
  },
  starFilledText: {
    fontSize: 24,
    color: '#ffd60a',
    fontWeight: '900',
  },
  starFillMask: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  /* --- Percent + badge row --- */
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 2,
  },

  /* --- Main Progress Bar --- */
  progressWrapper: {
    marginTop: 4,
    marginBottom: 12,
  },
  progressBackground: {
    height: 12,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
  },

  /* --- Badge --- */
  badgeRow: {
    marginTop: 4,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 2,
  },
  // tweak for inline usage (no self-align left)
  badgePillInline: {
    alignSelf: 'auto',
    marginBottom: 0,
    marginLeft: 8,
  },
  badgeText: {
    color: '#0b1220',
    fontWeight: '700',
    fontSize: 12,
  },
  badgeDescription: {
    color: '#9ca3af',
    fontSize: 12,
  },

  /* --- Totals row --- */
  statsRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 6,
  },
  // Center each stat block by default
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },

  /* --- Selected exam card highlight --- */
  examCardActive: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
});