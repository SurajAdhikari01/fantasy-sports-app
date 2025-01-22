import React, { useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const PlayerCard = ({ player, isPitch, onPlayerPress, position, onRemovePlayer }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const cardStyle = position
    ? {
      position: "absolute",
      left: position.x,
      transform: [{ translateX: -32 }],
    }
    : {};

  return (
    <Animated.View
      style={[cardStyle, { opacity: fadeAnim }]}
      className={`${isPitch ? "bg-white/90 rounded-full shadow-lg w-16 h-16" : "bg-white rounded-2xl shadow-lg p-4 mb-3"}`}
    >
      <TouchableOpacity onPress={() => onPlayerPress(player)}>
        <View className="relative flex items-center justify-center py-2">
          {/* Add remove button for pitch view */}
          {isPitch && (
            <TouchableOpacity
              onPress={onRemovePlayer}
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                backgroundColor: 'red',
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
              }}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          )}
          <Image
            source={{ uri: player.photo }}
            className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-md"
          />
          <View className="absolute -bottom-0 right-1 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
            <Text className="text-xs font-bold text-white">
              {player.points}
            </Text>
          </View>
        </View>
        <View className={`${isPitch ? "mt-1" : "mt-4"}`}>
          <Text
            className={`font-bold ${isPitch ? "text-xs" : "text-base"} text-gray-400 ${isPitch ? "text-center" : ""}`}
            numberOfLines={1}
          >
            {player.name}
          </Text>
          {/* Always show remove button for non-pitch views */}
          {!isPitch && (
            <>
              <TouchableOpacity onPress={onRemovePlayer} style={{ marginTop: 4 }}>
                <Ionicons name="remove-circle" size={24} color="red" />
              </TouchableOpacity>
              <Text className="text-xs text-gray-600">{player.franchise?.name || "No Franchise"}</Text>
              <View className="flex-row mt-1">
                <Text className="text-xs text-gray-500 mr-3">{player.playerType}</Text>
                <Text className="text-xs text-gray-500">
                  <FontAwesome5 name="dollar-sign" size={12} color="#4B5563" />
                  {player.price}M
                </Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default PlayerCard;