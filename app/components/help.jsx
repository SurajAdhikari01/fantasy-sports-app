import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";

const TeamGuideModal = ({ visible, onClose }) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/80 justify-center items-center px-6">
      <View className="bg-slate-800 w-full rounded-2xl p-5 max-w-xl shadow-lg">
        {/* Header */}
        <View className="flex-row items-center mb-3">
          <AntDesign name="questioncircleo" size={20} color="#a78bfa" />
          <Text className="text-white text-lg font-bold ml-2 flex-1">Team Management Guide</Text>
          <TouchableOpacity onPress={onClose} className="p-1 ml-2">
            <AntDesign name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
          {/* Dynamic Formation */}
          <Text className="text-purple-300 font-semibold mb-2">⚡ Dynamic Team Formation</Text>
          <Text className="text-slate-300 mb-3">
            Build your team in any formation! Add players of any position—your formation updates automatically.
          </Text>

          {/* Create Team */}
          <Text className="text-emerald-400 font-semibold mb-2">🏗️ How to Create a Team</Text>
          <View className="mb-3 pl-2">
            <Text className="text-slate-300 mb-1">1. <Text className="font-medium text-white">Tap an empty slot</Text> to add a player of any position.</Text>
            <Text className="text-slate-300 mb-1">2. <Text className="font-medium text-white">Fill all required slots</Text>. Your progress is shown under <Text className="text-emerald-300">Team Value</Text>.</Text>
            <Text className="text-slate-300 mb-1">3. <Text className="font-medium text-white">Save your team</Text> before the tournament stage deadline.</Text>
          </View>

          {/* Edit Team */}
          <Text className="text-yellow-300 font-semibold mb-2">✏️ How to Edit Your Team</Text>
          <View className="mb-3 pl-2">
            <Text className="text-slate-300 mb-1">• <Text className="font-medium text-white">You can only edit</Text> at the start of the Semifinal and Final stages.</Text>
            <Text className="text-slate-300 mb-1">• To edit: <Text className="font-medium text-white">Remove any player, select a new one (any position), and save.</Text></Text>
            <Text className="text-slate-400 text-xs mt-1 mb-1">Teams cannot be edited during knockout matches or between rounds.</Text>
          </View>

          {/* Tip Section */}
          <Text className="text-cyan-300 font-semibold mb-2">💡 Tip</Text>
          <Text className="text-slate-300">
            Changing a player's position lets you switch up your formation anytime. Be creative!
          </Text>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default TeamGuideModal;