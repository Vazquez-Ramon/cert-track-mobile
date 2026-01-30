// screens/CategoryScreen.js
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styles, ACCENT } from '../styles';
import { CATEGORIES } from '../data/constants';
import { BottomNav } from '../components/BottomNav';

export function CategoryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1, paddingBottom: 72 }}>
        {/* 🔹 No BackButton here – user hasn't chosen a lane yet */}
        <View style={styles.simpleHeader}>
          <Text style={styles.headerTitle}>Choose your lane</Text>
          <Text style={[styles.smallLabel, { color: ACCENT }]}>
          Pick a category to see available tests.
          </Text>
        </View>

        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
            marginTop: 16,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryCard}
              onPress={() =>
                navigation.navigate('Exams', { categoryId: item.id })
              }
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.categoryTitle}>{item.name}</Text>
                <Text style={styles.categorySubtitle}>
                  Targeted tests to level up in {item.name}.
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <BottomNav navigation={navigation} current="Paths" />
    </SafeAreaView>
  );
}