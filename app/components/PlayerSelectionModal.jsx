import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const PlayerSelectionModal = ({
  visible,
  onClose,
  onSelectPlayer,
  availablePlayers,
  section,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(
      (player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availablePlayers, searchQuery]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-5">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl font-bold">Select {section}</Text>
            <TouchableOpacity onPress={onClose} className="ml-auto">
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="bg-gray-200 rounded-xl flex-row items-center px-4 mb-4">
            <Ionicons name="search" size={20} color="gray" />
            <TextInput
              placeholder="Search players..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 py-3 px-2"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredPlayers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelectPlayer(item)}
                className="bg-gray-200 rounded-xl p-4 mb-3 flex-row items-center"
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-16 h-16 rounded-full"
                />
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-bold">{item.name}</Text>
                  <Text className="text-gray-600">{item.team}</Text>
                  <View className="flex-row mt-2">
                    <View className="bg-blue-200 rounded-full px-3 py-1 mr-2">
                      <Text className="text-blue-600">${item.price}M</Text>
                    </View>
                    <View className="bg-green-200 rounded-full px-3 py-1">
                      <Text className="text-green-600">{item.points} pts</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="add-circle" size={24} color="black" />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default PlayerSelectionModal;
