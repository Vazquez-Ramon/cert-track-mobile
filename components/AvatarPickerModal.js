// components/AvatarPickerModal.js
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";

const EMOJIS = [
  "😀","😁","😂","🤣","😊","😎","😍","😭","😡","😈","😴","🤯","🙃",
  "🐱","🐶","🐼","🐵","🦊","🦁","🐸",
  "🔥","💀","⭐","⚡","❤️","💬","🎉"
];

export default function AvatarPickerModal({
  visible,
  onClose,
  avatar,
  avatarUri,
  setAvatar,
  setAvatarUri,
}) {

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setAvatarUri(result.assets[0].uri);
      setAvatar(null);
      onClose();
    }
  };

  const handleRemove = () => {
    setAvatarUri(null);
    setAvatar("😀");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={70} tint="dark" style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Choose Avatar</Text>

          {/* Upload */}
          <TouchableOpacity style={styles.actionBtn} onPress={handlePickImage}>
            <Text style={styles.actionText}>📷 Upload Image</Text>
          </TouchableOpacity>

          {/* Emoji grid */}
          <ScrollView horizontal contentContainerStyle={styles.emojiRow}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                onPress={() => {
                  setAvatar(e);
                  setAvatarUri(null);
                  onClose();
                }}
              >
                <Text style={styles.emoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Remove */}
          {avatarUri || avatar ? (
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
              <Text style={styles.removeText}>Remove Avatar</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={onClose} style={styles.closeArea}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#0f0f0f",
    borderRadius: 18,
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    textAlign: "center",
  },
  actionBtn: {
    backgroundColor: "#1f1f1f",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  actionText: {
    color: "#A78BFA",
    fontWeight: "600",
    textAlign: "center",
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    paddingVertical: 6,
  },
  emoji: {
    fontSize: 34,
    marginHorizontal: 6,
  },
  removeBtn: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#3f3f3f",
  },
  removeText: {
    color: "#EF4444",
    fontWeight: "600",
    textAlign: "center",
  },
  closeArea: { marginTop: 16 },
  closeText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
  },
});