// components/SplashScreen.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, Animated } from 'react-native';
import { styles } from '../styles';

export function SplashScreen({ message }) {
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [glowAnim]);

  const scale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const opacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.splashContainer}>
        <Animated.View
          style={[
            styles.splashLogoWrapper,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <Image
            source={require('../assets/icon.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.splashText}>frAIah Prep</Text>
        {message ? <Text style={styles.splashSubText}>{message}</Text> : null}
      </View>
    </SafeAreaView>
  );
}