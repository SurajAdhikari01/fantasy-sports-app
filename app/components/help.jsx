import React, { useState, useCallback } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, LayoutAnimation, UIManager, Platform } from "react-native";
import { AntDesign } from "@expo/vector-icons";

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Reusable Collapsible Section Component
const CollapsibleSection = ({ title, titleIconName, titleColor, children, initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const toggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <View className="mb-3">
      <TouchableOpacity onPress={toggleExpand} className="flex-row items-center mb-2">
        {titleIconName && <AntDesign name={titleIconName} size={16} color={titleColor || "#a78bfa"} className="mr-2" />}
        <Text className={`text-${titleColor || 'purple-300'} font-semibold flex-1`}>{title}</Text>
        <AntDesign name={isExpanded ? "up" : "down"} size={16} color="#94a3b8" />
      </TouchableOpacity>
      {isExpanded && (
        <View className="pl-2">
          {children}
        </View>
      )}
    </View>
  );
};


const TeamGuideModal = ({ visible, onClose }) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/80 justify-center items-center px-4 sm:px-6">
      <View className="bg-slate-800 w-full rounded-2xl p-5 max-w-lg shadow-lg border border-slate-700">
        {/* Header */}
        <View className="flex-row items-center mb-4 pb-3 border-b border-slate-700">
          <AntDesign name="questioncircleo" size={20} color="#a78bfa" />
          <Text className="text-white text-xl font-bold ml-2 flex-1">Team Management Guide</Text>
          <TouchableOpacity onPress={onClose} className="p-1 -mr-1">
            <AntDesign name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ maxHeight: 450 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>

          {/* Create Team Section */}
          <CollapsibleSection title="How to Create a Team" titleIconName="pluscircleo" titleColor="emerald-400" initialExpanded={true}>
            <Text className="text-slate-300 mb-1.5 text-sm">1. <Text className="font-medium text-white">Tap an empty slot</Text> on the field to open the player list.</Text>
            <Text className="text-slate-300 mb-1.5 text-sm">2. <Text className="font-medium text-white">Select a player</Text> of any position to add them.</Text>
            <Text className="text-slate-300 mb-1.5 text-sm">3. <Text className="font-medium text-white">Fill all required slots</Text>. Your progress is shown under <Text className="text-emerald-300 font-medium">Team Value</Text>.</Text>
            <Text className="text-slate-300 mb-1 text-sm">4. <Text className="font-medium text-white">Save your team</Text> before the tournament stage deadline.</Text>
          </CollapsibleSection>

          {/* Edit Team Section */}
          <CollapsibleSection title="How to Edit Your Team" titleIconName="edit" titleColor="yellow-300">
            <Text className="text-slate-300 mb-1.5 text-sm">• <Text className="font-medium text-white">Editing is allowed</Text> only before the Semifinal and Final stages begin.</Text>
            <Text className="text-slate-300 mb-1.5 text-sm">• To edit: <Text className="font-medium text-white">Tap a player</Text> to remove or replace them.</Text>
            <Text className="text-slate-300 mb-1 text-sm">• Select a new player (any position is fine) and ensure your team meets the requirements, then <Text className="font-medium text-white">save</Text>.</Text>
            <Text className="text-slate-400 text-xs mt-1">Teams cannot be edited during active knockout matches or between rounds of the same stage.</Text>
          </CollapsibleSection>

          {/* Tip Section (Could also be collapsible) */}
          <View className="mt-2 p-3 bg-slate-700/50 rounded-lg">
            <View className="flex-row items-center mb-1">
              <AntDesign name="bulb1" size={16} color="#67e8f9" className="mr-2" />
              <Text className="text-cyan-300 font-semibold">Tip</Text>
            </View>
            <Text className="text-slate-300 text-sm">
              Changing player positions allows you to dynamically switch your team's formation. Experiment to find what works best!
            </Text>
          </View>

        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default TeamGuideModal;