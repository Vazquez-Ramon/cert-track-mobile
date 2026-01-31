// components/MenuTile.js
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { styles } from '../styles';

export function MenuTile({ title, subtitle, icon, onPress, badgeCount }) {
  // show badge whenever a badgeCount is passed in (even 0),
  // so the red bubble is always visible for Global Chat when wired up
  const hasBadge = badgeCount !== undefined && badgeCount !== null;

  // ✅ Always render badge as a STRING to avoid RN text node issues
  const badgeText =
    typeof badgeCount === 'number'
      ? badgeCount > 9
        ? '9+'
        : String(badgeCount)
      : '•';

  return (
    <TouchableOpacity
      style={[styles.menuTile, { position: 'relative' }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {hasBadge && (
        <View
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            paddingHorizontal: 4,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 10,
              fontWeight: '700',
            }}
          >
            {badgeText}
          </Text>
        </View>
      )}

      {icon ? <Text style={styles.menuIcon}>{icon}</Text> : null}
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}