// screens/ResultsScreen.js
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { EXAMS } from '../data/constants';
import { BackButton } from '../components/BackButton';
import { BottomNav } from '../components/BottomNav';

export function ResultsScreen({ route, navigation }) {
  const { examId, total, correct } = route.params;
  const exam = EXAMS.find((e) => e.id === examId);

  const score = total ? Math.round((correct / total) * 100) : 0;
  const passed = score >= 70;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1, paddingBottom: 72 }}>
        <BackButton navigation={navigation} />
        <View style={styles.simpleHeader}>
          <Text style={styles.headerTitle}>Results</Text>
          <Text style={styles.smallLabel}>{exam?.name}</Text>
        </View>

        <View style={[styles.card, styles.resultsCard]}>
          <Text style={styles.resultsScore}>{score}%</Text>
          <Text style={styles.resultsSub}>
            {correct} / {total} correct
          </Text>
          <Text style={styles.resultsVerdict}>
            {passed
              ? 'Nice work. You’re on track. 💪'
              : 'Good reps. Review & re-attack. 🔁'}
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.replace('Home')}
          >
            <Text style={styles.primaryBtnText}>Back to home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.replace('Test', { examId })}
          >
            <Text style={styles.secondaryBtnText}>Retake this exam</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BottomNav navigation={navigation} current="Paths" />
    </SafeAreaView>
  );
}