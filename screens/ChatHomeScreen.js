// =============================================================
// 💬 ChatHomeScreen — FINAL VERSION (Fixed Status Wrapper Size)
// =============================================================

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    StatusBar,
    // Add ScrollView for modal content if it gets too long
    ScrollView,
}
from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useApp } from "../context/AppContext";
import { useChat } from "../chat/ChatContext";
import { ACCENT, MUTED } from "../styles";

// 🌟 MODIFIED: Added "offline" status to match contact card logic.
const STATUS_PRESETS = [
    { key: "online", label: "Available (Online)", color: "#22C55E", icon: "circle" },
    { key: "busy", label: "DND (Busy)", color: "#EF4444", icon: "minus-circle" },
    { key: "away", label: "BRB (Away)", color: "#FACC15", icon: "clock" },
    { key: "offline", label: "Offline (Last Seen)", color: "#6B7280", icon: "circle" },
];

// 🌟 MODIFIED: Removed "dnd" key
const ONLINE_STATUSES = ["online", "busy", "away"];

const STATUS_MESSAGE_PRESETS = [
    "Working hard 💪",
    "Out to lunch 🍔",
    "Gaming 🎮",
    "At the gym 🏃‍♀️",
    "Currently in a meeting 💼",
];

// 🌟 REMOVED: presetAvatars array

export function ChatHomeScreen({ navigation }) {
    const app = useApp();
    const { users, chatUser, updateChatUser } = useChat();
    const isDark = app?.theme === "dark";

    const [presence, setPresence] = useState("online");
    const [statusMessage, setStatusMessage] = useState("");
    // 🌟 MODIFIED: Renamed to control the main settings modal (Avatar + Presence only)
    const [avatarAndPresenceModalVisible, setAvatarAndPresenceModalVisible] = useState(false);
    // 🌟 NEW: State to control the status message dropdown visibility
    const [showStatusMessageDropdown, setShowStatusMessageDropdown] = useState(false);
    const [sessionPresets, setSessionPresets] = useState([]);
    const [tab, setTab] = useState("contacts");
    const [rooms, setRooms] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [search, setSearch] = useState("");

    // 🌟 ADDED: State for contact long press options modal
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [selectedContactForOptions, setSelectedContactForOptions] = useState(null);
    
    useEffect(() => {
        (async () => {
            const roomData = await AsyncStorage.getItem("chat_rooms");
            if (roomData) setRooms(JSON.parse(roomData));
        })();
    }, []);

    const createRoom = async () => {
        if (!newRoomName.trim()) return;
        const updated = [...rooms, { id: Date.now().toString(), name: newRoomName }];
        setRooms(updated);
        await AsyncStorage.setItem("chat_rooms", JSON.stringify(updated));
        setNewRoomName("");
        setModalVisible(false);
    };

    // CAMERA
    const pickFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            alert("Camera permission required.");
            return;
        }

        const img = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!img.canceled) {
            updateChatUser({ avatar: img.assets[0].uri });
            // Close the combined modal after selection
            setAvatarAndPresenceModalVisible(false);
        }
    };

    // GALLERY
    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Gallery permission required.");
            return;
        }

        const img = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!img.canceled) {
            updateChatUser({ avatar: img.assets[0].uri });
            // Close the combined modal after selection
            setAvatarAndPresenceModalVisible(false);
        }
    };

    // 🌟 REMOVED: choosePresetAvatar function
    
    const handleSetPresence = (key) => {
        setPresence(key);
        setAvatarAndPresenceModalVisible(false); // Close modal after setting
    }

    // Determines the icon, color, and whether to use the white background wrapper
    const getDotIcon = (p) => {
        // 🌟 MODIFIED: Set a consistent icon size
        const iconSize = 12;

        // 🌟 NEW: Determine if a white background wrapper is needed
        let useWrapper = true;
        let icon, color;

        // Default/Offline case (Last Seen)
        if (!ONLINE_STATUSES.includes(p)) {
            // Offline: Ban in Grey + White Background (useWrapper = true)
            icon = "circle";
            color = "#6B7280";
            useWrapper = true;
        } else {
            // Online Statuses
            switch (p) {
                case "online":
                    // Online: Green circle + NO White Background
                    icon = "circle";
                    color = "#22C55E";
                    useWrapper = false; // NO white background
                    break;
                case "busy":
                    // Busy (DND): Red minus circle + White Background
                    icon = "minus-circle";
                    color = "#EF4444";
                    useWrapper = true;
                    break;
                case "away":
                    // Away (BRB): Clock in Yellow + White Background
                    icon = "clock";
                    color = "#FACC15";
                    useWrapper = true;
                    break;
                case "offline": // Explicit offline handling
                default:
                    // Fallback (e.g., if p is explicitly "offline")
                    icon = "circle";
                    color = "#6B7280";
                    useWrapper = true;
            }
        }

        // 🌟 MODIFIED: Return useWrapper property
        return { icon, color, size: iconSize, useWrapper };
    };

    // Formats a 'last seen' time string.
    const formatLastSeen = () => {
        // Mocking a time 5 minutes ago to show the "Last seen" time format
        const now = new Date();
        const mockLastSeen = new Date(now.getTime() - (5 * 60 * 1000));

        const hours = mockLastSeen.getHours();
        const minutes = mockLastSeen.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

        return `Last seen ${formattedTime}`;
    };

    // =============================================================
    // 🌟 REFACTORED: Avatar and Presence Modal
    // =============================================================
    const AvatarAndPresenceModal = () => {
        return (
            <Modal
                visible={avatarAndPresenceModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAvatarAndPresenceModalVisible(false)}
            >
                <View style={local.modalOverlay}>
                    <ScrollView contentContainerStyle={local.avatarModalContent}>
                        <Text style={local.modalTitle}>Profile Settings</Text>

                        {/* --- AVATAR SELECTION SECTION --- */}
                        <Text style={[local.presetsLabel, { marginTop: 10 }]}>Profile Picture</Text>
                        <View style={local.avatarOptionGroup}>
                            <TouchableOpacity style={local.optionBtn} onPress={pickFromCamera}>
                                <FontAwesome5 name="camera" size={18} color="#7C3AED" />
                                <Text style={local.optionText}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={local.optionBtn} onPress={pickFromGallery}>
                                <FontAwesome5 name="images" size={18} color="#7C3AED" />
                                <Text style={local.optionText}>Choose from Gallery</Text>
                            </TouchableOpacity>
                        </View>


                        {/* --- PRESENCE (ONLINE STATUS) SECTION --- */}
                        <Text style={[local.presetsLabel, { marginTop: 25 }]}>Set Presence</Text>
                        {STATUS_PRESETS.map((opt) => {
                            const isCurrent = presence === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={[
                                        local.presetBtn,
                                        { paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }
                                    ]}
                                    onPress={() => handleSetPresence(opt.key)}
                                >
                                    <FontAwesome5
                                        // Use "dot-circle" for active, and the status-specific icon for others
                                        name={isCurrent ? "dot-circle" : opt.icon}
                                        size={14}
                                        color={opt.color}
                                        solid
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={[
                                        local.presetText,
                                        isCurrent && { fontWeight: 'bold', color: opt.color }
                                    ]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}


                        <TouchableOpacity
                            onPress={() => setAvatarAndPresenceModalVisible(false)}
                            style={[local.closeBtn, { marginTop: 20 }]}
                        >
                            <Text style={local.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        );
    };

    // =============================================================
    // 🌟 NEW: Status Message Dropdown Component
    // =============================================================
    const StatusMessageDropdown = () => {
        const allPresets = [...STATUS_MESSAGE_PRESETS, ...sessionPresets];

        const isCustomStatus =
            statusMessage.length > 0 &&
            !allPresets.includes(statusMessage);

        const handleSetStatus = (msg) => {
            setStatusMessage(msg);
            setShowStatusMessageDropdown(false); // Close dropdown
        }

        const handleRemoveStatus = () => {
            setStatusMessage("");
            setShowStatusMessageDropdown(false); // Close dropdown
        }

        const handleSaveCustomStatus = () => {
            if (statusMessage.length > 0 && !sessionPresets.includes(statusMessage)) {
                // Add to top of custom list
                setSessionPresets(prev => [statusMessage, ...prev]);
            }
            setShowStatusMessageDropdown(false); // Close dropdown
        }

        if (!showStatusMessageDropdown) return null;

        // Render the dropdown using absolute positioning defined in styles
        return (
            <View style={local.statusDropdown}>
                
                <Text style={local.currentStatusLabel}>
                    Current: <Text style={[local.currentStatusText, { fontStyle: statusMessage ? 'italic' : 'normal' }]}>{statusMessage || "(No status set)"}</Text>
                </Text>

                {/* Option to Save Status if it is a custom one */}
                {isCustomStatus && (
                    <TouchableOpacity
                        style={[local.dropdownPresetBtn, { marginTop: 5, borderBottomWidth: 1 }]}
                        onPress={handleSaveCustomStatus}
                    >
                        <View style={local.saveDeleteRow}>
                            <FontAwesome5 name="save" size={12} color="#10B981" style={{ marginRight: 6 }} />
                            <Text style={[local.dropdownPresetText, { color: '#10B981', fontWeight: 'bold' }]}>
                                Save "{statusMessage}" as Preset
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                <Text style={[local.presetsLabel, { marginTop: 10, marginBottom: 5, fontSize: 12 }]}>Select a preset:</Text>

                {allPresets.map((msg, index) => (
                    <TouchableOpacity
                        key={index}
                        style={local.dropdownPresetBtn}
                        onPress={() => handleSetStatus(msg)}
                    >
                        <Text style={local.dropdownPresetText}>
                            {msg}
                            {/* Show a visual indicator if it's a session preset */}
                            {index >= STATUS_MESSAGE_PRESETS.length && <Text style={{ fontSize: 9, color: '#A78BFA' }}> (Custom)</Text>}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* Remove Status */}
                {statusMessage.length > 0 && (
                    <TouchableOpacity
                        style={[local.dropdownPresetBtn, { marginTop: 5, borderBottomWidth: 0 }]}
                        onPress={handleRemoveStatus}
                    >
                        <View style={local.saveDeleteRow}>
                            <FontAwesome5 name="trash" size={12} color="#EF4444" style={{ marginRight: 6 }} />
                            <Text style={[local.dropdownPresetText, { color: '#EF4444' }]}>
                                Remove Current Status
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                
                {/* Close button for the dropdown */}
                <TouchableOpacity
                    onPress={() => setShowStatusMessageDropdown(false)}
                    style={[local.closeDropdownBtn]}
                >
                    <Text style={local.closeDropdownText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // =============================================================
    // 🌟 ADDED: Contact Options Modal
    // =============================================================
    const ContactOptionsModal = () => {
        if (!selectedContactForOptions) return null;
        
        const contactName = selectedContactForOptions.displayName;

        // Placeholder functions for the options
        const handleOptionPress = (action) => {
            // In a real app, this is where AsyncStorage or API calls would happen
            console.log(`${action} pressed for ${contactName}`);
            setOptionsModalVisible(false);
            setSelectedContactForOptions(null);
        };

        const OPTIONS = [
            { key: 'remove', label: `Remove ${contactName}`, icon: 'user-minus', color: '#EF4444', action: () => handleOptionPress('Remove') },
            { key: 'block', label: `Block ${contactName}`, icon: 'user-lock', color: '#F97316', action: () => handleOptionPress('Block') },
            { key: 'notify', label: `Notify when Online`, icon: 'bell', color: '#10B981', action: () => handleOptionPress('Notify') },
            { key: 'silence', label: `Silence/Mute Chat`, icon: 'volume-off', color: '#3B82F6', action: () => handleOptionPress('Silence') },
        ];


        return (
            <Modal
                visible={optionsModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setOptionsModalVisible(false);
                    setSelectedContactForOptions(null);
                }}
            >
                <View style={local.modalOverlay}>
                    <View style={local.optionsModalContent}>
                        <Text style={local.modalTitle}>Options for {contactName}</Text>

                        {OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                style={local.optionBtn}
                                onPress={opt.action}
                            >
                                <FontAwesome5 name={opt.icon} size={18} color={opt.color} style={{ width: 25 }} />
                                <Text style={[local.optionText, { color: opt.color, fontWeight: '600' }]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        
                        <TouchableOpacity
                            onPress={() => {
                                setOptionsModalVisible(false);
                                setSelectedContactForOptions(null);
                            }}
                            style={[local.closeBtn, { marginTop: 10 }]}
                        >
                            <Text style={[local.closeText, { color: MUTED }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    // =============================================================
    // HERO HEADER
    // =============================================================
    const renderGradientHero = () => {
        const userIcon = getDotIcon(presence);

        return (
            <LinearGradient
                colors={["#C4B5FD", "#7C3AED"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={local.gradientHero}
            >
                <SafeAreaView edges={["top"]} style={{ width: '100%' }}>
                    
                    {/* 🌟 REMOVED: StatusMessageDropdown from here. It is now outside renderGradientHero */}
                    
                    <View style={local.heroRow}>

                        {/* BACK BUTTON (Top Left) */}
                        <TouchableOpacity onPress={() => navigation.goBack()} style={local.backBtn}>
                            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                        </TouchableOpacity>

                        {/* AVATAR - Now opens the dedicated Avatar and Presence modal */}
                        <TouchableOpacity
                            onPress={() => setAvatarAndPresenceModalVisible(true)} // 🌟 MODIFIED
                            // Adjusted horizontal position
                            // NOTE: You may need to adjust these margins after increasing the avatar size.
                            style={{ marginLeft: 8, marginBottom: 6 }}
                        >
                            <Image
                                source={{
                                    uri:
                                        chatUser?.avatar ||
                                        "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
                                }}
                                // Uses the updated local.avatar style
                                style={local.avatar}
                            />
                        </TouchableOpacity>

                        {/* USER INFO COLUMN */}
                        <View style={{ flex: 1, marginLeft: 20, marginBottom: -2 }}>
                            {/* Name row with status dot/icon and presence chevron */}
                            <View style={local.nameRow}>
                                {/* 🌟 MODIFIED: Conditionally render wrapper for White Status Background */}
                                {userIcon.useWrapper ? (
                                    <View style={local.headerIconWrapper}>
                                        <FontAwesome5
                                            name={userIcon.icon}
                                            size={userIcon.size}
                                            color={userIcon.color}
                                            solid
                                        />
                                    </View>
                                ) : (
                                    // 🌟 MODIFIED: Render simple icon for 'online' status, now wrapped for shadow
                                    <View style={local.onlineStatusDotWrapper}>
                                        <FontAwesome5
                                            name={userIcon.icon}
                                            size={userIcon.size}
                                            color={userIcon.color}
                                            solid
                                        />
                                    </View>
                                )}
                                <Text style={local.username}>{chatUser?.displayName || "Guest"}</Text>
                            </View>

                            {/* Status message input and preset arrow */}
                            <View style={local.statusBox}>
                                <TextInput
                                    value={statusMessage}
                                    onChangeText={setStatusMessage}
                                    placeholder="Set a status message..."
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    style={[
                                        local.statusInput,
                                        // APPLY ITALIC FONT STYLE TO ALL TEXT, TYPED OR PLACEHOLDER
                                        { fontStyle: 'italic' },
                                        // Set text color based on whether status is set
                                        statusMessage.length === 0
                                            ? { color: 'rgba(255,255,255,0.7)' }
                                            : { color: '#FFF' }
                                    ]}
                                    returnKeyType="done"
                                    onSubmitEditing={() => {
                                        // Status is set on key-change, this just confirms/closes keyboard
                                    }}
                                />
                                {/* Chevron to open preset/management dropdown */}
                                <TouchableOpacity onPress={() => setShowStatusMessageDropdown(true)}> {/* 🌟 MODIFIED */}
                                    <FontAwesome5 name="chevron-down" size={12} color="rgba(255,255,255,0.8)" style={{ marginRight: 55 }} />
                                </TouchableOpacity>
                            </View>

                        </View>

                        {/* MATCHMAKING ICON (Top Right) */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Matchmaking")}
                            // Adjusted vertical position
                            style={{ marginBottom: 0, marginRight: 10 }}
                        >
                            <FontAwesome5 name="user-ninja" size={22} color="#fff" />
                        </TouchableOpacity>

                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // =============================================================
    // TABS + SEARCH
    // =============================================================
    const renderTabs = () => (
        <View>
            <View style={local.tabs}>
                {["contacts", "chats", "rooms"].map((t) => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setTab(t)}
                        style={[
                            local.tab,
                            tab === t && { borderBottomColor: ACCENT, borderBottomWidth: 2 },
                        ]}
                    >
                        <Text style={[local.tabText, { color: tab === t ? ACCENT : "#111" }]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={local.searchBox}>
                <FontAwesome5 name="search" size={14} color="#6B7280" />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={
                        tab === "contacts"
                            ? "Search contacts..."
                            : tab === "rooms"
                                ? "Search rooms..."
                                : "Search chats..."
                    }
                    placeholderTextColor="#6B7280"
                    style={local.searchInput}
                />
            </View>
        </View>
    );

    // =============================================================
    // CONTACT AVATAR WITH STATUS ICON OVERLAY
    // =============================================================
    const ContactAvatar = ({ item }) => {
        const iconData = getDotIcon(item.presence);

        return (
            <View style={local.avatarWrapper}>
                <Image source={{ uri: item.avatar }} style={local.cardAvatar} />
                {/* 🌟 MODIFIED: Conditionally apply transparent style to wrapper */}
                <View
                    style={[
                        local.avatarIconWrapper,
                        !iconData.useWrapper && local.avatarIconWrapperTransparent,
                    ]}
                >
                    <FontAwesome5
                        name={iconData.icon}
                        size={iconData.size}
                        color={iconData.color}
                        solid
                    />
                </View>
            </View>
        );
    };

    // =============================================================
    // MAIN CONTENT
    // =============================================================
    const renderMain = () => (
        <View style={local.main}>
            {/* CONTACTS */}
            {tab === "contacts" && (
                <>
                    <FlatList
                        data={users.filter((u) =>
                            u.displayName.toLowerCase().includes(search.toLowerCase())
                        )}
                        keyExtractor={(item) => item.uid}
                        renderItem={({ item }) => {
                            const isOnline = ONLINE_STATUSES.includes(item.presence);

                            const presenceText = isOnline
                                ? STATUS_PRESETS.find(p => p.key === item.presence)?.label.split('(')[0].trim() // Extract just the label
                                : formatLastSeen();
                            
                            return (
                                <TouchableOpacity
                                    style={local.contactCard}
                                    onPress={() => navigation.navigate("ChatDM", { otherUser: item })}
                                    // 🌟 ADDED: Long Press Handler
                                    onLongPress={() => {
                                        setSelectedContactForOptions(item);
                                        setOptionsModalVisible(true);
                                    }}
                                >
                                    <ContactAvatar item={item} />

                                    <View>
                                        <Text style={local.contactName}>{item.displayName}</Text>

                                        {/* Contact Status Message (Now font size 13) */}
                                        <Text style={local.contactStatus}>
                                            {item.statusMessage ?? ""}
                                        </Text>

                                        {/* Status Label (Presence) or Last Seen (Now font size 12) */}
                                        {item.presence && (
                                            <Text
                                                style={local.contactPresence}
                                            >
                                                {presenceText}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    />

                    <View style={local.fabWrapper}>
                        <TouchableOpacity onPress={() => navigation.navigate("AddContact")}>
                            <FontAwesome5 name="user-plus" size={28} color="#7C3AED" />
                        </TouchableOpacity>
                        <Text style={local.fabLabel}>Add Contact</Text>
                    </View>
                </>
            )}

            {/* ROOMS */}
            {tab === "rooms" && (
                <>
                    <FlatList
                        data={rooms.filter((r) =>
                            r.name.toLowerCase().includes(search.toLowerCase())
                        )}
                        keyExtractor={(r) => r.id}
                        renderItem={({ item }) => (
                            <View style={local.roomCard}>
                                <Text style={local.roomName}>{item.name}</Text>
                                <TouchableOpacity>
                                    <FontAwesome5 name="trash" size={14} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 120 }}
                    />

                    <View style={local.fabWrapper}>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <FontAwesome5 name="plus" size={28} color="#7C3AED" />
                        </TouchableOpacity>
                        <Text style={local.fabLabel}>Create Room</Text>
                    </View>
                </>
            )}

            {tab === "chats" && (
                <View style={local.placeholder}>
                    <Text style={local.placeholderText}>No recent chats yet.</Text>
                </View>
            )}
        </View>
    );
    
    return (
        <View style={[local.screen, { backgroundColor: isDark ? "#000" : "#F5F3FF" }]}>

            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle={isDark ? "dark-content" : "light-content"}
            />

            {renderGradientHero()}
            {renderTabs()}
            {renderMain()}
            {StatusMessageDropdown()} {/* 🌟 MOVED HERE TO ENSURE IT'S ON TOP (Higher Z-Index) */}
            {AvatarAndPresenceModal()} 
            {ContactOptionsModal()} {/* 🌟 ADDED: Render the options modal */}
            {/* Modal for creating a room is not included in the refactoring but should remain. */}
        </View>
    );
}

/* =============================================================
    STYLES
============================================================= */

const local = StyleSheet.create({
    screen: { flex: 1 },

    gradientHero: {},

    heroRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 0,
        minHeight: 40,
        // 🔄 Shift the entire row up 4 pixels
        marginTop: -6,
    },

    backBtn: {
        marginRight: 15,
        marginLeft: 5,
        marginTop: 0,
    },

    // 🌟 MODIFIED: Increased size from 36 to 48 and adjusted borderRadius
    avatar: { 
        width: 42, 
        height: 42, 
        borderRadius: 24 // half of width/height for perfect circle
    },

    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    username: {
        fontSize: 17,
        fontWeight: "700",
        color: "#FFF",
        marginTop: 2,
    },

    // 💥 MODIFIED: ADDED SHADOW FOR WRAPPED STATUS DOTS (DND, BRB, OFFLINE)
    headerIconWrapper: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 1,
        elevation: 3,
    },
    
    // 💥 NEW: Wrapper for the 'online' status dot in the header to apply shadow
    onlineStatusDotWrapper: {
        marginRight: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 1,
        elevation: 3,
    },
    // statusBox moved up slightly by using a negative top margin
    statusBox: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: -6,
        paddingHorizontal: 0,
        paddingVertical: 2,
        maxWidth: '94%',
    },

    statusInput: {
        flex: 1,
        paddingVertical: 6,
        fontSize: 14,
        marginRight: 8,
    },

    // 🌟 NEW: Style for the Status Message Dropdown (positioned absolutely)
    statusDropdown: {
        position: 'absolute',
        top: 65, // Adjust this based on header size to sit below the status input
        left: 72, // Aligned with the status input text
        zIndex: 10, // Important for stacking order
        width: 250, // Fixed width
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    // STATUS MESSAGE Dropdown Styles
    currentStatusLabel: {
        fontSize: 13,
        color: "#374151",
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },

    currentStatusText: {
        fontWeight: '600',
        color: "#6B21A8",
    },

    presetsLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#4B5563",
        marginBottom: 8,
    },

    presetBtn: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    
    dropdownPresetBtn: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },

    presetText: {
        fontSize: 14,
        color: "#374151",
    },
    
    dropdownPresetText: {
        fontSize: 13,
        color: "#374151",
    },

    saveDeleteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    
    closeDropdownBtn: {
        paddingVertical: 5,
        alignItems: "center",
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    closeDropdownText: {
        color: "#4B5563",
        fontWeight: "600",
        fontSize: 12,
    },
    // END STATUS MESSAGE Dropdown Styles

    tabs: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingBottom: 8,
        // Reduced from 2 to 0 to minimize space below header
        marginTop: 26,
    },

    tab: { paddingVertical: 8 },
    tabText: { fontSize: 15, fontWeight: "700" },

    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    searchInput: {
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
        color: "#111",
    },

    main: { flex: 1, paddingHorizontal: 16 },

    /* CONTACTS */
    contactCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        padding: 12,
    },

    avatarWrapper: {
        position: "relative",
        marginRight: 16,
    },

    cardAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },

    // 💥 MODIFIED: ADDED SHADOW FOR ALL CONTACT STATUS DOTS
    avatarIconWrapper: {
        position: "absolute",
        bottom: 1,
        right: -1,
        width: 12,
        height: 12,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.4,
        shadowRadius: 1,
        elevation: 3,
    },

    avatarIconWrapperTransparent: {
        backgroundColor: 'transparent',
        // Note: Shadow properties remain on the View even if background is transparent
    },

    contactName: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
    contactStatus: { fontSize: 13, color: "#4B5563", fontStyle: "italic", marginTop: 2 },
    contactPresence: { fontSize: 12, color: MUTED, marginTop: 1 },

    /* ROOMS */
    roomCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#fff",
        marginBottom: 10,
        borderRadius: 5,
    },
    roomName: { fontSize: 16, fontWeight: "600", color: "#1F2937" },

    /* FAB (Floating Action Button) */
    fabWrapper: {
        position: 'absolute',
        bottom: 50,
        right: 162,
        alignItems: 'center',
        width: 60,
        height: 60,
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    fabLabel: {
        fontSize: 12,
        width: 72,
        color: "#7C3AED",
        fontWeight: 'bold',
        position: 'absolute',
        bottom: 0,
    },

    /* Create Room Modal */
    // Note: Reused modalTitle/modalInput/modalBtn from original file, but they are currently only used by the Room Modal which is not fully included here.
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#1F2937",
        textAlign: 'center', // 🌟 ADDED: Center alignment for option modal title
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 16,
    },
    modalBtn: {
        backgroundColor: "#7C3AED",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 8,
    },
    modalBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    closeBtn: {
        padding: 10,
        alignItems: "center",
        marginTop: 5,
    },
    closeText: {
        color: "#EF4444",
        fontWeight: "600",
    },

    /* Placeholder for Chats */
    placeholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 16,
        color: "#6B7280",
        fontStyle: "italic",
    },

    /* Avatar Picker Modal (and general modal overlay) */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarModalContent: {
        width: "90%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
    },
    // 🌟 ADDED: Styles for Contact Options Modal
    optionsModalContent: {
        width: "85%", // Slightly smaller than avatarModalContent
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        alignItems: 'stretch',
    },
    optionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14, // Increased padding
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    optionText: {
        marginLeft: 15, // Increased margin
        fontSize: 15,
        color: "#374151",
        fontWeight: '500',
    },
    // Group for avatar options
    avatarOptionGroup: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 5,
        marginTop: 5,
        paddingHorizontal: 10,
    }
});