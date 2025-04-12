import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { viewModeState } from "./atoms";

const PlayerCard = ({ player, isPitch, onPlayerPress, onRemovePlayer, position }) => {
  const viewMode = useRecoilValue(viewModeState); // Get the current view mode

  // Basic card for list views
  if (!isPitch) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          padding: 12,
          backgroundColor: "white",
          marginBottom: 8,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={() => onPlayerPress(player)}
      >
        <Image source={{ uri: player.photo }} style={{ width: 50, height: 50, borderRadius: 25 }} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{player.name}</Text>
          <Text style={{ color: "gray" }}>{player.playerType}</Text>
        </View>
        <Text style={{ fontWeight: "bold", color: "#3B82F6" }}>${player.price}M</Text>
      </TouchableOpacity>
    );
  }

  // Default position if none is provided
  const defaultPosition = { x: 0, y: 0 };
  const safePosition = position || defaultPosition;

  // Pitch view - players on the football field
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 90, // Increased height to accommodate name below
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderWidth: 2,
          borderColor: "#10B981",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity style={{ width: "100%", height: "100%" }} onPress={() => onPlayerPress(player)}>
          {player.photo ? (
            <Image source={{ uri: player.photo }} style={{ width: "100%", height: "100%", borderRadius: 30 }} />
          ) : (
            <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontWeight: "bold" }}>{player.name ? player.name.substring(0, 2).toUpperCase() : ""}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Conditionally render points or remove button */}
        {viewMode === "VIEW_TEAM" ? (
          // Display points in view mode
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              borderRadius: 10,
              width: 24,
              height: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>
              {player.points !== undefined ? player.points : 0}
            </Text>
          </View>
        ) : (
          // Display remove button in manage mode
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              borderRadius: 10,
              width: 20,
              height: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering parent touch
              onRemovePlayer(player);
            }}
          >
            <Ionicons name="close" size={12} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Player name under the circle */}
      <Text
        style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          fontSize: 10,
          marginTop: 4,
          maxWidth: 70,
          textAlign: "center",
          overflow: "hidden",
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {player.name}
      </Text>
    </View>
  );
};

export default PlayerCard;