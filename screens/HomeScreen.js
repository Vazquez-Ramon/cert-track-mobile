// screens/HomeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  Animated,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { styles, ACCENT, MUTED } from '../styles';
import { useApp } from '../context/AppContext';
import { CATEGORIES, EXAMS } from '../data/constants';
import { BottomNav } from '../components/BottomNav';
import { MenuTile } from '../components/MenuTile';

// --- THEME CONSTANTS FOR CONSISTENCY (Matched to ChatHomeScreen.js) ---
const DARK_CARD_BG = '#020617';
const LIGHT_CARD_BG = '#ffffff';
const DARK_TEXT = '#E5E7EB'; // Light text for dark backgrounds
const DARK_MUTED_TEXT = '#94a3b8'; // Muted text for dark backgrounds
const LIGHT_TEXT = '#111'; // Dark text for light backgrounds
const LIGHT_SCREEN_BG = '#F5F3FF'; // Match ChatHomeScreen.js light background
const DARK_SCREEN_BG = '#000';

const CARD_HEIGHT = 68;
const CARD_SPACING = 8;
const ITEM_SIZE = CARD_HEIGHT + CARD_SPACING;

export function HomeScreen({ navigation }) {
  const app = useApp();

  // MAIN USER FIELDS
  const {
    username,
    xp,
    streak,
    statsByExam,

    // HOME AVATAR ONLY
    homeAvatar,
    homeAvatarUri,
  } = app;

  const unreadGlobalChatCount = app?.unreadGlobalChatCount || 0;

  // THEME / FONT / AUDIO
  const {
    theme,
    setTheme,
    audioEnabled,
    setAudioEnabled, // This is the correct setter name
    fontScale,
    setFontScale,
  } = app;

  const [localTheme, setLocalTheme] = useState(theme || 'dark');
  const [localFontScale, setLocalFontScale] = useState(fontScale || 1);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(
    typeof audioEnabled === 'boolean' ? audioEnabled : false
  );

  const isDark = (setTheme ? theme : localTheme) === 'dark';
  const effectiveFontScale = setFontScale ? fontScale || 1 : localFontScale;
  
  // FIX: Changed setSetAudioEnabled to setAudioEnabled
  const effectiveAudioEnabled = setAudioEnabled ? !!audioEnabled : localAudioEnabled; 

  // ANIMATIONS
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [xpModalVisible, setXpModalVisible] = useState(false);
  const [accuracyModalVisible, setAccuracyModalVisible] = useState(false);

  // LIST SCROLLERS
  const categoryScrollY = useRef(new Animated.Value(0)).current;
  const professionScrollY = useRef(new Animated.Value(0)).current;

  // TABS / SEARCH
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // ACCURACY ANIM
  const animatedAccuracyValue = useRef(new Animated.Value(0)).current;
  const [displayAccuracy, setDisplayAccuracy] = useState(0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [scaleAnim]);

  // STATS
  const totalQuestions = Object.values(statsByExam).reduce(
    (sum, s) => sum + s.questions,
    0,
  );
  const totalCorrect = Object.values(statsByExam).reduce(
    (sum, s) => sum + s.correct,
    0,
  );
  const accuracy = totalQuestions
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;

  const totalSegments = 12;

  const getThresholdColor = (acc) => {
    if (acc < 40) return '#DC2626';
    if (acc < 70) return '#F97316';
    if (acc < 90) return '#EAB308';
    return '#22C55E';
  };

  const thresholdColor = getThresholdColor(accuracy);

  useEffect(() => {
    Animated.timing(animatedAccuracyValue, {
      toValue: accuracy,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [accuracy]);

  useEffect(() => {
    const id = animatedAccuracyValue.addListener(({ value }) => {
      setDisplayAccuracy(Math.round(value));
    });
    return () => {
      animatedAccuracyValue.removeListener(id);
    };
  }, []);

  // ROLLODEX ANIMATION
  const getRolodexCardStyle = (scrollY, index) => {
    const inputRange = [
      (index - 1) * ITEM_SIZE,
      index * ITEM_SIZE,
      (index + 1) * ITEM_SIZE,
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const translateY = scrollY.interpolate({
      inputRange,
      outputRange: [8, 0, -8],
      extrapolate: 'clamp',
    });

    const rotateX = scrollY.interpolate({
      inputRange,
      outputRange: ['10deg', '0deg', '-10deg'],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return {
      transform: [
        { perspective: 800 },
        { translateY },
        { scale },
        { rotateX },
      ],
      opacity,
    };
  };

  // HELPERS
  const toggleTheme = () => {
    if (setTheme) setTheme(isDark ? 'light' : 'dark');
    else setLocalTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeFontScale = (delta) => {
    const current = setFontScale ? fontScale || 1 : localFontScale;
    const next = Math.min(1.4, Math.max(0.8, current + delta));

    if (setFontScale) setFontScale(next);
    else setLocalFontScale(next);
  };

  const toggleAudio = () => {
    // FIX: Changed setSetAudioEnabled to setAudioEnabled
    if (setAudioEnabled) setAudioEnabled(!effectiveAudioEnabled);
    else setLocalAudioEnabled((prev) => !prev);
  };

  const scaled = (size) => Math.round(size * effectiveFontScale);

  // FAVORITES
  const toggleFavorite = (examId) => {
    setFavorites((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId],
    );
  };

  const handleDotsPress = (exam) => {
    setSelectedExam(exam);
    setMoreMenuVisible(true);
  };

  const handleMatchPress = () => {
    Alert.alert(
      'Matchmaking (coming soon)',
      'You’ll be able to match with other learners and take tests head-to-head.'
    );
  };

  const handleStartExamFromHome = (examId) => {
    navigation.navigate('Test', {
      examId,
      config: {
        mode: 'practice',
        questionCount: 25,
        isTimed: false,
        timePerQuestion: 60,
        shuffleQuestions: true,
        shuffleAnswers: true,
      },
    });
  };

  // FILTERED SEARCH
  const baseExams =
    activeTab === 'favorites'
      ? EXAMS.filter((ex) => favorites.includes(ex.id))
      : EXAMS;

  const examsToShow = baseExams.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <SafeAreaView
      style={[styles.screen, isDark ? localStyles.darkBg : localStyles.lightBg]}
    >
      <View style={{ flex: 1, paddingBottom: 72 }}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.smallLabel, { color: ACCENT, fontSize: scaled(12) }]}>
              Welcome back,
            </Text>
            <Text style={[styles.headerTitle, { fontSize: scaled(22) }]}>
              {username || 'Champion'}
            </Text>
          </View>

          {/* RIGHT ICONS */}
          <View style={[styles.headerRight, { alignItems: 'center' }]}>
            <TouchableOpacity onPress={toggleTheme} style={localStyles.headerIcon}>
              <FontAwesome5
                name={isDark ? 'moon' : 'sun'}
                size={18}
                color={isDark ? DARK_TEXT : LIGHT_TEXT}
                solid
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleAudio} style={localStyles.headerIcon}>
              <FontAwesome5
                name={effectiveAudioEnabled ? 'volume-up' : 'volume-mute'}
                size={18}
                color={isDark ? DARK_TEXT : LIGHT_TEXT}
              />
            </TouchableOpacity>

            {/* STREAK */}
            <TouchableOpacity
              onPress={() => setAccuracyModalVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome5
                  name="fire"
                  size={12}
                  color="#FACC15"
                  style={{ marginRight: 4 }}
                  solid
                />
                <Text style={[localStyles.headerStreakText, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>
                  {streak} day streak
                </Text>
              </View>
            </TouchableOpacity>

            {/* AVATAR → goes to AccountScreen */}
            <TouchableOpacity
              style={[styles.avatarPill, { marginLeft: 8 }]}
              onPress={() => navigation.navigate('Account')}
            >
              {homeAvatarUri ? (
                <Image source={{ uri: homeAvatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmoji}>{homeAvatar}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* SEARCH + MATCH */}
        <View style={[localStyles.sectionWrapper, { marginBottom: 0 }]}>
          <View style={localStyles.searchRow}>
            <TextInput
              style={[
                localStyles.searchInput,
                {
                  fontSize: scaled(14),
                  backgroundColor: isDark ? DARK_CARD_BG : LIGHT_CARD_BG,
                  color: isDark ? DARK_TEXT : LIGHT_TEXT,
                  borderColor: isDark ? '#1F2937' : '#E5E7EB',
                  borderWidth: isDark ? 0 : 1,
                },
              ]}
              placeholder="Search exams..."
              placeholderTextColor={isDark ? DARK_MUTED_TEXT : MUTED}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={localStyles.matchBtn}
              onPress={handleMatchPress}
              activeOpacity={0.85}
            >
              <FontAwesome5
                name="user-ninja"
                size={scaled(12) + 2}
                color="#ffffff"
                style={{ marginRight: 4 }}
              />
              <Text style={[localStyles.matchBtnText, { fontSize: scaled(12) }]}>
                Match
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO CARD (Assuming this is always a gradient, no theme change needed) */}
        <Animated.View
          style={[
            styles.card,
            styles.heroCard,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.heroTitle}>Keep your edge sharp.</Text>
          <Text style={styles.heroSubtitle}>
            The world is changing. Your skills should, too.
          </Text>

          {/* XP + ACCURACY */}
          <View style={styles.heroStatsRow}>
            <TouchableOpacity
              style={[styles.heroStatTouchable, { alignItems: 'flex-start' }]}
              onPress={() => setAccuracyModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.heroStatLabel}>Accuracy</Text>
              <Text style={styles.heroStatValue}>{displayAccuracy}%</Text>
              <Text style={styles.heroStatHint}>Tap to view meter</Text>
            </TouchableOpacity>

            {/* METER */}
            <View style={styles.heroAccuracyInlineMeter}>
              {Array.from({ length: totalSegments }).map((_, idx) => {
                const start = (idx / totalSegments) * 100;
                const end = ((idx + 1) / totalSegments) * 100;

                const opacity = animatedAccuracyValue.interpolate({
                  inputRange: [start, end],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={idx}
                    style={[
                      styles.accuracyBarSegment,
                      {
                        backgroundColor: thresholdColor,
                        opacity,
                      },
                    ]}
                  />
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.heroStatTouchable, { alignItems: 'flex-end' }]}
              onPress={() => setXpModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.heroStatLabel}>XP</Text>
              <Text style={styles.heroStatValue}>{xp}</Text>
              <Text style={styles.heroStatHint}>Tap for rewards</Text>
            </TouchableOpacity>
          </View>

          {/* START TEST */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Categories')}
            activeOpacity={0.7}
            style={{ marginTop: 14, alignSelf: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  color: '#FACC15',
                  fontSize: 20,
                  fontWeight: '600',
                }}
              >
                Start a test
              </Text>
              <FontAwesome5
                name="arrow-right"
                size={20}
                color="#FACC15"
                style={{ marginLeft: 6 }}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* PLAYBOOK (MenuTile subtitles and text color likely need updating, but assuming they rely on styles.js or are handled in MenuTile component) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>Playbook</Text>

          <View style={styles.menuGrid}>
            <MenuTile
              title="Leaderboard"
              icon={
                <FontAwesome5
                  name="trophy"
                  size={20}
                  color="#FACC15"
                  solid
                />
              }
              onPress={() => navigation.navigate('Leaderboard')}
              subtitle="Compete with others"
            />

            <MenuTile
              title="Global Chat"
              icon={
                <FontAwesome5
                  name="comments"
                  size={20}
                  color="#60A5FA"
                  solid
                />
              }
              onPress={() => navigation.navigate('GlobalChat')}
              subtitle="Study with others in real time"
              badgeCount={unreadGlobalChatCount}
            />
          </View>
        </View>

        {/* EXAMS */}
        <View style={localStyles.sectionWrapper}>
          <View style={[localStyles.tabRow, { marginTop: 4, marginBottom: 2 }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              style={[
                localStyles.tabPill,
                activeTab === 'all' && localStyles.tabPillActive,
                !isDark && localStyles.tabPillLight, // Light mode tab style
              ]}
            >
              <Text
                style={[
                  localStyles.tabText,
                  activeTab === 'all' && localStyles.tabTextActive,
                  { fontSize: scaled(12) },
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('favorites')}
              style={[
                localStyles.tabPill,
                activeTab === 'favorites' && localStyles.tabPillActive,
                !isDark && localStyles.tabPillLight, // Light mode tab style
              ]}
            >
              <Text
                style={[
                  localStyles.tabText,
                  activeTab === 'favorites' && localStyles.tabTextActive,
                  { fontSize: scaled(12) },
                ]}
              >
                <FontAwesome5
                  name="star"
                  size={scaled(12)}
                  color={activeTab === 'favorites' ? '#ffffff' : DARK_MUTED_TEXT}
                  solid
                />{' '}
                Favorites
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[localStyles.sectionHeaderRow, { marginTop: 2 }]}>
            <Text style={[styles.sectionTitle, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>Exams</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Categories')}
              activeOpacity={0.7}
            >
              <Text style={localStyles.viewAllText}>view all ≫</Text>
            </TouchableOpacity>
          </View>

          <Animated.FlatList
            data={examsToShow}
            keyExtractor={(item) => item.id}
            style={{ height: ITEM_SIZE, overflow: 'hidden' }}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_SIZE}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: professionScrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const animatedStyle = getRolodexCardStyle(professionScrollY, index);
              const isFav = favorites.includes(item.id);

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleStartExamFromHome(item.id)}
                >
                  <Animated.View
                    style={[
                      localStyles.rolodexCard,
                      animatedStyle,
                      {
                        backgroundColor: isDark ? DARK_CARD_BG : LIGHT_CARD_BG,
                        shadowColor: isDark ? '#000' : '#E5E7EB',
                      },
                    ]}
                  >
                    <View style={localStyles.cardRow}>
                      <View style={localStyles.professionBadge}>
                        <Text style={localStyles.professionBadgeText}>
                          {item.difficulty?.[0]?.toUpperCase() || 'B'}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[localStyles.rolodexTitle, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>{item.name}</Text>
                        <Text style={[localStyles.rolodexSubtitle, { color: isDark ? DARK_MUTED_TEXT : MUTED }]}>{item.description}</Text>
                      </View>

                      <View style={localStyles.examRight}>
                        <TouchableOpacity
                          style={localStyles.dotsHitbox}
                          onPress={() => handleDotsPress(item)}
                        >
                          <View style={localStyles.dot} />
                          <View style={localStyles.dot} />
                          <View style={localStyles.dot} />
                        </TouchableOpacity>

                        {isFav && (
                          <FontAwesome5
                            name="star"
                            size={scaled(14)}
                            color="#EAB308"
                            solid
                            style={{ marginTop: 4 }}
                          />
                        )}
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* CATEGORIES */}
        <View style={localStyles.sectionWrapper}>
          <View style={localStyles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>Professions</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Categories')}
              activeOpacity={0.7}
            >
              <Text style={localStyles.viewAllText}>view all ≫</Text>
            </TouchableOpacity>
          </View>

          <Animated.FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            style={{ height: ITEM_SIZE, overflow: 'hidden' }}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_SIZE}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: categoryScrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const animatedStyle = getRolodexCardStyle(categoryScrollY, index);

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Exams', { categoryId: item.id })}
                >
                  <Animated.View
                    style={[
                      localStyles.rolodexCard,
                      animatedStyle,
                      {
                        backgroundColor: isDark ? DARK_CARD_BG : LIGHT_CARD_BG,
                        shadowColor: isDark ? '#000' : '#E5E7EB',
                      },
                    ]}
                  >
                    <View style={localStyles.cardRow}>
                      <Text style={[localStyles.rolodexIcon, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>{item.icon}</Text>

                      <View style={{ flex: 1 }}>
                        <Text style={[localStyles.rolodexTitle, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>{item.name}</Text>
                        <Text style={[localStyles.rolodexSubtitle, { color: isDark ? DARK_MUTED_TEXT : MUTED }]}>
                          Drill into {item.name} paths.
                        </Text>
                      </View>

                      <View style={localStyles.dotColumn}>
                        <View style={localStyles.dot} />
                        <View style={localStyles.dot} />
                        <View style={localStyles.dot} />
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* XP MODAL (Assuming styles.js handles theme for centerOverlay/infoModalCard, but applying explicit background to main card for safety) */}
        <Modal
          visible={xpModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setXpModalVisible(false)}
        >
          <View style={styles.centerOverlay}>
            <View style={[styles.infoModalCard, { backgroundColor: isDark ? DARK_CARD_BG : LIGHT_CARD_BG }]}>
              <Text style={[styles.infoModalTitle, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>XP balance</Text>
              <Text style={[styles.infoModalValue, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>{xp} XP</Text>
              <Text style={[styles.infoModalText, { color: isDark ? DARK_MUTED_TEXT : MUTED }]}>
                Earn XP by completing practice exams and keeping your streak alive.
              </Text>
              <Text style={[styles.infoModalText, { color: isDark ? DARK_MUTED_TEXT : MUTED }]}>
                Soon you'll redeem XP for perks like practice sets and streak boosts.
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 16 }]}
                onPress={() => setXpModalVisible(false)}
              >
                <Text style={styles.primaryBtnText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ACCURACY MODAL */}
        <Modal
          visible={accuracyModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAccuracyModalVisible(false)}
        >
          <View style={styles.centerOverlay}>
            <View style={[styles.infoModalCard, { backgroundColor: isDark ? DARK_CARD_BG : LIGHT_CARD_BG }]}>
              <Text style={[styles.infoModalTitle, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>Accuracy meter</Text>
              <Text style={[styles.infoModalValue, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>{displayAccuracy}%</Text>

              <View style={styles.accuracyMeterRow}>
                {Array.from({ length: totalSegments }).map((_, idx) => {
                  const start = (idx / totalSegments) * 100;
                  const end = ((idx + 1) / totalSegments) * 100;

                  const opacity = animatedAccuracyValue.interpolate({
                    inputRange: [start, end],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      key={idx}
                      style={[
                        styles.accuracyBarSegmentLarge,
                        {
                          backgroundColor: thresholdColor,
                          opacity,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              <Text style={[styles.infoModalText, { color: isDark ? DARK_MUTED_TEXT : MUTED }]}>
                Bars fill from left to right as your accuracy increases.
              </Text>
              <Text style={[styles.infoModalText, { color: isDark ? DARK_MUTED_TEXT : MUTED }]}>
                Colors shift red → orange → yellow → green as you improve.
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 16 }]}
                onPress={() => setAccuracyModalVisible(false)}
              >
                <Text style={styles.primaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 3-DOT MODAL (Context Menu) */}
        <Modal
          visible={moreMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMoreMenuVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setMoreMenuVisible(false)}>
            <View style={styles.centerOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={[localStyles.contextMenuCard, { backgroundColor: isDark ? DARK_CARD_BG : LIGHT_CARD_BG }]}>
                  <TouchableOpacity
                    style={localStyles.menuItem}
                    onPress={() => {
                      console.log('More like this:', selectedExam?.id);
                      setMoreMenuVisible(false);
                    }}
                  >
                    <Text style={[localStyles.menuItemLabel, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>More like this</Text>
                    <FontAwesome5 name="thumbs-up" size={16} color={isDark ? DARK_TEXT : LIGHT_TEXT} />
                  </TouchableOpacity>

                  <View style={[localStyles.menuDivider, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.35)' : '#E5E7EB' }]} />

                  {selectedExam && (
                    <>
                      <TouchableOpacity
                        style={localStyles.menuItem}
                        onPress={() => {
                          toggleFavorite(selectedExam.id);
                          setMoreMenuVisible(false);
                        }}
                      >
                        <Text style={[localStyles.menuItemLabel, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>
                          {favorites.includes(selectedExam.id)
                            ? 'Remove from favorites'
                            : 'Add to favorites'}
                        </Text>
                        <FontAwesome5 name="star" size={16} color="#EAB308" solid />
                      </TouchableOpacity>

                      <View style={[localStyles.menuDivider, { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.35)' : '#E5E7EB' }]} />
                    </>
                  )}

                  <TouchableOpacity
                    style={localStyles.menuItem}
                    onPress={() => {
                      console.log('Less like this:', selectedExam?.id);
                      setMoreMenuVisible(false);
                    }}
                  >
                    <Text style={[localStyles.menuItemLabel, { color: isDark ? DARK_TEXT : LIGHT_TEXT }]}>Less like this</Text>
                    <FontAwesome5 name="thumbs-down" size={16} color={isDark ? DARK_TEXT : LIGHT_TEXT} />
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

      <BottomNav navigation={navigation} current="Home" />
    </SafeAreaView>
  );
}

/* ---------- LOCAL STYLES ---------- */
const localStyles = StyleSheet.create({
  darkBg: {
    backgroundColor: DARK_SCREEN_BG,
  },
  lightBg: {
    backgroundColor: LIGHT_SCREEN_BG, // Updated to match ChatHomeScreen.js
  },

  headerIcon: {
    marginHorizontal: 4,
  },
  headerStreakText: {
    fontSize: 12,
    fontWeight: '500',
    // Color is now dynamic in JSX
  },

  sectionWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -2,
  },
  viewAllText: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: '600',
  },

  // ROLLODEX CARDS
  rolodexCard: {
    height: CARD_HEIGHT,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: CARD_SPACING,
    // backgroundColor is now dynamic in JSX
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  rolodexIcon: {
    fontSize: 24,
    marginRight: 10,
    // color is now dynamic in JSX
  },
  rolodexTitle: {
    fontSize: 14,
    fontWeight: '700',
    // color is now dynamic in JSX
  },
  rolodexSubtitle: {
    fontSize: 12,
    // color is now dynamic in JSX (using MUTED from ../styles)
    marginTop: 2,
  },
  professionBadge: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  professionBadgeText: {
    color: '#FBBF24',
    fontWeight: '800',
    fontSize: 12,
  },
  dotColumn: {
    width: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4B5563',
    marginVertical: 2,
  },

  // SEARCH & MATCH
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    // colors are now dynamic in JSX
  },
  matchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  matchBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // TABS
  tabRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 4,
    gap: 8,
    justifyContent: 'center',
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tabPillLight: {
    backgroundColor: '#E5E7EB',
  },
  tabPillActive: {
    backgroundColor: ACCENT,
  },
  tabText: {
    fontWeight: '500',
    color: DARK_MUTED_TEXT,
  },
  tabTextActive: {
    color: '#ffffff',
  },

  examRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  dotsHitbox: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CONTEXT MENU (3 dots)
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLabel: {
    fontSize: 14,
    // color is now dynamic in JSX
  },
  menuDivider: {
    height: 1,
    // color is now dynamic in JSX
    marginVertical: 2,
  },
  contextMenuCard: {
    width: '82%',
    maxWidth: 360,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    // backgroundColor is now dynamic in JSX
  },
});