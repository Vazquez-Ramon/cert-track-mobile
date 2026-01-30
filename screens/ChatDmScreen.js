// =============================================================
// 💬 ChatDmScreen — V7: Attachment Icon & Dynamic Input Padding (BUGFIXED)
// =============================================================
import React,{useState,useEffect,useRef}from"react";
import{View,Text,TouchableOpacity,TextInput,FlatList,Image,KeyboardAvoidingView,Platform,StyleSheet,Alert,Modal,StatusBar,Switch,Animated,PanResponder, Keyboard}from"react-native";
import{SafeAreaView}from"react-native-safe-area-context";
import{LinearGradient}from"expo-linear-gradient";
import { BlurView } from 'expo-blur';
import{FontAwesome5}from"@expo/vector-icons";
import{useChat}from"../chat/ChatContext"; 
import * as Clipboard from 'expo-clipboard'; // Assuming expo-clipboard is installed

// ----------------------------------------------------------------
// Inline iMessage-style swipe bubble
// ----------------------------------------------------------------
const SwipeBubble=({children,isMe,time,isLastSeenMessage})=>{
 const slideX=useRef(new Animated.Value(0)).current;
 const[showTime,setShowTime]=useState(false);
 const MAX=30;
 const panResponder=useRef(PanResponder.create({
  onMoveShouldSetPanResponder:(_,g)=>{
   if(isLastSeenMessage)return false;
   return Math.abs(g.dx)>Math.abs(g.dy)&&Math.abs(g.dx)>4;
  },
  onPanResponderMove:(_,g)=>{
   if(isLastSeenMessage)return;
   let limit=isMe?-MAX:MAX;
   let dx=isMe?Math.max(limit,Math.min(0,g.dx)):Math.min(limit,Math.max(0,g.dx));
   slideX.setValue(dx);
   if(!showTime&&Math.abs(g.dx)>8)setShowTime(true);
   if(showTime&&Math.abs(g.dx)<6)setShowTime(false);
  },
  onPanResponderRelease:()=>{
   // FIX: Adjusted spring config for better reliability on both directions (especially for !isMe)
   Animated.spring(slideX,{
    toValue:0,
    tension:100, // Increased tension for a snappier return
    friction:10,
    useNativeDriver:false // Disabled native driver to avoid potential gesture conflicts
   }).start(()=>setShowTime(false));
  }
 })).current;
 return(
  <View style={{marginBottom:6}}>
   {/* FIX: Moved Animated.View (containing the bubble) before the time Text */}
   <Animated.View {...panResponder.panHandlers} style={{transform:[{translateX:slideX}]}}>
    {children}
   </Animated.View>
   {!isLastSeenMessage&&showTime&&(
    <Text style={[styles.timeSwipe,isMe?styles.timeRight:styles.timeLeft, {marginTop: 3}]}>{time}</Text>
   )}
  </View>
 );
};


// ----------------------------------------------------------------
// Message Context Components (Visual Reply/Forward)
// ----------------------------------------------------------------
const ReplyContext=({messageId,messages,isMe})=>{
    const originalMsg = messages.find(m => m.id === messageId);
    if (!originalMsg) return null;
    
    const sender = originalMsg.sender === "You" ? "You" : originalMsg.sender;
    const text = originalMsg.text.length > 80 ? originalMsg.text.substring(0, 80) + '...' : originalMsg.text;

    return (
        <View style={[styles.replyContext, isMe ? styles.replyContextMe : styles.replyContextOther]}>
            <View style={[styles.replyBar, {backgroundColor: isMe ? '#C4B5FD' : '#7C3AED'}]} />
            <View style={{flex: 1}}>
                <Text style={[styles.replySender, {color: isMe ? '#C4B5FD' : '#7C3AED'}]}>
                    {sender}
                </Text>
                {/* Text color inverted for visibility against the semi-transparent bubble background */}
                <Text style={[styles.replyText, {color: isMe ? '#fff' : '#111'}]} numberOfLines={1}>
                    {text}
                </Text>
            </View>
        </View>
    );
};

const ForwardContext=({messageId})=>{
    return (
        <View style={styles.forwardContext}>
            <FontAwesome5 name="share" size={10} color="#6B7280" style={{marginRight: 5}}/>
            <Text style={styles.forwardText}>Forwarded Message</Text>
        </View>
    );
};

const ReactionBubble = ({ reactions, isMe }) => {
    const activeReactions = Object.keys(reactions).filter(emoji => reactions[emoji] > 0);
    if (activeReactions.length === 0) return null;
    
    const emojis = activeReactions.join(''); 

    return (
        // 💥 FIX 1: Styles updated for circular badge, pinned to top-right of the bubble.
        <View style={[
            styles.reactionContainer,
            isMe ? styles.reactionContainerMe : styles.reactionContainerOther
        ]}>
            <Text style={styles.reactionTextBubble}>{emojis}</Text>
        </View>
    );
};

// ----------------------------------------------------------------
// New Typing Indicator Component (STAGGERED Fill, Bounce, Disappear, and Repeat)
// ----------------------------------------------------------------
const TypingIndicator = () => {
    // Animated values for TranslateY (bounce) and Opacity (fill/disappear)
    const bounceValues = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
    const opacityValues = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
    
    const bounceHeight = -10; // Increased bounce height as requested
    const duration = 500; // Total bounce duration (up/down)
    const staggerDelay = 200; // Delay between dot animations
    const bounceCycles = 2; // Total up/down pairs
    const pauseTime = 500; // Pause between full cycles

    const createDotAnimation = (index) => {
        // Animation blocks
        const bounceUp = Animated.timing(bounceValues[index], { toValue: bounceHeight, duration: duration / 2, useNativeDriver: true });
        const bounceDown = Animated.timing(bounceValues[index], { toValue: 0, duration: duration / 2, useNativeDriver: true });
        const fadeIn = Animated.timing(opacityValues[index], { toValue: 1, duration: 150, useNativeDriver: true });
        const fadeOut = Animated.timing(opacityValues[index], { toValue: 0, duration: 150, useNativeDriver: true });
        
        // Staggered sequence for one dot
        return Animated.sequence([
            // 1. Staggered Fill (Wait)
            Animated.delay(index * staggerDelay), 
            fadeIn,
            
            // 2. Staggered Bounce Loop
            Animated.loop(
                Animated.sequence([bounceUp, bounceDown]),
                { iterations: bounceCycles }
            ),
            
            // 3. Staggered Disappear (Wait for others to finish their bounce/fade)
            // 💥 FIX: Removed redundant ' + bounceCycles * duration' which was causing a stutter.
            Animated.delay((2 - index) * staggerDelay), 
            fadeOut,
            
            // 4. Wait for the total cycle time before the parallel loop repeats
            Animated.delay(pauseTime), 
        ]);
    };
    
    useEffect(() => {
        // Reset initial states
        bounceValues.forEach(val => val.setValue(0));
        opacityValues.forEach(val => val.setValue(0));
        
        // Loop the entire staggered sequence indefinitely in parallel
        const animations = bounceValues.map((_, index) => createDotAnimation(index));
        
        const indicatorAnimation = Animated.loop(
            Animated.parallel(animations)
        );

        indicatorAnimation.start();
        return () => indicatorAnimation.stop();
    }, []);

    // Render the 3 bouncing dots
    return (
        <View style={styles.typingIndicatorContainer}>
            {bounceValues.map((bounce, index) => (
                <Animated.View 
                    key={index} 
                    style={[
                        styles.typingDotWrapper, 
                        { 
                            transform: [{ translateY: bounce }], 
                            opacity: opacityValues[index]
                        }
                    ]}
                >
                    <FontAwesome5 
                        name="circle" 
                        size={6} 
                        color="#7C3AED" // Changed color to primary purple for visibility against the chat background
                        solid
                        style={styles.typingDot}
                    />
                </Animated.View>
            ))}
        </View>
    );
};


// ----------------------------------------------------------------
// Main Screen - Uses NAMED EXPORT
// ----------------------------------------------------------------
export function ChatDmScreen({route,navigation}){
 const{otherUser}=route.params;
 const inputRef = useRef(null);
 // FIX 1: Destructured the correct deletion functions
 const{messages,typingMap,sendMessage,markSeen,deleteMessageForMe, deleteMessageForAll, deleteConversation, toggleDisappearingMessages, addReaction}=useChat();
 const[text,setText]=useState("");
 const[profileVisible,setProfileVisible]=useState(false);
 const[settingsVisible,setSettingsVisible]=useState(false);
 const[messageOptionsVisible,setMessageOptionsVisible]=useState(false);
 const[selectedMessage,setSelectedMessage]=useState(null);
 // New States for Input Context
 const[replyingToMessage,setReplyingToMessage]=useState(null);
 // 🐛 BUGFIX: Correctly initialize state using useState(null)
 const[forwardingMessage,setForwardingMessage]=useState(null);
 
 // Settings states
 const[typingIndicatorOn,setTypingIndicatorOn]=useState(true);
 const[readReceiptsOn,setReadReceiptsOn]=useState(true); 
 const[disappearingMessagesOn,setDisappearingMessagesOn]=useState(false);
 const flatListRef=useRef(null);
 
 // REQUIRED VARIABLE DECLARATIONS:
 const dmMessages=messages[otherUser.uid]||[];
 const isTyping=typingMap[otherUser.uid];
 
 // Read Receipts Toggle Logic
 const lastSeenMessageId = readReceiptsOn 
    ? dmMessages.slice().reverse().find(m => m.sender === "You" && m.seen)?.id 
    : null;
 
 const [keyboardIsVisible, setKeyboardIsVisible] = useState(false);

 useEffect(()=>{markSeen(otherUser.uid)},[]);

 // Keyboard Listeners (Ensures safe area padding is correct)
 useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardDidShowListener = Keyboard.addListener(showEvent, () => {
        setKeyboardIsVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => {
        setKeyboardIsVisible(false);
    });
    return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
    };
}, []);

 // Disappearing Messages Sync
 useEffect(() => {
    if (toggleDisappearingMessages) {
        toggleDisappearingMessages(otherUser.uid, disappearingMessagesOn);
    }
 }, [disappearingMessagesOn, otherUser.uid, toggleDisappearingMessages]);

 // Scroll to bottom when new message arrives or typing starts/stops
 useEffect(()=>{setTimeout(()=>flatListRef.current?.scrollToOffset({offset:0,animated:true}),100)},[dmMessages,isTyping]);
 
 // Handlers
 const handleSend=()=>{
    if(!text.trim())return;
    
    const replyingToId = replyingToMessage ? replyingToMessage.id : null;
    const forwardingId = forwardingMessage ? forwardingMessage.id : null;

    sendMessage(otherUser,text.trim(), replyingToId, forwardingId);
    
    setText("");
    setReplyingToMessage(null);
    setForwardingMessage(null);
 };

 // HANDLER FOR NEW ATTACHMENT BUTTON
 const handleAttach = () => {
     Alert.alert("Attachment", "Opening attachment picker...", [
         { text: "OK", style: "default" }
     ]);
     // In a real app, this would open a photo/file picker.
 };
 
 const handleMessageLongPress=m=>{setSelectedMessage(m);setMessageOptionsVisible(true)};
 
 // =================================================================
 // MESSAGE DELETION LOGIC (Conditional Prompt & Function Call)
 // =================================================================
 const handleDelete=()=>{
    if(!selectedMessage)return;
    setMessageOptionsVisible(false);

    const isMe = selectedMessage.sender === "You";
    let alertTitle;
    let alertMessage;
    let deleteText;
    let deleteFunction; 

    if (isMe) {
        if (selectedMessage.seen) {
            // Seen message by me: Delete for Me only
            alertTitle = "Delete Message?";
            alertMessage = `They have seen this message. It will be removed from your chat history only.`;
            deleteText = "Delete for Me";
            deleteFunction = () => deleteMessageForMe(otherUser.uid,selectedMessage.id);
        } else {
            // Unseen message by me: Delete for All (Unsend) - Fulfills user request
            alertTitle = "Unsend Message?";
            alertMessage = `They have not seen this message. It will be removed from your chat history and theirs.`;
            deleteText = "Unsend for All";
            deleteFunction = () => deleteMessageForAll(otherUser.uid,selectedMessage.id);
        }
    } else {
        // Message from them: Delete for Me only
        alertTitle = "Delete Message?";
        alertMessage = "This will remove the message from your chat history only.";
        deleteText = "Delete for Me";
        deleteFunction = () => deleteMessageForMe(otherUser.uid,selectedMessage.id);
    }

    Alert.alert(
        alertTitle,
        alertMessage,
        [
            {text:"Cancel",style:"cancel"},
            {
                text: deleteText, 
                style:"destructive",
                onPress: deleteFunction 
            }
        ]
    );
 };
 
 // Action Mockup Implementation (Reply, Forward, Reactions, Copy)
 const handleAction=a=>{
  setMessageOptionsVisible(false);
  if(!selectedMessage)return;
  
  const actionType = a.split(":")[0];

  if(actionType==="reaction"){
    const emoji = a.split(":")[1];
    addReaction(otherUser.uid, selectedMessage.id, emoji);
    setSelectedMessage(null); // No alert, just update state
  }
  else if(a==="reply"){
    setReplyingToMessage(selectedMessage);
    setForwardingMessage(null); 
    inputRef.current?.focus();
    setSelectedMessage(null);
  }
  else if(a==="forward"){
    setForwardingMessage(selectedMessage);
    setReplyingToMessage(null); 
    inputRef.current?.focus();
    setSelectedMessage(null);
  }
  else if(a==="copy"){
    Clipboard.setString(selectedMessage.text).then(() => {
        // Silent copy for best UX on iPhone keyboard paste
    }).catch(e => {
        Alert.alert("Copy Error", "Could not copy to clipboard.");
        console.error(e);
    });
    setSelectedMessage(null);
  }
  else if(a==="delete")handleDelete(); 
 };
 
 const getStatusColor=p=>p==="online"?"#22C55E":p==="busy"?"#EF4444":p==="away"?"#FACC15":"#6B7280";
 const formatTimeWithDay = (timeString) => {
    return `Mon, July 15, ${timeString}`;
 };

 // ... (Modal Components remain unchanged) ...
 const ProfileCard=()=>(
  <Modal visible={profileVisible}transparent animationType="fade">
   <TouchableOpacity style={styles.profileOverlay} onPress={()=>setProfileVisible(false)} activeOpacity={1}>
    <View style={styles.profileCard} onStartShouldSetResponder={() => true} onPress={() => {}}>
     <View style={{position:"relative"}}>
      <Image source={{uri:otherUser.avatar}}style={styles.profileAvatar}/>
      <View style={[styles.avatarStatusDotBig,{backgroundColor:getStatusColor(otherUser.presence)}]}/>
     </View>
     <Text style={styles.profileName}>{otherUser.displayName}</Text>
     <Text style={styles.profilePresenceText}>{otherUser.presence.toUpperCase()}</Text>
     <Text style={styles.profileStatusMessage}>{otherUser.statusMessage}</Text>
     <View style={styles.profileBtns}>
      <TouchableOpacity onPress={()=>Alert.alert("Call",`Starting voice call with ${otherUser.displayName}`)}style={[styles.profileBtn,{backgroundColor:"#E5E7EB"}]}><FontAwesome5 name="phone"size={20}color="#7C3AED"/></TouchableOpacity>
      <TouchableOpacity onPress={()=>Alert.alert("Video",`Starting video call with ${otherUser.displayName}`)}style={[styles.profileBtn,{backgroundColor:"#E5E7EB"}]}><FontAwesome5 name="video"size={20}color="#7C3AED"/></TouchableOpacity>
      <TouchableOpacity onPress={()=>Alert.alert("Info",`More info for ${otherUser.displayName}`)}style={[styles.profileBtn,{backgroundColor:"#E5E7EB"}]}><FontAwesome5 name="info-circle"size={20}color="#7C3AED"/></TouchableOpacity>
     </View>
     <TouchableOpacity onPress={()=>setProfileVisible(false)}style={styles.closeProfileBtn}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
    </View>
   </TouchableOpacity>
  </Modal>
 );

 const MessageOptionsModal=()=>(
  <Modal visible={messageOptionsVisible}transparent animationType="fade">
   <TouchableOpacity style={styles.profileOverlay} onPress={()=>setMessageOptionsVisible(false)} activeOpacity={1}>
    <View style={styles.messageOptionsCard} onStartShouldSetResponder={() => true} onPress={() => {}}>
     
     {/* Check if the message is NOT from me (i.e., it's from the other user) */}
     {selectedMessage && selectedMessage.sender !== "You" && (
      <>
        {/* REACTION ROW: Only visible for the other user's messages */}
        <View style={styles.reactionRow}>
          {["reaction:👍","reaction:❤️","reaction:😂","reaction:😮","reaction:😭","reaction:😡"].map((a,i)=>(
          <TouchableOpacity key={i} onPress={()=>handleAction(a)}style={styles.reactionBtn}><Text style={styles.reactionText}>{a.split(":")[1]}</Text></TouchableOpacity>
          ))}
          <TouchableOpacity onPress={()=>Alert.alert("More Reactions","More reaction options...")}style={[styles.reactionBtn,styles.addReactionBtn]}><FontAwesome5 name="plus"size={16}color="#7C3AED"/></TouchableOpacity>
        </View>
        
        {/* ACTION LIST (Reply, Forward, Copy): Only visible for the other user's messages */}
        <View style={styles.actionList}>
          <TouchableOpacity onPress={()=>handleAction("reply")}style={styles.actionOption}><FontAwesome5 name="reply"size={16}color="#374151"/><Text style={styles.actionOptionText}>Reply</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>handleAction("forward")}style={styles.actionOption}><FontAwesome5 name="share"size={16}color="#374151"/><Text style={styles.actionOptionText}>Forward</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>handleAction("copy")}style={styles.actionOption}><FontAwesome5 name="copy"size={16}color="#374151"/><Text style={styles.actionOptionText}>Copy</Text></TouchableOpacity>
          
          {/* Delete Option is placed outside the actionList for better control of the border when it's the only item */}
        </View>
      </>
     )}

     {/* DELETE OPTION: Always visible, but only message from 'You' will have only this option. */}
     <View style={selectedMessage && selectedMessage.sender === "You" ? styles.actionList : {paddingHorizontal: 10, paddingVertical: 5}}>
      <TouchableOpacity onPress={()=>handleAction("delete")}style={[styles.actionOption,styles.deleteActionOption, selectedMessage && selectedMessage.sender === "You" && {borderTopWidth: 0, paddingTop: 12}]}>
        <FontAwesome5 name="trash-alt"size={16}color="#EF4444"/><Text style={[styles.actionOptionText, styles.deleteActionText]}>Delete Message</Text>
      </TouchableOpacity>
     </View>
     
    </View>
   </TouchableOpacity>
  </Modal>
 );

 const SettingsModal=()=>(
  <Modal visible={settingsVisible}transparent animationType="fade">
   <TouchableOpacity style={styles.profileOverlay} onPress={()=>setSettingsVisible(false)} activeOpacity={1}>
    <View style={styles.settingsModalContent} onStartShouldSetResponder={() => true} onPress={() => {}}>
     <Text style={styles.modalTitle}>Chat Settings</Text>
     {[
      ["Typing Indicator",typingIndicatorOn,setTypingIndicatorOn],
      ["Read Receipts",readReceiptsOn,setReadReceiptsOn],
      ["Disappearing Messages (24h)",disappearingMessagesOn,setDisappearingMessagesOn],
     ].map(([label,val,set])=>(
      <View key={label}style={styles.settingOption}>
       <Text style={styles.settingOptionText}>{label}</Text>
       <Switch trackColor={{false:"#767577",true:"#7C3AED"}}thumbColor={val?"#fff":"#f4f3f4"}onValueChange={()=>set(!val)}value={val}/>
      </View>
     ))}
     
     <TouchableOpacity onPress={()=>{
        setSettingsVisible(false);
        Alert.alert("Delete Conversation", "Are you sure? This action cannot be undone and will permanently remove the conversation history for you.", [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: () => {
                    deleteConversation(otherUser.uid); 
                    navigation.goBack(); 
                }
            }
        ]);
     }}style={[styles.settingOption,styles.deleteOption]}>
      <FontAwesome5 name="trash-alt"size={18}color="#EF4444"/><Text style={styles.deleteText}>Delete Conversation</Text>
     </TouchableOpacity>
     <TouchableOpacity onPress={()=>setSettingsVisible(false)}style={styles.closeModalBtn}><Text style={styles.closeTextModal}>Close Settings</Text></TouchableOpacity>
    </View>
   </TouchableOpacity>
  </Modal>
 );
 // ... (End Modal Components) ...

 // Render each message (PATCH APPLIED HERE)
 const renderMessage=({item,index})=>{
  const isMe=item.sender==="You";
  const isLast=isMe&&item.id===lastSeenMessageId; 
  
  const formattedTime = formatTimeWithDay(item.time); 
  return(
   <View style={{marginBottom:10}}>
    <SwipeBubble isMe={isMe}time={formattedTime}isLastSeenMessage={isLast}>
     <TouchableOpacity onLongPress={()=>handleMessageLongPress(item)}activeOpacity={0.8}style={[styles.msgRow,{justifyContent:isMe?"flex-end":"flex-start"}]}>
      {!isMe&&<View style={styles.avatarWrapper}>
       <Image source={{uri:otherUser.avatar}}style={styles.msgAvatar}/>
       <View style={[styles.avatarStatusDot,{backgroundColor:getStatusColor(otherUser.presence)}]}/>
      </View>}
      <View style={[styles.bubble,isMe?styles.bubbleMe:styles.bubbleOther]}>
       {/* RENDER REPLY CONTEXT (Above message text) */}
       {item.replyingToId && <ReplyContext messageId={item.replyingToId} messages={dmMessages} isMe={isMe} />}
       {/* RENDER FORWARD CONTEXT (Above message text) */}
       {item.forwardingId && <ForwardContext messageId={item.forwardingId} />}
       <Text style={[styles.msgText,isMe?styles.msgMeText:styles.msgOtherText]}>{item.text}</Text>
       
       {/* 💥 FIX 1: Reaction Bubble is placed here, inside the bubble View (it is position: 'absolute' relative to the bubble) */}
       <ReactionBubble reactions={item.reactions} isMe={isMe} /> 
       
      </View>
     </TouchableOpacity>
    </SwipeBubble>
    {isLast && <View style={[styles.statusRow,{justifyContent:"flex-end"}]}>
     <Image source={{uri:otherUser.avatar}}style={styles.readReceiptAvatar}/>
    </View>}
   </View>
  );
 };

 // Header (Updated to use an absolute overlay for full color coverage)
 const Header=()=>(
  <BlurView 
    intensity={30} 
    // REMOVED: tint="dark" to let the purple overlay dominate
    style={styles.header}
  >
   {/* 💥 FIX 1: ABSOLUTELY POSITIONED PURPLE OVERLAY (Covers entire blur area) */}
   <View style={styles.absolutePurpleOverlay} /> 
   
   <SafeAreaView edges={["top"]}>
    {/* FIX 2: Using the content layout style */}
    <View style={styles.headerRowContent}> 
     <TouchableOpacity onPress={()=>navigation.goBack()}><FontAwesome5 name="arrow-left"size={20}color="#fff"/></TouchableOpacity>
     <TouchableOpacity onPress={()=>setProfileVisible(true)}><Image source={{uri:otherUser.avatar}}style={styles.headerAvatar}/></TouchableOpacity>
     <View style={{marginLeft:10,flex:1, marginBottom: -10}}>
      <View style={{flexDirection:"row",alignItems:"center"}}>
       <View style={[styles.statusDot,{backgroundColor:getStatusColor(otherUser.presence)}]}/>
       <Text style={styles.headerName}>{otherUser.displayName}</Text>
      </View>
      {otherUser.statusMessage&&<Text style={styles.statusMessageText}>{otherUser.statusMessage}</Text>}
     </View>
     <TouchableOpacity onPress={()=>Alert.alert("AI Concierge")}style={styles.menuBtn}><FontAwesome5 name="bolt"size={20}color="#fff"/></TouchableOpacity>
     <TouchableOpacity onPress={()=>setSettingsVisible(true)}style={styles.menuBtn}><FontAwesome5 name="ellipsis-v"size={20}color="#fff"/></TouchableOpacity>
    </View>
   </SafeAreaView>
  </BlurView>
 );

 // Input Context Helper
 const inputContextMessage = replyingToMessage || forwardingMessage;
 const inputContextType = replyingToMessage ? 'Reply' : forwardingMessage ? 'Forward' : null;
 const inputBottomPadding = keyboardIsVisible ? 12 : 30;
 const dynamicInputRowStyle = [
  styles.inputRowContent,
  { paddingBottom: inputBottomPadding }
 ];

 // Dynamic style for inputArea to adjust top padding when keyboard is visible
 const dynamicInputAreaStyle = [
    styles.inputArea,
    { paddingTop: keyboardIsVisible ? 6 : 10 } // 10 (default) - 4 = 6 when keyboard is visible
 ];

 return(
  <View style={styles.screen}>
   <StatusBar translucent backgroundColor="transparent"barStyle="light-content"/>
   {Header()}{ProfileCard()}{SettingsModal()}{MessageOptionsModal()}
   
   <KeyboardAvoidingView 
      behavior={Platform.OS==="ios"?"padding":"height"}
      style={{flex: 1}}
   >
    
    <FlatList 
      ref={flatListRef}
      data={dmMessages.slice().reverse()} 
      inverted={true}                     
      renderItem={renderMessage}
      keyExtractor={i=>String(i.id)}
      // 💥 FIX 4: ADDED/UPDATED paddingTop to push messages down below the floating header
      contentContainerStyle={{padding:16, paddingTop: 110}} 
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="never"
    />

    {/* Typing Indicator Placement: MOVED HERE, ABOVE inputArea */}
    {isTyping && typingIndicatorOn && <TypingIndicator />}

    {/* Input Area with Dynamic Padding */}
    <View style={dynamicInputAreaStyle}>
      
      {/* Input Context Preview */}
      {inputContextMessage && (
        <View style={styles.inputContextPreview}>
            <View style={styles.inputContextDetails}>
                <Text style={styles.inputContextType}>{inputContextType} to {inputContextMessage.sender}:</Text>
                <Text style={styles.inputContextText} numberOfLines={1}>
                    {inputContextMessage.text}
                </Text>
            </View>
            <TouchableOpacity onPress={() => {setReplyingToMessage(null); setForwardingMessage(null);}} style={styles.inputContextCloseBtn}>
                <FontAwesome5 name="times" size={16} color="#7C3AED" />
            </TouchableOpacity>
        </View>
      )}

      <View style={dynamicInputRowStyle}>
        
        {/* === NEW: Attachment Button (Icon Only, No background) === */}
        <TouchableOpacity 
            onPress={handleAttach}
            style={styles.attachBtn}
        >
          <FontAwesome5 name="paperclip" size={24} color="#fff" />
        </TouchableOpacity>
        {/* ========================================= */}
        
        <View style={styles.inputBox}>
          <TextInput 
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#6B7280"
            // MODIFIED: Conditionally apply italicInput style
            style={[styles.input, text.length === 0 && styles.italicInput]}
            multiline={true} 
            returnKeyType="default" 
            blurOnSubmit={false} 
          />
        </View>
        <TouchableOpacity onPress={handleSend}style={styles.sendBtn}><FontAwesome5 name="paper-plane"size={26}color="#fff"/></TouchableOpacity>
      </View>
    </View>
   </KeyboardAvoidingView>
  </View>
 );
}

// ----------------------------------------------------------------
// Styles (Patched for new indicator, reaction style, and blur)
// ----------------------------------------------------------------
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:"#F8F8FF"},
 
 // 💥 FIX 2: Header Styles REVERTED to original LinearGradient logic
 // NEW: Position absolute to float over FlatList and enable blur effect on content
 header:{
  width:"100%",
  position: 'absolute', // Make the header float
  top: -10,
  left: 0,
  right: 0,
  zIndex: 10, // Ensure it sits above the messages
 },

 // 💥 NEW STYLE: Covers the entire BlurView area with semi-transparent purple
 absolutePurpleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // CRITICAL: Stretches to the full height
    backgroundColor: 'rgba(124, 58, 237, 0.5)', // Semi-transparent purple
 },

 // MODIFIED: Renamed from headerRow to headerRowContent and increased padding
 headerRowContent:{flexDirection:"row",alignItems:"center",paddingHorizontal:16,paddingVertical:10,marginTop:-4},
 
 headerAvatar:{width:38,height:38,borderRadius:24,marginLeft:14,marginBottom:-6},
 menuBtn:{paddingHorizontal:8,paddingVertical:4},
 statusDot:{width:12,height:12,borderRadius:6,marginRight:6},
 headerName:{fontSize:16,fontWeight:"700",color:"#fff"},
 statusMessageText:{fontSize:12,color:"rgba(255,255,255,0.8)",marginTop:4,marginBottom:4},
 profileOverlay:{flex:1,backgroundColor:"rgba(0,0,0,0.5)",justifyContent:"center",alignItems:"center"},
 profileCard: {
  backgroundColor: "#fff",
  width: "80%",
  padding: 20,
  borderRadius: 50,
  alignItems: "center",
  
  // 🍎 iOS Shadow
  shadowColor: "#8a2be2", // A common vibrant purple (Blue Violet)
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 0.9, // Adjust for 'slight' glow
  shadowRadius: 10,   // Spread of the shadow (higher for glow)

  // 🤖 Android Shadow (Elevation adds a standard shadow/lift)
  // Note: True color glow isn't directly supported by 'elevation' 
  // without a third-party library or a complex custom approach.
  elevation: 5,
},
 profileAvatar:{width:90,height:90,borderRadius:24,marginBottom:12},
 avatarStatusDotBig:{position:"absolute",bottom:2,right:2,width:18,height:18,borderRadius:9},
 profileName:{fontSize:20,fontWeight:"700",color:"#111",marginBottom:4},
 profileStatusMessage:{fontSize:13,color:"#4B5563"},
 profilePresenceText:{color:"#6B7280",fontSize:12,marginBottom:10},
 profileBtns:{flexDirection:"row",marginVertical:10},
 profileBtn:{padding:10,borderRadius:5,marginHorizontal:8},
 closeProfileBtn:{marginTop:10,backgroundColor:"#E5E7EB",paddingVertical:8,paddingHorizontal:20,borderRadius:5},
 closeText:{fontWeight:"600",color:"#374151"},
 settingsModalContent:{backgroundColor:"#fff",width:"85%",padding:20,borderRadius:5},
 modalTitle:{fontSize:18,fontWeight:"700",color:"#111",marginBottom:15,textAlign:"center"},
 settingOption:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:12,borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
 settingOptionText:{fontSize:15,color:"#374151",fontWeight:"500"},
 deleteOption:{borderBottomWidth:0,marginTop:10},
 deleteText:{color:"#EF4444",fontSize:16,fontWeight:"500",marginLeft:15},
 closeModalBtn:{marginTop:15,backgroundColor:"#E5E7EB",paddingVertical:10,borderRadius:5,alignItems:"center"},
 closeTextModal:{fontWeight:"600",color:"#374151",fontSize:14},
 messageOptionsCard:{backgroundColor:"#fff",width:"70%",borderRadius:10,overflow:"hidden"},
 reactionRow:{flexDirection:"row",justifyContent:"space-around",paddingHorizontal:15,paddingVertical:10,borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
 reactionBtn:{padding:8,borderRadius:20,backgroundColor:"#F3F4F6"},
 reactionText:{fontSize:18},addReactionBtn:{backgroundColor:"#F3E8FF"},
 actionList:{paddingHorizontal:10,paddingVertical:5},
 actionOption:{flexDirection:"row",alignItems:"center",paddingVertical:12},
 actionOptionText:{marginLeft:15,fontSize:15,color:"#374151",fontWeight:"500"},
 deleteActionOption:{borderTopWidth:1,borderTopColor:"#F3F4F6",marginTop:5,paddingTop:15},
 deleteActionText:{color:"#EF4444"},
 msgRow:{flexDirection:"row",alignItems:"flex-end",marginBottom:4},
 avatarWrapper:{position:"relative"},
 msgAvatar:{width:28,height:28,borderRadius:24,marginHorizontal:6},
 avatarStatusDot:{position:"absolute",bottom:1,right:6,width:8,height:8,borderRadius:6},
 bubble:{maxWidth:"70%",paddingHorizontal:12,paddingVertical:8,borderRadius:16, position: 'relative'}, 
 bubbleMe:{backgroundColor:"#7C3AED",borderBottomRightRadius:2},
 bubbleOther:{backgroundColor:"#E5E7EB",borderBottomLeftRadius:2},
 msgText:{fontSize:19},
 msgMeText:{color:"#fff"},
 msgOtherText:{color:"#111"},
 
 // Reply/Forward Context INSIDE Bubble
 replyContext: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    overflow: 'hidden',
 },
 replyContextMe: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
 replyContextOther: { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
 replyBar: { width: 3, borderRadius: 1.5, marginRight: 8 },
 replySender: { fontSize: 11, fontWeight: '700' },
 // replyText is styled inline for color contrast
 // forwardContext styles remain the same
 forwardContext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
 },
 forwardText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },

 // 💥 FIX 1: Reaction Visual (UPDATED for circular badge, pinned to top-right of the bubble)
 reactionContainer: {
    position: 'absolute',
    top: -14, // Pin to the top
    right: -16, // Pin to the right
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 20,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
 },
 reactionContainerMe: { 
    // Uses the generic right: -10 setting above
 },
 reactionContainerOther: { 
    // Uses the generic right: -10 setting above
 },
 reactionTextBubble:{ 
   fontSize: 20,
   shadowColor: '#000',
   shadowOffset: { width: -1, height: 2 },
   shadowOpacity: 0.5,
   shadowRadius: 2,
 },



 statusRow:{
  flexDirection:"row",
  alignItems:"center",
  marginBottom:12,
},
 readReceiptAvatar:{
  width:16,
  height:16,
  borderRadius:24,
  marginTop: -7,
},
 timeTextUnder:{fontSize:10,color:"#6B7280"},
 timeSwipe:{fontSize:10,color:"#6B7280",marginBottom:3},
 timeRight:{alignSelf:"flex-end"},
 timeLeft:{alignSelf:"flex-start"},
 
 // ** NEW TYPING INDICATOR STYLES **
 typingIndicatorContainer:{
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start", // Aligns dots to the left
  marginHorizontal: 16,
  marginBottom: 10, // Sits directly on top of the next element
  marginTop: 5,
  alignSelf: "flex-start",
 },
 typingDotWrapper:{
  marginHorizontal: 2,
 },
 typingDot:{
  // The actual dot icon can be styled here if needed
 },
 // ** END NEW TYPING INDICATOR STYLES **
 
 typingWrapperFlow:{flexDirection:"row",alignItems:"center",paddingHorizontal:18,marginBottom:-8,marginTop:2},
 typingText:{marginLeft:6,fontStyle:"italic",color:"#fff",fontSize:14},
 
 // 💥 FIX 2: Input Area REVERTED to solid purple background
 inputArea:{backgroundColor:"#7C3AED",borderTopWidth:0,borderColor:"#7C3AED"}, // Removed fixed paddingTop: 10
 
 // Input Context Preview
 inputContextPreview: {
    backgroundColor: '#F3E8FF',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginHorizontal: 12,
    marginTop: 10,
 },
 inputContextDetails: { flex: 1, marginRight: 10 },
 inputContextType: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },
 inputContextText: { fontSize: 14, color: '#374151', marginTop: 2 },
 inputContextCloseBtn: { padding: 5 },

 inputRowContent:{flexDirection:"row",alignItems:"flex-end",padding:12}, 
 inputBox:{
  flex:1,
  backgroundColor:"#fff",
  paddingHorizontal:12,
  borderRadius:25,
  minHeight:38, 
  maxHeight: 38, 
  paddingVertical: 0, 
  justifyContent: 'center',
 },
 input:{
  fontSize:18,
  color:"#111",
  paddingVertical: 10, 
  // REMOVED: fontStyle: 'italic',
  ...(Platform.OS === 'android' ? {textAlignVertical: 'top'} : {}),
 },
 // ADDED: New style for italic placeholder
 italicInput: {
    fontStyle: 'italic',
 },
 // === NEW ATTACH BUTTON STYLE ===
 attachBtn: {
     justifyContent: "center",
     alignItems: "center",
     // Aligns the icon to the vertical center of the input box
     marginBottom: Platform.OS === 'android' ? 10 : 4, 
     marginRight: 8,
     padding: 4, // Makes the touch target a bit bigger
 },
 // ===============================
 sendBtn:{marginLeft:10,justifyContent:"center",alignItems:"center",marginBottom: Platform.OS === 'android' ? 10 : 4}, 
});