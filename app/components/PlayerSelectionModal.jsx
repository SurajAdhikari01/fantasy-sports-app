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
  // State for managing search query
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filtered list of players based on the search query
  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(
      (player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availablePlayers, searchQuery]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <View style={{ backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20 }}>

          {/* Modal header */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>Select {section}</Text>
            <TouchableOpacity onPress={onClose} style={{ marginLeft: "auto" }}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Search input */}
          <View style={{ backgroundColor: "#E5E7EB", borderRadius: 10, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16 }}>
            <Ionicons name="search" size={20} color="gray" />
            <TextInput
              placeholder="Search players..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8 }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>

          {/* Player list */}
          <FlatList
            data={filteredPlayers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelectPlayer(item)}
                style={{ backgroundColor: "#E5E7EB", borderRadius: 10, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center" }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
                  <Text style={{ color: "#6B7280" }}>{item.team}</Text>
                  <View style={{ flexDirection: "row", marginTop: 8 }}>
                    <View style={{ backgroundColor: "#BFDBFE", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8 }}>
                      <Text style={{ color: "#3B82F6" }}>${item.price}M</Text>
                    </View>
                    <View style={{ backgroundColor: "#D1FAE5", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
                      <Text style={{ color: "#10B981" }}>{item.points} pts</Text>
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