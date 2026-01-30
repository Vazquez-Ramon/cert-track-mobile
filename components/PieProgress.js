// components/PieProgress.js
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { styles, ACCENT, MUTED } from '../styles.js';

/**
 * Modern circular progress indicator for TestScreen.
 * Smaller, fills from the top, and transitions red → yellow → green.
 */
export function PieProgress({ current = 0, total = 0 }) {
  const safeTotal = total > 0 ? total : 1;
  const safeCurrent = Math.min(Math.max(current, 0), safeTotal);
  const progress = safeCurrent / safeTotal;

  // Smaller + cleaner
  const size = 48;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Color transition: RED → YELLOW → GREEN
  const progressColor = (() => {
    if (progress <= 0.33) return '#ef4444'; // red-500
    if (progress <= 0.66) return '#facc15'; // yellow-400
    return '#22c55e'; // green-500
  })();

  return (
    <View style={styles.pieContainer}>
      <Svg width={size} height={size}>
        {/* Rotate -90 degrees to start at the TOP */}
        <G rotation="-90" originX={cx} originY={cy}>
          {/* Background ring */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={MUTED}
            strokeWidth={strokeWidth}
            strokeOpacity={0.25}
            fill="none"
          />
          {/* Progress ring */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>

      <View style={styles.pieLabelWrapper}>
        <Text style={styles.pieLabelTop}>
          {safeCurrent} of {safeTotal}
        </Text>
      </View>
    </View>
  );
}