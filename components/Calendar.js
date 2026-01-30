// components/Calendar.js
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// 🧠 Optional prop: data = { '2025-11-16': { minutes: 45 }, ... }
// It will still work if you don't pass anything yet.
const SAMPLE_DATA = {
  '2025-11-01': { minutes: 15 },
  '2025-11-02': { minutes: 45 },
  '2025-11-03': { minutes: 75 },
  '2025-11-05': { minutes: 20 },
  '2025-11-10': { minutes: 30 },
  '2025-11-11': { minutes: 40 },
  '2025-11-12': { minutes: 60 },
  '2025-11-13': { minutes: 30 },
  '2025-11-14': { minutes: 20 },
};

const POSITIVE_MESSAGES = [
  '🔥 You’re on fire – keep that streak going!',
  '📚 Brain gains unlocked – nice work today.',
  '🚀 Every session is compounding your future.',
  '💡 Your future self is proud of you right now.',
  '🏆 Champions are built on days like this.',
  '🌱 Little by little, you’re becoming a beast.',
  '🧠 Neural pathways upgraded – nice study sesh.',
  '💪 Discipline > motivation. You showed up.',
  '✨ Progress, not perfection. You’re doing it.',
  '🛡 Knowledge is your armor. Keep equipping it.',
];

const REST_MESSAGES = [
  '😌 Rest is part of the grind. You’re okay.',
  '🌙 Even machines reboot. Take your time.',
  '🧘 Everyone needs a reset day sometimes.',
  '☕ You didn’t study today – but tomorrow is open.',
  '❤️ No guilt. Just a new chance on the next day.',
  '🌤 Breaks keep you sharp. Get ready to bounce back.',
  '🔄 That’s alright. Let’s get back on track soon.',
  '📆 One missed day won’t stop your journey.',
  '🤍 Be kind to yourself, then recommit.',
  '🏁 The race isn’t over – next session, you win.',
];

function formatKey(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getMonthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function daysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  // Make Monday = 0, Sunday = 6
  const day = first.getDay(); // 0–6 (Sun–Sat)
  return (day + 6) % 7;
}

function getIntensity(minutes) {
  if (!minutes || minutes <= 0) return 'none';
  if (minutes < 20) return 'light';
  if (minutes < 45) return 'medium';
  return 'heavy';
}

function pickMessage(isStudyDay, index) {
  const pool = isStudyDay ? POSITIVE_MESSAGES : REST_MESSAGES;
  return pool[index % pool.length];
}

function dayDiff(a, b) {
  const ms = a.getTime() - b.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function StudyCalendar({ data = SAMPLE_DATA }) {
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState(formatKey(new Date()));
  const [messageIndex, setMessageIndex] = useState(0);

  const todayKey = formatKey(new Date());

  const { weeks, selectedInfo, streakInfo } = useMemo(() => {
    const totalDays = daysInMonth(monthDate);
    const offset = getFirstWeekday(monthDate);

    const tempWeeks = [];
    let currentWeek = new Array(offset).fill(null);

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        day
      );
      const key = formatKey(date);
      currentWeek.push({ day, key, minutes: data[key]?.minutes || 0 });

      if (currentWeek.length === 7) {
        tempWeeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length) {
      while (currentWeek.length < 7) currentWeek.push(null);
      tempWeeks.push(currentWeek);
    }

    // 🔥 Build streaks for this month
    const studyEntries = Object.entries(data)
      .map(([key, value]) => ({
        key,
        minutes: value?.minutes || 0,
        date: new Date(key),
      }))
      .filter(
        (e) =>
          e.minutes > 0 &&
          e.date.getFullYear() === monthDate.getFullYear() &&
          e.date.getMonth() === monthDate.getMonth()
      )
      .sort((a, b) => a.date - b.date);

    const streaks = [];
    let currentStreak = null;

    for (let i = 0; i < studyEntries.length; i++) {
      const entry = studyEntries[i];
      if (!currentStreak) {
        currentStreak = {
          keys: [entry.key],
          startDate: entry.date,
          endDate: entry.date,
        };
      } else {
        const prevDate = currentStreak.endDate;
        if (dayDiff(entry.date, prevDate) === 1) {
          currentStreak.keys.push(entry.key);
          currentStreak.endDate = entry.date;
        } else {
          streaks.push({
            ...currentStreak,
            length: currentStreak.keys.length,
          });
          currentStreak = {
            keys: [entry.key],
            startDate: entry.date,
            endDate: entry.date,
          };
        }
      }
    }
    if (currentStreak) {
      streaks.push({ ...currentStreak, length: currentStreak.keys.length });
    }

    const longestStreak =
      streaks.length > 0
        ? streaks.reduce(
            (best, s) => (s.length > (best?.length || 0) ? s : best),
            null
          )
        : null;
    const currentStreakInfo = streaks.length > 0 ? streaks[streaks.length - 1] : null;

    const streakDayKeys = new Set();
    const streakStartKeys = new Set();
    const streakEndKeys = new Set();

    streaks.forEach((s) => {
      s.keys.forEach((k) => streakDayKeys.add(k));
      streakStartKeys.add(s.keys[0]);
      streakEndKeys.add(s.keys[s.keys.length - 1]);
    });

    const selectedData = data[selectedKey] || null;
    const minutes = selectedData?.minutes || 0;

    return {
      weeks: tempWeeks,
      selectedInfo: {
        key: selectedKey,
        minutes,
        isStudyDay: minutes > 0,
        intensity: getIntensity(minutes),
      },
      streakInfo: {
        streaks,
        longestStreak,
        currentStreak: currentStreakInfo,
        streakDayKeys,
        streakStartKeys,
        streakEndKeys,
      },
    };
  }, [monthDate, data, selectedKey]);

  const handlePrevMonth = () => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() - 1);
    setMonthDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(monthDate);
    d.setMonth(d.getMonth() + 1);
    setMonthDate(d);
  };

  const handleSelectDay = (cell) => {
    if (!cell) return;
    setSelectedKey(cell.key);
    setMessageIndex((prev) => prev + 1); // rotate message
  };

  const isSelected = (key) => key === selectedKey;
  const isToday = (key) => key === todayKey;

  const motivationText = pickMessage(
    selectedInfo.isStudyDay,
    messageIndex
  );

  let statusLabel = 'No study yet';
  if (selectedInfo.minutes > 0) {
    statusLabel = `Studied ${selectedInfo.minutes} min`;
  }

  const currentStreakLength = streakInfo.currentStreak?.length || 0;
  let currentStreakLabel = 'No streak yet';
  if (currentStreakLength > 0) {
    if (currentStreakLength >= 14) {
      currentStreakLabel = '2-week streak';
    } else if (currentStreakLength >= 7) {
      currentStreakLabel = '1-week streak';
    } else {
      currentStreakLabel = `${currentStreakLength}-day streak`;
    }
  }

  return (
    <View style={calendarStyles.container}>
      {/* Header */}
      <View style={calendarStyles.headerRow}>
        <TouchableOpacity onPress={handlePrevMonth} style={calendarStyles.navBtn}>
          <FontAwesome5 name="chevron-left" size={14} color="#e5e7eb" />
        </TouchableOpacity>

        <View style={calendarStyles.headerCenter}>
          <FontAwesome5 name="calendar-alt" size={14} color="#e5e7eb" style={{ marginRight: 6 }} />
          <Text style={calendarStyles.headerText}>{getMonthLabel(monthDate)}</Text>
        </View>

        <TouchableOpacity onPress={handleNextMonth} style={calendarStyles.navBtn}>
          <FontAwesome5 name="chevron-right" size={14} color="#e5e7eb" />
        </TouchableOpacity>
      </View>

      {/* Weekday labels */}
      <View style={calendarStyles.weekRow}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
          <Text key={`${d}-${index}`} style={calendarStyles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, idx) => (
        <View key={idx} style={calendarStyles.weekRow}>
          {week.map((cell, i) => {
            if (!cell) {
              return <View key={i} style={calendarStyles.dayCellEmpty} />;
            }

            const { key, day, minutes } = cell;
            const intensity = getIntensity(minutes);
            const selected = isSelected(key);
            const today = isToday(key);

            const inStreak = streakInfo.streakDayKeys.has(key);
            const isStreakStart = streakInfo.streakStartKeys.has(key);
            const isStreakEnd = streakInfo.streakEndKeys.has(key);

            let background = '#050816';
            let borderColor = 'transparent';
            let textColor = '#6b7280';

            if (intensity !== 'none') {
              background = inStreak ? '#111827' : '#0f172a';
              textColor = '#e5e7eb';
            }

            if (selected) {
              borderColor = '#facc15';
            } else if (today) {
              borderColor = '#38bdf8';
            }

            return (
              <TouchableOpacity
                key={key}
                style={[
                  calendarStyles.dayCell,
                  {
                    backgroundColor: background,
                    borderColor,
                  },
                ]}
                onPress={() => handleSelectDay(cell)}
              >
                <Text
                  style={[
                    calendarStyles.dayText,
                    { color: textColor },
                  ]}
                >
                  {day}
                </Text>

                {/* Fire icon at streak edges, dot on normal study days */}
                {isStreakStart || isStreakEnd ? (
                  <Text style={calendarStyles.fireIcon}>🔥</Text>
                ) : minutes > 0 ? (
                  <View style={calendarStyles.smallDot} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Current streak section like screenshot */}
      <View style={calendarStyles.streakCard}>
        <Text style={calendarStyles.streakTitle}>Current streak</Text>
        <Text style={calendarStyles.streakSubtitle}>{currentStreakLabel}</Text>

        <View style={calendarStyles.streakFlames}>
          {currentStreakLength > 0 ? (
            <>
              <Text style={calendarStyles.streakFlameSmall}>•</Text>
              <Text style={calendarStyles.streakFlameMid}>🔥</Text>
              <Text style={calendarStyles.streakFlameBig}>🔥</Text>
            </>
          ) : (
            <Text style={calendarStyles.streakFlameFaded}>🔥</Text>
          )}
        </View>

        <Text style={calendarStyles.motivationText}>{motivationText}</Text>
        <Text style={calendarStyles.statusText}>{statusLabel}</Text>
      </View>
    </View>
  );
}

const calendarStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    // 🔹 No horizontal margin so it matches examStatCard width from FlatList padding
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#e5e7eb',
    fontWeight: '600',
    fontSize: 14,
  },
  navBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#0b1120',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#6b7280',
  },
  dayCellEmpty: {
    flex: 1,
    height: 40,
  },
  dayCell: {
    flex: 1,
    height: 40,
    marginHorizontal: 2,
    borderRadius: 999, // pill-ish like screenshot rows
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  smallDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#f97316',
    marginTop: 3,
  },
  fireIcon: {
    fontSize: 14,
    marginTop: 2,
  },

  // Streak card (bottom, like screenshot)
  streakCard: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#020617',
    alignItems: 'center',
  },
  streakTitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 2,
  },
  streakSubtitle: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  streakFlames: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  streakFlameSmall: {
    color: '#f97316',
    fontSize: 16,
    marginBottom: 2,
  },
  streakFlameMid: {
    color: '#fb923c',
    fontSize: 22,
    marginBottom: 2,
  },
  streakFlameBig: {
    color: '#fb923c',
    fontSize: 26,
  },
  streakFlameFaded: {
    color: '#4b5563',
    fontSize: 22,
  },
  motivationText: {
    color: '#c4b5fd',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  statusText: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});