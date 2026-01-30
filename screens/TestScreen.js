// screens/TestScreen.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView, // ⬅️ added for scrollable explanation
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles, ACCENT } from '../styles';
import { useApp } from '../context/AppContext';
import { CATEGORIES, EXAMS, QUESTION_BANK } from '../data/constants';
import { BackButton } from '../components/BackButton';
import { BottomNav } from '../components/BottomNav';
import { PieProgress } from '../components/PieProgress';
import { FraiahInlineChat } from '../components/FraiahInlineChat';

function normalizeString(str) {
  return (str || '').trim().toLowerCase();
}

function arraysEqualAsSets(a = [], b = []) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  for (const v of setA) {
    if (!setB.has(v)) return false;
  }
  return true;
}

// Format seconds as a digital MM:SS timer
function formatSeconds(sec) {
  if (sec == null || isNaN(sec)) return '--:--';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return `${mm}:${ss}`;
}

// Fisher–Yates shuffle
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function TestScreen({ route, navigation }) {
  const { examId, config } = route.params;
  const { recordExamResult } = useApp();
  const exam = EXAMS.find((e) => e.id === examId);
  const category = CATEGORIES.find((c) => c.id === exam?.categoryId);

  // Default fallback config
  const defaultConfig = {
    difficulty: 'mixed',
    numQuestions: 10,
    questionSeconds: null, // per-question timer
    testSeconds: null, // (not used yet)
  };

  const activeConfig = { ...defaultConfig, ...(config || {}) };
  const { difficulty, numQuestions } = activeConfig;

  // Questions kept in state so we can shuffle once per test run
  const [questions, setQuestions] = useState([]);

  // Build & shuffle questions when test starts (or exam/config changes)
  useEffect(() => {
    // Load full bank for this exam
    let fullQuestions = QUESTION_BANK[examId] || [];

    // Difficulty filtering (only if questions have a difficulty field)
    if (difficulty && difficulty !== 'mixed') {
      const filtered = fullQuestions.filter((q) => {
        if (!q.difficulty) return false;
        return q.difficulty === difficulty;
      });
      if (filtered.length > 0) {
        fullQuestions = filtered;
      }
    }

    // Shuffle the full list
    const shuffled = shuffleArray(fullQuestions);

    // Take the first N from the shuffled list
    const selected = shuffled.slice(0, numQuestions || shuffled.length);

    setQuestions(selected);
  }, [examId, difficulty, numQuestions]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fraiahVisible, setFraiahVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // ORIGINAL option index
  const [selectedMulti, setSelectedMulti] = useState([]); // ORIGINAL indices
  const [fillValue, setFillValue] = useState('');
  const [optionOrderMap, setOptionOrderMap] = useState({}); // per-question shuffled order
  const [secondsLeft, setSecondsLeft] = useState(
    activeConfig.questionSeconds || null
  );

  // Instant feedback state
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [showExplanation, setShowExplanation] = useState(false);

  const current = questions[index];
  const currentType = current?.type || 'single';

  const currentAnswer = current ? answers[current.id] : undefined;
  let isCurrentAnswered = false;

  if (current) {
    if (currentType === 'fill') {
      const val =
        typeof currentAnswer === 'string' && currentAnswer !== undefined
          ? currentAnswer
          : fillValue;
      isCurrentAnswered = !!normalizeString(val);
    } else if (currentType === 'multi') {
      const arr = Array.isArray(currentAnswer) ? currentAnswer : selectedMulti;
      isCurrentAnswered = Array.isArray(arr) && arr.length > 0;
    } else {
      const val =
        typeof currentAnswer === 'number' && currentAnswer !== undefined
          ? currentAnswer
          : selectedOption;
      isCurrentAnswered = typeof val === 'number';
    }
  }

  // When question changes, restore selection & feedback from saved answers
  useEffect(() => {
    if (!current) return;
    const saved = answers[current.id];

    // Figure out feedback if we already have an answer for this question
    if (currentType === 'single') {
      if (typeof saved === 'number') {
        const correctIndex =
          typeof current.correctIndex === 'number' ? current.correctIndex : null;
        if (correctIndex !== null) {
          if (saved === correctIndex) {
            setFeedback('correct');
            setShowExplanation(false);
          } else {
            setFeedback('incorrect');
            setShowExplanation(true);
          }
        } else {
          setFeedback(null);
          setShowExplanation(false);
        }
      } else {
        setFeedback(null);
        setShowExplanation(false);
      }
    } else {
      setFeedback(null);
      setShowExplanation(false);
    }

    if (currentType === 'single') {
      setSelectedOption(typeof saved === 'number' ? saved : null);
      setSelectedMulti([]);
      setFillValue('');
    } else if (currentType === 'multi') {
      setSelectedMulti(Array.isArray(saved) ? saved : []);
      setSelectedOption(null);
      setFillValue('');
    } else if (currentType === 'fill') {
      setFillValue(typeof saved === 'string' ? saved : '');
      setSelectedOption(null);
      setSelectedMulti([]);
    }
  }, [index, current, currentType, answers]);

  // Create a random option order per question (only once per question per test run)
  useEffect(() => {
    if (!current || !current.options) return;

    setOptionOrderMap((prev) => {
      if (prev[current.id]) return prev; // already have an order for this question

      const idxs = current.options.map((_, i) => i);

      // Fisher–Yates shuffle
      for (let i = idxs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
      }

      return { ...prev, [current.id]: idxs };
    });
  }, [current]);

  // Reset per-question timer whenever index changes
  useEffect(() => {
    if (!activeConfig.questionSeconds) {
      setSecondsLeft(null);
      return;
    }
    setSecondsLeft(activeConfig.questionSeconds);
  }, [index, activeConfig.questionSeconds]);

  // Helper: grade exam and go to Results
  const finishExam = () => {
    const total = questions.length;
    let correct = 0;

    questions.forEach((q) => {
      const qType = q.type || 'single';
      const userAnswer = answers[q.id];

      if (qType === 'multi') {
        const correctIndices = q.correctIndices || [];
        if (arraysEqualAsSets(userAnswer || [], correctIndices)) {
          correct++;
        }
      } else if (qType === 'fill') {
        const userStr = normalizeString(userAnswer);
        if (!userStr) return;
        if (Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0) {
          const found = q.correctAnswers.some(
            (ans) => normalizeString(ans) === userStr
          );
          if (found) correct++;
        } else if (q.correctAnswer) {
          if (normalizeString(q.correctAnswer) === userStr) {
            correct++;
          }
        }
      } else {
        const correctIndex =
          typeof q.correctIndex === 'number' ? q.correctIndex : null;
        if (correctIndex !== null && userAnswer === correctIndex) {
          correct++;
        }
      }
    });

    // Unanswered questions are just counted as incorrect (no increment)
    recordExamResult(examId, total, correct);
    navigation.replace('Results', { examId, total, correct });
  };

  // Auto-advance when timer hits 0 (if a timer is set)
  const handleTimeout = () => {
    if (!questions.length) return;

    if (index + 1 < questions.length) {
      // Go to next question even if unanswered (counts as wrong)
      setIndex((prev) => Math.min(prev + 1, questions.length - 1));
    } else {
      // Last question: finish exam
      finishExam();
    }
  };

  // Tick down visually and trigger auto-next at 0
  useEffect(() => {
    if (!activeConfig.questionSeconds) return;
    if (secondsLeft === null) return;

    if (secondsLeft <= 0) {
      handleTimeout();
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, activeConfig.questionSeconds]);

  // SINGLE-SELECT: instant feedback
  const handleSingleSelect = (origIndex) => {
    if (!current) return;

    // If feedback already given for this question, don't let them change it
    if (feedback) return;

    const correctIndex =
      typeof current.correctIndex === 'number' ? current.correctIndex : null;

    // store the ORIGINAL option index so grading matches correctIndex
    setSelectedOption(origIndex);
    setAnswers((prev) => ({ ...prev, [current.id]: origIndex }));

    if (correctIndex !== null && origIndex === correctIndex) {
      // ✅ Correct: highlight green and auto-next
      setFeedback('correct');
      setShowExplanation(false);

      setTimeout(() => {
        if (!questions.length) return;
        if (index + 1 < questions.length) {
          setIndex((prev) => Math.min(prev + 1, questions.length - 1));
        } else {
          finishExam();
        }
      }, 600); // small pause so they see green
    } else {
      // ❌ Wrong: highlight red and show explanation panel
      setFeedback('incorrect');
      setShowExplanation(true);
    }
  };

  const handleMultiToggle = (origIndex) => {
    if (!current) return;
    setSelectedMulti((prev) => {
      const exists = prev.includes(origIndex);
      const next = exists
        ? prev.filter((i) => i !== origIndex)
        : [...prev, origIndex];
      setAnswers((old) => ({ ...old, [current.id]: next }));
      return next;
    });
  };

  const handleFillChange = (text) => {
    if (!current) return;
    setFillValue(text);
    setAnswers((prev) => ({ ...prev, [current.id]: text }));
  };

  // Only go back between questions; no leaving test here
  const goBackQuestion = () => {
    if (!questions.length) return;
    if (index > 0) {
      setIndex(index - 1);
    }
    // If index === 0, do nothing. Back button is hidden on Q1.
  };

  const next = () => {
    if (!questions.length) return;

    if (index + 1 < questions.length) {
      // User-driven "Next" still requires an answer
      if (!isCurrentAnswered) return;
      setIndex(index + 1);
    } else {
      // Last question → require answer, then finish
      if (!isCurrentAnswered) return;
      finishExam();
    }
  };

  const renderOptions = () => {
    if (!current) return null;

    if (currentType === 'fill') {
      return (
        <View style={{ marginTop: 16 }}>
          <TextInput
            style={styles.fillInput}
            placeholder="Type your answer here..."
            placeholderTextColor="#777"
            value={fillValue}
            onChangeText={handleFillChange}
          />

          {current.wordBank && current.wordBank.length > 0 && (
            <View style={styles.wordBankRow}>
              {current.wordBank.map((word, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.wordBankChip}
                  onPress={() => handleFillChange(word)}
                >
                  <Text style={styles.wordBankText}>{word}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    }

    // Use shuffled order for non-fill questions
    const order =
      optionOrderMap[current.id] ||
      (current.options ? current.options.map((_, i) => i) : []);

    const correctIndex =
      typeof current.correctIndex === 'number' ? current.correctIndex : null;

    return (
      <View style={{ marginTop: 16 }}>
        {order.map((origIdx, displayIdx) => {
          const opt = current.options[origIdx];
          const isSingle = currentType === 'single';

          // We store ORIGINAL indices in selectedOption/selectedMulti
          const isSelected = isSingle
            ? selectedOption === origIdx
            : selectedMulti.includes(origIdx);

          const baseStyles = [styles.optionBtn];
          if (isSelected) baseStyles.push(styles.optionBtnSelected);

          // Feedback coloring for SINGLE choice only
          if (currentType === 'single' && feedback === 'correct' && isSelected) {
            baseStyles.push({
              borderColor: '#22c55e',
              backgroundColor: '#064e3b',
            });
          }
          if (
            currentType === 'single' &&
            feedback === 'incorrect' &&
            isSelected
          ) {
            baseStyles.push({
              borderColor: '#ef4444',
              backgroundColor: '#7f1d1d',
            });
          }

          return (
            <TouchableOpacity
              key={origIdx}
              style={baseStyles}
              onPress={() =>
                currentType === 'single'
                  ? handleSingleSelect(origIdx)
                  : handleMultiToggle(origIdx)
              }
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {currentType === 'multi'
                  ? `${isSelected ? '☑' : '☐'} `
                  : `${String.fromCharCode(65 + displayIdx)}. `}
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // NO QUESTIONS BRANCH (still has BackButton)
  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={{ flex: 1, paddingBottom: 72 }}>
          <BackButton navigation={navigation} />

          <View style={styles.simpleHeader}>
            <Text style={styles.headerTitle}>{exam?.name || 'Test'}</Text>
            <Text style={styles.smallLabel}>
              No questions loaded yet for this exam. Add a JSON file and reload
              the app.
            </Text>
          </View>

          <View style={[styles.card, { marginTop: 24 }]}>
            <Text style={styles.helperText}>
              For this exam (id:{' '}
              <Text style={{ color: ACCENT }}>{examId}</Text>) you can create a
              JSON file and hook it into QUESTION_BANK in data/constants.js.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 16 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryBtnText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
        <BottomNav navigation={navigation} current="Paths" />
      </SafeAreaView>
    );
  }

  // MAIN TEST UI
  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1, paddingBottom: 72 }}>
        {/* 🚫 No top BackButton while test is running */}

        {/* Header with pie + timer pinned top-right */}
        <View style={[styles.testHeader, { position: 'relative' }]}>
          {/* Left side: exam title and helper text, padded so it doesn't run under the pie */}
          <View style={{ paddingRight: 96 }}>
            <Text style={styles.smallLabel}>
              {category ? `${category.icon} ${category.name} exam` : 'Exam'}
            </Text>
            <Text style={styles.headerTitle}>{exam?.name}</Text>

            {currentType === 'multi' && (
              <Text style={[styles.smallLabel, { marginTop: 4 }]}>
                Select <Text style={{ color: ACCENT }}>all</Text> that apply.
              </Text>
            )}
            {currentType === 'fill' && (
              <Text style={[styles.smallLabel, { marginTop: 4 }]}>
                Type the best word or phrase in the blank.
              </Text>
            )}
          </View>

          {/* Right side: absolute, top-right */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 16,
              alignItems: 'flex-end',
            }}
          >
            {activeConfig.questionSeconds && (
              <View
                style={{
                  backgroundColor: '#020617',
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  marginBottom: 6,
                  borderWidth: 1,
                  borderColor: '#1f2937',
                }}
              >
                <Text
                  style={{
                    color:
                      secondsLeft !== null && secondsLeft <= 10
                        ? '#f97373'
                        : '#e5e7eb',
                    fontSize: 13,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  ⏱ {formatSeconds(secondsLeft)}
                </Text>
              </View>
            )}
            <PieProgress current={index + 1} total={questions.length} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.questionTopic}>{current?.topic}</Text>
          <Text style={styles.questionText}>{current?.text}</Text>
          {renderOptions()}

          {/* Scrollable explanation box with rounded corners */}
          {showExplanation && (
            <View
              style={{
                marginTop: 16,
                maxHeight: 160, // keeps it from taking over the whole screen
                borderRadius: 12,
                backgroundColor: '#111827',
                borderWidth: 1,
                borderColor: '#4b5563',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
                <Text
                  style={{
                    color: '#e5e7eb',
                    fontWeight: '600',
                    marginBottom: 4,
                  }}
                >
                  Explanation
                </Text>
              </View>

              {/* Scrollable body */}
              <ScrollView
                style={{ paddingHorizontal: 12, paddingBottom: 12 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {(() => {
                  // If this isn't a standard single-choice question, or we don't have options,
                  // fall back to the raw explanation text.
                  if (
                    currentType !== 'single' ||
                    !current ||
                    !Array.isArray(current.options) ||
                    current.options.length === 0
                  ) {
                    return (
                      <Text style={{ color: '#d1d5db', fontSize: 13 }}>
                        {current?.explanation ||
                          'Review this concept to understand why this answer is incorrect.'}
                      </Text>
                    );
                  }

                  // Use the shuffled order for this question, or identity if not yet set
                  const order =
                    optionOrderMap[current.id] ||
                    current.options.map((_, i) => i);

                  const correctIndex =
                    typeof current.correctIndex === 'number'
                      ? current.correctIndex
                      : null;

                  // Parse your existing explanation string, written like:
                  // 🟢 C) "Pulmonary veins carry oxygenated blood" — ...
                  // 🔴 A) "Blood in the right atrium..." — ...
                  const explanationMap = {};
                  const raw = current.explanation || '';

                  if (raw && typeof raw === 'string') {
                    const blocks = raw.split(/\n\s*\n/); // split on blank lines

                    blocks.forEach((block) => {
                      const trimmed = block.trim();
                      if (!trimmed) return;

                      // Extract the quoted option text and explanation body after the dash
                      const match = trimmed.match(/"([^"]+)"\s*—\s*([\s\S]*)/);
                      if (!match) return;

                      const optText = match[1].trim();
                      const body = match[2].trim();

                      const origIdx = current.options.findIndex(
                        (opt) => opt === optText
                      );
                      if (origIdx !== -1) {
                        explanationMap[origIdx] = body;
                      }
                    });
                  }

                  // If we couldn't map any blocks back to options, just show raw explanation.
                  if (Object.keys(explanationMap).length === 0) {
                    return (
                      <Text style={{ color: '#d1d5db', fontSize: 13 }}>
                        {current.explanation ||
                          'Review this concept to understand why this answer is incorrect.'}
                      </Text>
                    );
                  }

                  // Helper: map ORIGINAL option index to its current letter (A, B, C, ...)
                  const getLetterForOrigIndex = (origIdx) => {
                    const displayIdx = order.indexOf(origIdx);
                    if (displayIdx === -1) return '?';
                    return String.fromCharCode(65 + displayIdx); // 65 = 'A'
                  };

                  // 🟢 Correct answer block first
                  const correctBlock =
                    correctIndex !== null &&
                    current.options[correctIndex] !== undefined ? (
                      <Text
                        key={`correct-${correctIndex}`}
                        style={{
                          color: '#bbf7d0',
                          fontSize: 13,
                          marginBottom: 8,
                        }}
                      >
                        🟢 {getLetterForOrigIndex(correctIndex)}. "
                        {current.options[correctIndex]}" is{' '}
                        {explanationMap[correctIndex] ||
                          'this option best matches the requirements in the question.'}
                      </Text>
                    ) : null;

                  // 🔴 Wrong options, in the CURRENT mixed order
                  const wrongBlocks = order
                    .filter((origIdx) => origIdx !== correctIndex)
                    .map((origIdx) => (
                      <Text
                        key={`wrong-${origIdx}`}
                        style={{
                          color: '#fecaca',
                          fontSize: 13,
                          marginBottom: 6,
                        }}
                      >
                        🔴 {getLetterForOrigIndex(origIdx)}. "
                        {current.options[origIdx]}" is{' '}
                        {explanationMap[origIdx] ||
                          'it does not fully satisfy the scenario described in the question.'}
                      </Text>
                    ));

                  return (
                    <>
                      {correctBlock}
                      {wrongBlocks}
                    </>
                  );
                })()}
              </ScrollView>
            </View>
          )}

          {/* Nav row directly under test box */}
          <View style={localStyles.navRow}>
            {/* Left half: Back or spacer */}
            {index > 0 ? (
              <TouchableOpacity
                style={[styles.secondaryBtnSmall, localStyles.halfBtn]}
                onPress={goBackQuestion}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5 name="arrow-left" size={16} color="#fff" />
                  <Text style={styles.secondaryBtnSmallText}>Back</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={localStyles.halfBtn} />
            )}

            {/* Right half: Next / Finish */}
            <TouchableOpacity
              style={[
                styles.primaryBtnSmall,
                localStyles.halfBtn,
                !isCurrentAnswered && styles.primaryBtnSmallDisabled,
              ]}
              onPress={next}
              disabled={!isCurrentAnswered}
            >
              {index + 1 === questions.length ? (
                <Text style={styles.primaryBtnText}>Finish</Text>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={styles.primaryBtnText}>Next</Text>
                  <FontAwesome5 name="arrow-right" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Ask Fraiah button under nav row but still in card */}
          {!fraiahVisible && (
            <TouchableOpacity
              style={[styles.fraiahBtn, { marginTop: 16 }]}
              onPress={() => setFraiahVisible(true)}
            >
              <Image
                source={require('../assets/icon.png')}
                style={styles.fraiahIcon}
                resizeMode="contain"
              />
              <Text style={styles.fraiahText}>Ask Fraiah</Text>
            </TouchableOpacity>
          )}
        </View>

        <FraiahInlineChat
          visible={fraiahVisible}
          question={current}
          onClose={() => setFraiahVisible(false)}
        />
      </View>

      <BottomNav navigation={navigation} current="Paths" />
    </SafeAreaView>
  );
}

const localStyles = {
  navRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  halfBtn: {
    flex: 1,
  },
};