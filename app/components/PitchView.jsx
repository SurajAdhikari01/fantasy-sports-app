import React from "react";
import { View, TouchableOpacity, Dimensions, Image } from "react-native";
import PlayerCard from "./PlayerCard";
import { FontAwesome5 } from "@expo/vector-icons";
import footballPitch from "../../assets/football-field.jpg";
import { useRecoilValue } from "recoil";
import { sportState } from "./atoms";
import { SPORT_CONFIGS } from "./sportConfigs"; 

// Get the width and height of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Calculate positions of players on the pitch
const calculatePositions = (section, numPlayers) => {
  const positions = [];
  const spacing = screenWidth / (numPlayers + 1);

  // Define y-positions for different sections
  const yPositions = {
    forwards: 15,
    midfielders: 40,
    defenders: 65,
    goalkeepers: 85,
  };

  for (let i = 0; i < numPlayers; i++) {
    positions.push({
      x: spacing * (i + 1),
      y: yPositions[section] || 85,
    });
  }

  return positions;
};

const PitchView = ({
  teamData,
  handlePlayerPress,
  handleOpenPlayerSelection,
}) => {
  const sport = useRecoilValue(sportState);

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: screenHeight * 0.8, // Use 80% of screen height
        backgroundColor: "transparent",
        position: "relative",
      }}
    >
      <Image
        source={footballPitch}
        style={{
          width: screenWidth,
          height: screenHeight,
          position: "absolute",
          borderRadius: 8,
          transform: [
            { perspective: 400 },
            { rotateX: "30deg" },
            { scale: 1.7 },
          ],
        }}
        resizeMode="cover"
      />
      {Object.keys(teamData).map((section) => {
        const numPlayers = SPORT_CONFIGS[sport].sections[section]?.max || 1;
        const positions = calculatePositions(section, numPlayers);

        return (
          <View
            key={section}
            style={{
              width: "100%",
              height: "25%", // Each section takes 25% of the container height
              position: "absolute",
              top: positions[0].y + "%", // Position each section absolutely based on first player's y position
            }}
          >
            {positions.map((position, index) => {
              const player = teamData[section][index];
              return player ? (
                <PlayerCard
                  key={player._id} // Corrected player id
                  player={player}
                  isPitch={true}
                  onPlayerPress={handlePlayerPress}
                  position={{
                    x: position.x,
                    y: 0, // Since parent View is absolutely positioned, y should be 0
                  }}
                />
              ) : (
<TouchableOpacity
                  key={`${section}-${index}`}
                  style={{
                    position: "absolute",
                    left: position.x,
                    transform: [{ translateX: -32 }], // Center horizontally
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => handleOpenPlayerSelection(section)}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: 50,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                      width: 64,
                      height: 64,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome5 name="plus" size={24} color="blue" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

export default PitchView;