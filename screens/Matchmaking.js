// screens/Matchmaking.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Matchmaking({ navigation }) {
  return (
    <View style={styles.screen}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={22} color="#7C3AED" />
      </TouchableOpacity>
      <Text style={styles.title}>💘 Matchmaking</Text>
      <Text style={styles.desc}>This is where you'll find new connections soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F3FF", justifyContent: "center", alignItems: "center" },
  backBtn: { position: "absolute", top: 50, left: 20 },
  title: { color: "#7C3AED", fontWeight: "800", fontSize: 24, marginBottom: 10 },
  desc: { color: "#6B7280", fontSize: 14, textAlign: "center" },
});