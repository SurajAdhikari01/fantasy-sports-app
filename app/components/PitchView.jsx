import { useState, useEffect } from "react";
import { View, TouchableOpacity, Dimensions, Image } from "react-native";
import PlayerCard from "./PlayerCard";
import { FontAwesome5 } from "@expo/vector-icons";
import footballPitch from "../../assets/football-field.jpg";
import { useRecoilValue } from "recoil";
import { sportState, playerLimitState, viewModeState } from "./atoms";

// Get the width and height of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Calculate player positions according to football formations
// ... (calculatePositions function remains the same) ...
const calculatePositions = (numPlayers, teamData) => {
  const validNumPlayers = Math.max(0, Number(numPlayers) || 0);

  // Initialize arrays for different player types
  let goalkeepers = [];
  let defenders = [];
  let midfielders = [];
  let forwards = [];
  let allPlayers = [];

  // Check if teamData has an "all" property (viewing mode)
  if (teamData && teamData.all && Array.isArray(teamData.all)) {
    allPlayers = teamData.all;

    // Categorize players by their playerType using exact position values
    goalkeepers = allPlayers.filter(
      (p) => p?.playerType?.toLowerCase() === "goalkeeper"
    );

    defenders = allPlayers.filter(
      (p) => p?.playerType?.toLowerCase() === "defender"
    );

    midfielders = allPlayers.filter(
      (p) => p?.playerType?.toLowerCase() === "midfielder"
    );

    forwards = allPlayers.filter(
      (p) => p?.playerType?.toLowerCase() === "forward"
    );

    // Handle players with unknown position types
    const unknownPositions = allPlayers.filter((p) => {
      const type = p?.playerType?.toLowerCase() || "";
      return !["goalkeeper", "defender", "midfielder", "forward"].includes(
        type
      );
    });

    // Assign unknown positions to midfielders by default
    midfielders = [...midfielders, ...unknownPositions];

    // Debug log
    console.log("Player distribution:", {
      goalkeepers: goalkeepers.length,
      defenders: defenders.length,
      midfielders: midfielders.length,
      forwards: forwards.length,
      unknown: unknownPositions.length,
      total: allPlayers.length,
    });
  } else {
    // Original behavior for creation mode - extract from teamData object
    if (teamData && typeof teamData === "object") {
      goalkeepers = Array.isArray(teamData.goalkeepers)
        ? teamData.goalkeepers
        : [];
      defenders = Array.isArray(teamData.defenders) ? teamData.defenders : [];
      midfielders = Array.isArray(teamData.midfielders)
        ? teamData.midfielders
        : [];
      forwards = Array.isArray(teamData.forwards) ? teamData.forwards : [];
      allPlayers = [...goalkeepers, ...defenders, ...midfielders, ...forwards];
    } else {
      console.warn("Invalid teamData format:", teamData);
      allPlayers = [];
    }
  }

  const positions = [];
  const currentPlayers = allPlayers.filter((p) => p).length;
  let emptySlots = Math.max(0, validNumPlayers - currentPlayers);

  // Define margins to prevent players from being positioned outside visible area
  const marginX = 0; // 12% margin from the sides
  const marginY = 0; // 10% margin from top/bottom
  const fieldWidth = 100 - marginX * 2; // Usable width
  const centerX = 50; // Center point

  // Enhanced Y positions with more distinct separation between layers
  // Improved vertical spacing to create clear layers
  const gkY = 88 - marginY; // Goalkeeper at bottom (higher percentage = lower on screen)
  const defY = 70; // Defenders above goalkeeper
  const midY = 45; // Midfielders in middle
  const fwdY = marginY + 10; // Forwards at top

  // Ensure there's always exactly 1 goalkeeper
  // If no goalkeeper exists, create an empty slot
  // If multiple goalkeepers exist, only use the first one
  let gkPlayer = null;
  if (goalkeepers.length > 0) {
    gkPlayer = goalkeepers[0];
  }

  // Add goalkeeper position
  positions.push({
    player: gkPlayer,
    x: centerX,
    y: gkY,
    section: "goalkeepers",
    positionId: gkPlayer ? `gk-0` : `empty-gk-0`,
  });

  // If there was no goalkeeper and we have empty slots, reduce count
  if (!gkPlayer && emptySlots > 0) {
    emptySlots--;
  }

  // Calculate max players per row to avoid overcrowding
  const maxDefenders = Math.min(5, defenders.length || 4);
  const maxMidfielders = Math.min(5, midfielders.length || 4);
  const maxForwards = Math.min(3, forwards.length || 2);

  // Defenders positioning - evenly spaced across field width
  const defCount = defenders.length;
  // If more than maxDefenders, create a second row slightly higher up
  const defFirstRowCount = Math.min(maxDefenders, defCount);
  const defSecondRowCount = Math.max(0, defCount - maxDefenders);

  // First row of defenders
  if (defFirstRowCount > 0) {
    const defSpacing = fieldWidth / (defFirstRowCount + 1);
    const defStartX = marginX + defSpacing;

    for (let i = 0; i < defFirstRowCount; i++) {
      positions.push({
        player: defenders[i],
        x: defStartX + i * defSpacing,
        y: defY,
        section: "defenders",
        positionId: `def-${i}`,
      });
    }
  }

  // Second row of defenders if needed
  if (defSecondRowCount > 0) {
    const defSpacing = fieldWidth / (defSecondRowCount + 1);
    const defStartX = marginX + defSpacing;

    for (let i = 0; i < defSecondRowCount; i++) {
      positions.push({
        player: defenders[i + defFirstRowCount],
        x: defStartX + i * defSpacing,
        y: defY - 8, // Position slightly higher than first row
        section: "defenders",
        positionId: `def-${i + defFirstRowCount}`,
      });
    }
  }

  // Create empty defender slots if needed
  const defToAdd = Math.min(emptySlots, Math.max(0, 4 - defCount));
  if (defToAdd > 0) {
    const defEmptySpacing = fieldWidth / (defToAdd + 1);
    const defEmptyStartX = marginX + defEmptySpacing;

    for (let i = 0; i < defToAdd; i++) {
      positions.push({
        player: null,
        x: defEmptyStartX + i * defEmptySpacing,
        y: defY,
        section: "defenders",
        positionId: `empty-def-${i}`,
      });
    }
    emptySlots -= defToAdd;
  }

  // Midfielders positioning - using staggered formation for better distribution
  const midCount = midfielders.length;
  // Create two rows of midfielders for better spacing
  const midFirstRowCount = Math.ceil(Math.min(maxMidfielders, midCount) / 2);
  const midSecondRowCount =
    Math.min(maxMidfielders, midCount) - midFirstRowCount;
  const remainingMids = Math.max(0, midCount - maxMidfielders);

  // First row of midfielders
  if (midFirstRowCount > 0) {
    const midSpacing = fieldWidth / (midFirstRowCount + 1);
    const midStartX = marginX + midSpacing;

    for (let i = 0; i < midFirstRowCount; i++) {
      positions.push({
        player: midfielders[i],
        x: midStartX + i * midSpacing,
        y: midY - 5, // Slightly above center
        section: "midfielders",
        positionId: `mid-${i}`,
      });
    }
  }

  // Second row of midfielders
  if (midSecondRowCount > 0) {
    const midSpacing = fieldWidth / (midSecondRowCount + 1);
    const midStartX = marginX + midSpacing;

    for (let i = 0; i < midSecondRowCount; i++) {
      positions.push({
        player: midfielders[i + midFirstRowCount],
        x: midStartX + i * midSpacing,
        y: midY + 5, // Slightly below center
        section: "midfielders",
        positionId: `mid-${i + midFirstRowCount}`,
      });
    }
  }

  // Additional midfielders if any
  if (remainingMids > 0) {
    const extraRowCount = Math.min(remainingMids, 3); // Max 3 per extra row
    const midExtraSpacing = fieldWidth / (extraRowCount + 1);
    const midExtraStartX = marginX + midExtraSpacing;

    for (let i = 0; i < extraRowCount; i++) {
      positions.push({
        player: midfielders[i + midFirstRowCount + midSecondRowCount],
        x: midExtraStartX + i * midExtraSpacing,
        y: midY - 15, // Position higher up
        section: "midfielders",
        positionId: `mid-extra-${i}`,
      });
    }

    // If we still have more mids, add another row lower
    const remainingAfterExtra = remainingMids - extraRowCount;
    if (remainingAfterExtra > 0) {
      const extraRow2Count = Math.min(remainingAfterExtra, 3);
      const midExtraSpacing2 = fieldWidth / (extraRow2Count + 1);
      const midExtraStartX2 = marginX + midExtraSpacing2;

      for (let i = 0; i < extraRow2Count; i++) {
        positions.push({
          player:
            midfielders[
              i + midFirstRowCount + midSecondRowCount + extraRowCount
            ],
          x: midExtraStartX2 + i * midExtraSpacing2,
          y: midY + 15, // Position lower down
          section: "midfielders",
          positionId: `mid-extra2-${i}`,
        });
      }
    }
  }

  // Create empty midfielder slots if needed
  const midToAdd = Math.min(emptySlots, Math.max(0, 4 - midCount));
  if (midToAdd > 0) {
    const midEmptySpacing = fieldWidth / (midToAdd + 1);
    const midEmptyStartX = marginX + midEmptySpacing;

    for (let i = 0; i < midToAdd; i++) {
      positions.push({
        player: null,
        x: midEmptyStartX + i * midEmptySpacing,
        y: midY + (i % 2 === 0 ? -5 : 5), // Stagger empty slots
        section: "midfielders",
        positionId: `empty-mid-${i}`,
      });
    }
    emptySlots -= midToAdd;
  }

  // Forwards positioning - at the top of the field
  const fwdCount = forwards.length;
  // If more than maxForwards, create a second row
  const fwdFirstRowCount = Math.min(maxForwards, fwdCount);
  const fwdSecondRowCount = Math.max(0, fwdCount - maxForwards);

  // First row of forwards
  if (fwdFirstRowCount > 0) {
    const fwdSpacing = fieldWidth / (fwdFirstRowCount + 1);
    const fwdStartX = marginX + fwdSpacing;

    for (let i = 0; i < fwdFirstRowCount; i++) {
      positions.push({
        player: forwards[i],
        x: fwdStartX + i * fwdSpacing,
        y: fwdY,
        section: "forwards",
        positionId: `fwd-${i}`,
      });
    }
  }

  // Second row of forwards if needed
  if (fwdSecondRowCount > 0) {
    const fwdSpacing = fieldWidth / (fwdSecondRowCount + 1);
    const fwdStartX = marginX + fwdSpacing;

    for (let i = 0; i < fwdSecondRowCount; i++) {
      positions.push({
        player: forwards[i + fwdFirstRowCount],
        x: fwdStartX + i * fwdSpacing,
        y: fwdY + 10, // Position slightly lower
        section: "forwards",
        positionId: `fwd-${i + fwdFirstRowCount}`,
      });
    }
  }

  // Create empty forward slots if needed
  const fwdToAdd = Math.min(emptySlots, Math.max(0, 3 - fwdCount));
  if (fwdToAdd > 0) {
    const fwdEmptySpacing = fieldWidth / (fwdToAdd + 1);
    const fwdEmptyStartX = marginX + fwdEmptySpacing;

    for (let i = 0; i < fwdToAdd; i++) {
      positions.push({
        player: null,
        x: fwdEmptyStartX + i * fwdEmptySpacing,
        y: fwdY,
        section: "forwards",
        positionId: `empty-fwd-${i}`,
      });
    }
    emptySlots -= fwdToAdd;
  }

  // Add any remaining empty slots strategically
  if (emptySlots > 0) {
    const sections = ["defenders", "midfielders", "forwards"];
    const yPositions = [defY + 10, midY, fwdY + 5]; // Adjust positions to avoid overlap

    let slotIndex = 0;
    while (emptySlots > 0) {
      const sectionIndex = slotIndex % sections.length;
      const section = sections[sectionIndex];
      const yPos = yPositions[sectionIndex];

      // Place at the edges to minimize overlaps
      const xPos = slotIndex % 2 === 0 ? marginX + 7 : 100 - marginX - 7;

      positions.push({
        player: null,
        x: xPos,
        y: yPos,
        section: section,
        positionId: `empty-extra-${section}-${slotIndex}`,
      });

      slotIndex++;
      emptySlots--;
    }
  }

  return positions;
};

const PitchView = ({
  teamData,
  handleOpenPlayerSelection,
  handleRemovePlayer,
}) => {
  const [containerDimensions, setContainerDimensions] = useState({
    width: screenWidth,
    height: screenHeight * 0.6,
  });

  const handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  const sport = useRecoilValue(sportState);
  const playerLimit = useRecoilValue(playerLimitState);
  const viewMode = useRecoilValue(viewModeState);

  // Determine if we're in view mode
  const isViewMode = viewMode === "VIEW_TEAM";

  // Function to calculate player points from team data
  const calculatePlayerPoints = (player) => {
    // If not in view mode or player doesn't exist, return undefined
    if (!isViewMode || !player || !player._id) return undefined;

    // Check if team data has points array
    if (!teamData || !teamData.points || !Array.isArray(teamData.points)) {
      return 0;
    }

    // Sum up all points for this player across all matches
    let totalPoints = 0;

    teamData.points.forEach((matchData) => {
      if (matchData?.players && Array.isArray(matchData.players)) {
        const playerPointEntry = matchData.players.find(
          (p) => p?.playerId === player._id
        );
        if (playerPointEntry && typeof playerPointEntry.points === "number") {
          totalPoints += playerPointEntry.points;
        }
      }
    });

    return totalPoints;
  };

  // Calculate positions based on player types and available players
  // Recalculate when teamData or playerLimit changes
  const positions = calculatePositions(playerLimit, teamData);

  const onReplacePlayer = (player) => {
    // Determine player section based on player type using exact position value
    let section = "midfielders"; // Default section
    if (player?.playerType) {
      const type = player.playerType.toLowerCase();
      switch (type) {
        case "goalkeeper":
          section = "goalkeepers";
          break;
        case "defender":
          section = "defenders";
          break;
        case "midfielder":
          section = "midfielders";
          break;
        case "forward":
          section = "forwards";
          break;
        // Default is already "midfielders"
      }
    }

    // Find position information for this player
    const playerPos = positions.find(
      (pos) => pos.player && pos.player._id === player._id
    );
    const positionId =
      playerPos?.positionId || `replace-${player._id || Date.now()}`;
    const coordinates = playerPos
      ? {
          x: (playerPos.x / 100) * containerDimensions.width,
          y: (playerPos.y / 100) * containerDimensions.height,
        }
      : undefined;

    // To handle max player limit, remove the player being replaced without alert
    handleRemovePlayer(player, true); // Pass true to skip the alert

    // Then open player selection for the same position
    handleOpenPlayerSelection(section, positionId, coordinates);
  };

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden", // Prevent content from overflowing
      }}
      onLayout={handleLayout}
    >
      <Image
        source={footballPitch}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          borderRadius: 8,
          // Removed perspective transforms:
          // transform: [
          //   { perspective: 400 },
          //   { rotateX: "30deg" },
          //   { scale: 1.1 },
          // ],
        }}
        resizeMode="cover" // Cover for better field display
      />

      {positions.map((position, index) => {
        const player = position.player;
        // Calculate absolute positions based on percentages
        const posX = (position.x / 100) * containerDimensions.width;
        const posY = (position.y / 100) * containerDimensions.height;

        // Calculate player points if in view mode and player exists
        const playerPoints = player ? calculatePlayerPoints(player) : undefined;

        return player ? (
          <View
            key={position.positionId || `player-${player._id || index}`}
            style={{
              position: "absolute",
              left: posX,
              top: posY,
              transform: [{ translateX: -32 }, { translateY: -32 }], // Center the player card
              zIndex: 10, // Ensure players are above empty slots
            }}
          >
            <PlayerCard
              key={`player-card-${player._id || index}`}
              player={player}
              isPitch={true}
              onRemovePlayer={() => handleRemovePlayer(player)}
              onReplacePlayer={onReplacePlayer}
              position={{ x: posX, y: posY }}
              playerPoints={playerPoints} // Pass player points to PlayerCard
            />
          </View>
        ) : (
          // Only show empty slots in creation mode, not in view mode
          !isViewMode && (
            <TouchableOpacity
              key={`slot-${position.positionId || index}`}
              style={{
                position: "absolute",
                left: posX,
                top: posY,
                transform: [{ translateX: -32 }, { translateY: -32 }], // Center the plus icon
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
              onPress={() =>
                handleOpenPlayerSelection(
                  position.section,
                  position.positionId,
                  { x: posX, y: posY }
                )
              }
            >
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: 32,
                  width: 64,
                  height: 64,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#ccc",
                  borderStyle: "dashed",
                }}
              >
                <FontAwesome5 name="plus" size={24} color="#3B82F6" />
              </View>
            </TouchableOpacity>
          )
        );
      })}
    </View>
  );
};

export default PitchView;
