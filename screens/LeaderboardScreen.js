// screens/LeaderboardScreen.js
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  StyleSheet,
  Image,
} from 'react-native';
import { styles, ACCENT } from '../styles';
import { useApp } from '../context/AppContext';
import { BottomNav } from '../components/BottomNav';
import { FontAwesome5 } from '@expo/vector-icons';

export function LeaderboardScreen({ navigation }) {
  const { username, xp, profile } = useApp(); // profile optional (city, state, status, avatarUri, flag, etc.)

  const [selectedUser, setSelectedUser] = useState(null);
  const [friendRequested, setFriendRequested] = useState(false);
  const [messageRequested, setMessageRequested] = useState(false);

  // Seed base users
  const base = [
    {
      name: 'Nova',
      xp: 4200,
      city: 'Seattle',
      state: 'WA',
      countryFlag: '🇺🇸',
      testsCompleted: 38,
      accuracy: 92,
      achievements: ['Early Adopter', 'Streak Master'],
      status: 'Always learning.',
      avatarUri: null,
    },
    {
      name: 'Cipher',
      xp: 3300,
      city: 'Austin',
      state: 'TX',
      countryFlag: '🇺🇸',
      testsCompleted: 27,
      accuracy: 88,
      achievements: ['Night Owl', 'Clutch Finisher'],
      status: 'Grinding late nights.',
      avatarUri: null,
    },
    {
      name: 'Volt',
      xp: 2500,
      city: 'Chicago',
      state: 'IL',
      countryFlag: '🇺🇸',
      testsCompleted: 19,
      accuracy: 81,
      achievements: ['Quick Starter'],
      status: 'On a comeback arc.',
      avatarUri: null,
    },
    {
      name: 'Echo',
      xp: 1800,
      city: 'Miami',
      state: 'FL',
      countryFlag: '🇺🇸',
      testsCompleted: 11,
      accuracy: 75,
      achievements: ['First Steps'],
      status: 'Just getting warmed up.',
      avatarUri: null,
    },
  ];

  // You
  const you = {
    name: username || 'You',
    xp,
    city: profile?.city || 'Unknown',
    state: profile?.state || '',
    countryFlag: profile?.flag || '🇺🇸',
    testsCompleted: profile?.testsCompleted || 0,
    accuracy: profile?.accuracy || 0,
    achievements: profile?.achievements || ['Getting started'],
    status: profile?.status || 'Dialed in and focused.',
    avatarUri: profile?.avatarUri || profile?.photoURL || null,
    isYou: true,
  };

  const combined = [...base, you].sort((a, b) => b.xp - a.xp);
  const ranked = combined.map((user, index) => ({
    ...user,
    rank: index + 1,
  }));

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setFriendRequested(false);
    setMessageRequested(false);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
    setFriendRequested(false);
    setMessageRequested(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1, paddingBottom: 72 }}>
        <View style={styles.simpleHeader}>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <Text style={[styles.smallLabel, { color: ACCENT }]}>
            Stay competitive with real people.
          </Text>
        </View>

        <FlatList
          data={ranked}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 24,
            marginTop: 16,
          }}
          renderItem={({ item }) => {
            const isYou = item.name === (username || 'You');

            return (
              // ⬇️ Whole pill clickable
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleOpenProfile(item)}
              >
                <View
                  style={[
                    styles.leaderRow,
                    isYou && styles.leaderRowYou,
                    isYou && { borderColor: '#FACC15', borderWidth: 1 }, // yellow border for current user
                  ]}
                >
                  {/* Rank */}
                  <Text style={styles.leaderRank}>{item.rank}</Text>

                  {/* Avatar / profile picture */}
                  {item.avatarUri ? (
                    <Image
                      source={{ uri: item.avatarUri }}
                      style={localStyles.avatarImage}
                    />
                  ) : (
                    <View style={localStyles.avatarCircle}>
                      <Text style={localStyles.avatarInitial}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {/* Name (blue link style, but row tap also works) */}
                  <Text style={localStyles.leaderNameLink}>
                    {isYou ? `${item.name} (you)` : item.name}
                  </Text>

                  {/* Country flag */}
                  <Text style={localStyles.flagEmoji}>
                    {item.countryFlag || '🏳️'}
                  </Text>

                  {/* XP */}
                  <Text style={styles.leaderXP}>{item.xp} XP</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Profile Modal */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
        onRequestClose={handleCloseProfile}
      >
        {/* Tap outside to close */}
        <TouchableWithoutFeedback onPress={handleCloseProfile}>
          <View style={localStyles.overlay}>
            {/* Inner card: taps here should NOT close */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={localStyles.profileCard}>
                {selectedUser && (
                  <>
                    <View style={localStyles.profileHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Modal avatar */}
                        {selectedUser.avatarUri ? (
                          <Image
                            source={{ uri: selectedUser.avatarUri }}
                            style={localStyles.modalAvatarImage}
                          />
                        ) : (
                          <View style={localStyles.modalAvatarCircle}>
                            <Text style={localStyles.modalAvatarInitial}>
                              {selectedUser.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}

                        <View style={{ marginLeft: 10 }}>
                          <Text style={localStyles.profileName}>
                            {selectedUser.name}
                            {selectedUser.isYou ? ' (you)' : ''}
                          </Text>
                          <Text style={localStyles.profileLocation}>
                            {selectedUser.city}
                            {selectedUser.state ? `, ${selectedUser.state}` : ''}
                          </Text>
                          {selectedUser.status ? (
                            <Text style={localStyles.profileStatus}>
                              "{selectedUser.status}"
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={localStyles.profileXPBubble}>
                        <Text style={localStyles.profileXPLabel}>XP</Text>
                        <Text style={localStyles.profileXPValue}>
                          {selectedUser.xp}
                        </Text>
                      </View>
                    </View>

                    <View style={localStyles.statsRow}>
                      <View style={localStyles.statBox}>
                        <Text style={localStyles.statLabel}>Tests</Text>
                        <Text style={localStyles.statValue}>
                          {selectedUser.testsCompleted ?? 0}
                        </Text>
                      </View>
                      <View style={localStyles.statBox}>
                        <Text style={localStyles.statLabel}>Accuracy</Text>
                        <Text style={localStyles.statValue}>
                          {selectedUser.accuracy ?? 0}%
                        </Text>
                      </View>
                    </View>

                    {Array.isArray(selectedUser.achievements) &&
                      selectedUser.achievements.length > 0 && (
                        <View style={localStyles.achievementsSection}>
                          <Text style={localStyles.sectionTitle}>
                            Achievements
                          </Text>
                          <View style={localStyles.achievementPillsRow}>
                            {selectedUser.achievements.map((ach, idx) => (
                              <View
                                key={idx}
                                style={localStyles.achievementPill}
                              >
                                <FontAwesome5
                                  name="medal"
                                  size={10}
                                  style={{ marginRight: 6, color: '#FFD700' }}
                                />
                                <Text style={localStyles.achievementText}>
                                  {ach}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                    {/* Actions row */}
                    {!selectedUser.isYou && (
                      <View style={localStyles.actionsRow}>
                        <TouchableOpacity
                          style={[
                            localStyles.actionButton,
                            friendRequested && localStyles.actionButtonDisabled,
                          ]}
                          onPress={() => setFriendRequested(true)}
                          disabled={friendRequested}
                        >
                          <FontAwesome5
                            name={friendRequested ? 'user-check' : 'user-plus'}
                            size={14}
                            style={localStyles.actionIcon}
                          />
                          <Text style={localStyles.actionText}>
                            {friendRequested ? 'Request sent' : 'Add'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            localStyles.actionButton,
                            messageRequested &&
                              localStyles.actionButtonDisabled,
                          ]}
                          onPress={() => setMessageRequested(true)}
                          disabled={messageRequested}
                        >
                          <FontAwesome5
                            name="comment-dots"
                            size={14}
                            style={localStyles.actionIcon}
                          />
                          <Text style={localStyles.actionText}>
                            {messageRequested
                              ? 'Pending acceptance'
                              : 'Message'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={localStyles.actionButton}
                          onPress={() => {
                            // later: share profile link / deep link
                          }}
                        >
                          <FontAwesome5
                            name="share-alt"
                            size={14}
                            style={localStyles.actionIcon}
                          />
                          <Text style={localStyles.actionText}>Share</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {selectedUser.isYou && (
                      <Text style={localStyles.selfInfoHint}>
                        This is how others will see your profile once you share
                        your city, state & status in your account settings and
                        add a profile picture.
                      </Text>
                    )}

                    <TouchableOpacity
                      style={localStyles.closeButton}
                      onPress={handleCloseProfile}
                      activeOpacity={0.8}
                    >
                      <Text style={localStyles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <BottomNav navigation={navigation} current="Home" />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  // ROW AVATAR / NAME / FLAG
  leaderNameLink: {
    fontSize: 15,
    fontWeight: '400',
    color: '#3B82F6', // blue
    marginRight: 8,
  },
  flagEmoji: {
    fontSize: 16,
    marginRight: 4,
  },

  // MODAL
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  profileCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  modalAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarInitial: {
    color: '#E5E7EB',
    fontSize: 18,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  profileLocation: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  profileStatus: {
    fontSize: 12,
    color: '#FBBF24',
    marginTop: 4,
  },
  profileXPBubble: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#FACC15',
    alignItems: 'center',
    minWidth: 70,
  },
  profileXPLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  profileXPValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FACC15',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 10,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E5E7EB',
    marginTop: 2,
  },
  achievementsSection: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  achievementPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  achievementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#0f172a',
  },
  achievementText: {
    fontSize: 11,
    color: '#E5E7EB',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingVertical: 8,
    marginHorizontal: 3,
    backgroundColor: '#020617',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    marginRight: 6,
    color: '#E5E7EB',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  selfInfoHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 12,
  },
  closeButton: {
    marginTop: 14,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
});