import React from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Text,
  ScrollView,
} from "react-native";
import PlayerCard from "./PlayerCard";
import footballPitch from "../../assets/football-field.jpg";

const PitchView = ({
  teamData,
  handlePlayerPress,
  handleOpenPlayerSelection,
}) => {
  // Dynamic position calculation based on number of players in each section
  const calculateDynamicPositions = (section, numPlayers) => {
    const positions = [];

    switch (section) {
      case "Goalkeepers":
        // Single goalkeeper position
        positions.push({ x: 50, y: 90 });
        break;

      case "Defenders":
        // Minimum 3 defenders, spread across the back
        for (let i = 0; i < numPlayers; i++) {
          positions.push({
            x: 20 + (60 / Math.max(1, numPlayers - 1)) * i,
            y: 70,
          });
        }
        break;

      case "Midfielders":
        // Minimum 3 midfielders, spread in middle
        for (let i = 0; i < numPlayers; i++) {
          positions.push({
            x: 20 + (60 / Math.max(1, numPlayers - 1)) * i,
            y: 45,
          });
        }
        break;

      case "Forwards":
        // Minimum 1 forward, spread at front
        for (let i = 0; i < numPlayers; i++) {
          positions.push({
            x: 35 + (30 / Math.max(1, numPlayers - 1)) * i,
            y: 20,
          });
        }
        break;
    }

    return positions;
  };

  const renderPlaceholders = (section, players) => {
    const positions = calculateDynamicPositions(section, players.length + 1);
    const placeholders = [];

    // Render existing players
    players.forEach((player, i) => {
      const position = positions[i];
      placeholders.push(
        <PlayerCard
          key={player.id}
          player={player}
          isPitch={true}
          onPlayerPress={handlePlayerPress}
          position={position}
        />
      );
    });

    // Add one placeholder position for each section
    const nextPosition = positions[players.length];
    if (nextPosition) {
      placeholders.push(
        <TouchableOpacity
          key={`${section}-add`}
          style={{
            position: "absolute",
            top: `${nextPosition.y}%`,
            left: `${nextPosition.x}%`,
            width: 50,
            height: 50,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 25,
            borderWidth: 1,
            borderColor: "#ccc",
            transform: [{ translateX: -25 }, { translateY: -25 }],
          }}
          onPress={() => handleOpenPlayerSelection(section)}
        >
          <Text style={{ fontSize: 24, color: "#666" }}>+</Text>
        </TouchableOpacity>
      );
    }

    return placeholders;
  };

  const renderSubstitutes = (players) => {
    // const substitutes = players.slice(positionConfig[players[0]?.role] || 0);
    const substitutes = players;
    return (
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {substitutes.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isPitch={false}
                onPlayerPress={handlePlayerPress}
              />
            ))}
            <TouchableOpacity
              style={{
                width: 64,
                height: 64,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 32,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ccc",
                marginLeft: 8,
              }}
              onPress={() => handleOpenPlayerSelection("Substitutes")}
            >
              <Text style={{ fontSize: 24, color: "#666" }}>+</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Image
        source={footballPitch}
        style={{
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
          position: "absolute",
          borderRadius: 8,
          transform: [
            { perspective: 500 },
            { rotateX: "60deg" },
            { scale: 1.2 },
          ],
        }}
        resizeMode="cover"
      />

      {/* Main formation */}
      {Object.entries(teamData).map(([section, players]) =>
        renderPlaceholders(section, players)
      )}

      {/* Substitutes bench */}
      {renderSubstitutes(Object.values(teamData).flat())}
    </View>
  );
};

export default PitchView;
