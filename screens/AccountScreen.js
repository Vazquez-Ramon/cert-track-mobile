// =============================================================
// 👤 AccountScreen.js — Profile & Settings
// Updated to:
//   ✔ Use ONLY homeAvatar & homeAvatarUri (AppContext)
//   ✔ Keep avatar separate from Chat
//   ✔ Clean gallery upload
//   ✔ Fixed modal (same style as accuracy modal / chat modal)
// =============================================================

import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { styles, FG, ACCENT } from "../styles";
import { useApp } from "../context/AppContext";
import { BottomNav } from "../components/BottomNav";

export function AccountScreen({ navigation }) {
  const {
    username,
    setUsername,
    xp,

    // HOME AVATAR controls
    homeAvatar,
    setHomeAvatar,
    homeAvatarUri,
    setHomeAvatarUri,

    logout,
    resetChat,        // clear chat history (from ChatContext via AppContext)
    setStatsByExam,
    setStreak,
    setLastActiveDate,
  } = useApp();

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameDraft, setNameDraft] = useState(username || "");

  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // ------------------------------------------------------------
  // PICK IMAGE FROM GALLERY
  // ------------------------------------------------------------
  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to set an avatar."
      );
      return;
    }

    const img = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!img.canceled && img.assets?.length > 0) {
      setHomeAvatarUri(img.assets[0].uri);
      setAvatarModalVisible(false);
    }
  };

  // ------------------------------------------------------------
  // RESET AVATAR
  // ------------------------------------------------------------
  const resetAvatar = () => {
    setHomeAvatar("😀");
    setHomeAvatarUri(null);
    setAvatarModalVisible(false);
  };

  // ------------------------------------------------------------
  // SAVE NAME
  // ------------------------------------------------------------
  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;

    setUsername(trimmed);
    setNameModalVisible(false);
  };

  // ------------------------------------------------------------
  // RESET STATS
  // ------------------------------------------------------------
  const handleResetStats = () => {
    Alert.alert(
      "Reset stats?",
      "This will clear your exam stats and streak. XP will not be affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setStatsByExam({});
            setStreak(1);
            setLastActiveDate(null);
          },
        },
      ]
    );
  };

  // ------------------------------------------------------------
  // CLEAR CHAT HISTORY
  // ------------------------------------------------------------
  const clearHistory = () => {
    Alert.alert(
      "Clear chat history?",
      "This only clears local chat history on your device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => resetChat(),
        },
      ]
    );
  };

  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------
  const doLogout = () => {
    logout();
    navigation.replace("Login");
  };

  // ------------------------------------------------------------
  // AVATAR MODAL UI (same style as chatHomeScreen modal)
  // ------------------------------------------------------------
  const renderAvatarModal = () => (
    <Modal
      visible={avatarModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setAvatarModalVisible(false)}
    >
      <View style={local.modalOverlay}>
        <View style={local.modalCard}>
          <Text style={local.modalTitle}>Profile Picture</Text>

          {/* GALLERY */}
          <TouchableOpacity style={local.optionBtn} onPress={pickAvatar}>
            <FontAwesome5 name="images" size={18} color={ACCENT} />
            <Text style={local.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>

          {/* RESET */}
          <TouchableOpacity style={local.optionBtn} onPress={resetAvatar}>
            <FontAwesome5 name="undo" size={18} color="#DC2626" />
            <Text style={[local.optionText, { color: "#DC2626" }]}>
              Reset to Default
            </Text>
          </TouchableOpacity>

          {/* CANCEL */}
          <TouchableOpacity
            onPress={() => setAvatarModalVisible(false)}
            style={local.closeBtn}
          >
            <Text style={local.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ------------------------------------------------------------
  // RETURN
  // ------------------------------------------------------------
  return (
    <SafeAreaView style={styles.screen}>
      <View style={{ flex: 1, paddingBottom: 72 }}>
        {/* Header */}
        <View style={styles.simpleHeader}>
          <Text style={styles.headerTitle}>Account</Text>
          <Text style={styles.smallLabel}>Customize your profile & rewards.</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.card, { alignItems: "center" }]}>
          {/* Avatar */}
          <TouchableOpacity
            style={styles.accountAvatarWrapper}
            onPress={() => setAvatarModalVisible(true)}
          >
            {homeAvatarUri ? (
              <Image
                source={{ uri: homeAvatarUri }}
                style={styles.accountAvatarImage}
              />
            ) : (
              <>
                <Text style={styles.accountAvatarEmoji}>{homeAvatar}</Text>
                <View style={styles.accountAvatarUploadBadge}>
                  <FontAwesome5 name="upload" size={12} color={FG} />
                </View>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.accountName}>{username || "You"}</Text>
          <Text style={styles.accountXP}>{xp} XP available</Text>

          {/* Rewards */}
          <View style={[styles.card, styles.rewardsCard]}>
            <Text style={styles.sectionTitle}>Rewards</Text>
            <Text style={styles.helperText}>
              Soon you'll be able to redeem XP for perks like streak boosts,
              extra practice sets, and more.
            </Text>
          </View>

          {/* Settings */}
          <View style={[styles.card, styles.settingsCard]}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => {
                setNameDraft(username || "");
                setNameModalVisible(true);
              }}
            >
              <View>
                <Text style={styles.settingsRowLabel}>Change display name</Text>
                <Text style={styles.settingsRowDescription}>
                  Update how your name appears across the app.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsRow}
              onPress={() => setAvatarModalVisible(true)}
            >
              <View>
                <Text style={styles.settingsRowLabel}>Change avatar</Text>
                <Text style={styles.settingsRowDescription}>
                  Choose a new profile picture.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow} onPress={clearHistory}>
              <View>
                <Text style={styles.settingsRowLabel}>Clear chat history</Text>
                <Text style={styles.settingsRowDescription}>
                  Removes your local chat messages.
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsRow} onPress={handleResetStats}>
              <View>
                <Text style={[styles.settingsRowLabel, { color: "#F97373" }]}>
                  Reset stats & streak
                </Text>
                <Text style={styles.settingsRowDescription}>
                  Clears exam stats. XP is not affected.
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={doLogout}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <FontAwesome5 name="sign-out-alt" size={16} color="#EF4444" />
            <Text
              style={{
                color: "#EF4444",
                fontWeight: "600",
                fontSize: 14,
                marginLeft: 8,
              }}
            >
              Log out
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Change Name Modal */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.centerOverlay}>
          <View style={styles.infoModalCard}>
            <Text style={styles.infoModalTitle}>Change display name</Text>

            <TextInput
              style={[styles.textInput, { marginTop: 12 }]}
              placeholder="Your name"
              placeholderTextColor="#777"
              value={nameDraft}
              onChangeText={setNameDraft}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 16 }]}
              onPress={saveName}
            >
              <Text style={styles.primaryBtnText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { marginTop: 8 }]}
              onPress={() => setNameModalVisible(false)}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderAvatarModal()}

      <BottomNav navigation={navigation} current="Home" />
    </SafeAreaView>
  );
}

/* =============================================================
   LOCAL MODAL STYLES
============================================================= */

const local = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    color: ACCENT,
  },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
  },
  closeText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#374151",
  },
});