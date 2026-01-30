// components/BottomNav.js
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles as appStyles, ACCENT, MUTED } from '../styles';

export function BottomNav({ navigation, current }) {
  const items = [
    { key: 'Home', label: 'Home', icon: 'home', route: 'Home' },
    { key: 'Paths', label: 'Paths', icon: 'th-large', route: 'Categories' },
    { key: 'Stats', label: 'Stats', icon: 'chart-bar', route: 'Stats' },
    // 🔹 Chat tab goes to ChatHomeScreen
    { key: 'Chat', label: 'Chat', icon: 'comments', route: 'Chat' },
  ];

  return (
    <View style={appStyles.bottomNav}>
      {items.map((item) => {
        const isActive = current === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={appStyles.bottomNavItem}
            onPress={() => navigation.navigate(item.route)}
          >
            <FontAwesome5
              name={item.icon}
              size={24}
              color={isActive ? ACCENT : '#9CA3AF'}
              style={{ marginBottom: 2 }}
            />
            <Text
              style={[
                appStyles.bottomNavLabel,
                { color: isActive ? ACCENT : MUTED },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}