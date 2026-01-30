// components/BackButton.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles';

export function BackButton({ navigation }) {
  // Guard in case navigation is missing or canGoBack is a function
  if (!navigation || (typeof navigation.canGoBack === 'function' && !navigation.canGoBack())) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.backButton} onPress={navigation.goBack}>
      <Text style={styles.backButtonText}>← Back</Text>
    </TouchableOpacity>
  );
}