import { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, Dimensions, Alert } from "react-native";
import PlayerCard from "./PlayerCard";
import { FontAwesome5 } from "@expo/vector-icons";
import footballPitch from "../../assets/football-field.jpg";
import { useRecoilValue } from "recoil";
import { sportState, playerLimitState, viewModeState } from "./atoms";

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Helper: ensure at least 1 for each outfield line if total players is less
function getSectionDistribution(numPlayers) {
  // Base minimums: 1 GK, 1 DEF, 1 MID, 1 FWD (if enough players)
  if (numPlayers <= 1) {
    return { gk: 1, def: 0, mid: 0, fwd: 0 };
  }
  if (numPlayers === 2) {
    return { gk: 1, def: 1, mid: 0, fwd: 0 };
  }
  if (numPlayers === 3) {
    return { gk: 1, def: 1, mid: 0, fwd: 1 };
  }
  if (numPlayers === 4) {
    return { gk: 1, def: 1, mid: 1, fwd: 1 };
  }

  // For 5+, follow the specific distribution logic from requirements
  const gk = 1;
  let def = 1, mid = 1, fwd = 1;

  // Define minimums for each position when we have 5+ players
  const MIN_DEF = 1;
  const MIN_MID = 1;
  const MIN_FWD = 1;

  // Extra players distribution based on the rules
  if (numPlayers >= 5) def++; // 5 players: add 1 DEF (becomes 2 DEF)

  // Player 6-7: Add to MID or FWD (flexible)
  let remaining = numPlayers - 5;
  if (remaining > 0) {
    // Default priority: add to MID first
    mid += Math.min(2, remaining);
    remaining -= Math.min(2, remaining);
  }

  // Player 8: Must add 1 DEF (becomes 3 DEF)
  if (numPlayers >= 8) {
    def++;
    remaining = numPlayers - 8;
  }

  // Player 9: Add to MID or FWD
  if (remaining > 0) {
    mid++;
    remaining--;
  }

  // Player 10: Must add 1 DEF (becomes 4 DEF)
  if (numPlayers >= 10) {
    def++;
    remaining = numPlayers - 10;
  }

  // Player 11: Add to MID or FWD
  if (remaining > 0) {
    mid++;
    remaining--;
  }

  // Apply hard caps while ensuring minimums
  // Ensure we never go below minimum requirements for each position
  def = Math.min(Math.max(def, MIN_DEF), 4);
  mid = Math.min(Math.max(mid, MIN_MID), 5);
  fwd = Math.min(Math.max(fwd, MIN_FWD), 3);

  // Check if total exceeds numPlayers and adjust accordingly
  let total = gk + def + mid + fwd;
  if (total > numPlayers) {
    // We need to reduce while respecting minimums
    let excess = total - numPlayers;

    // Reduce in this order: MID, DEF, FWD (but never below minimums)
    while (excess > 0 && mid > MIN_MID) {
      mid--;
      excess--;
    }
    while (excess > 0 && def > MIN_DEF) {
      def--;
      excess--;
    }
    while (excess > 0 && fwd > MIN_FWD) {
      fwd--;
      excess--;
    }

    // If we still have excess, we cannot satisfy both constraints
    if (excess > 0) {
      console.warn("Cannot satisfy both max players and minimum position requirements");
    }
  }

  return { gk, def, mid, fwd };
}

// Calculate player positions for the football pitch
const calculatePositions = (numPlayers, teamData) => {
  const validNumPlayers = Math.max(0, Number(numPlayers) || 0);
  if (!Number.isFinite(validNumPlayers) || validNumPlayers <= 0) return [];

  let goalkeepers = [],
    defenders = [],
    midfielders = [],
    forwards = [],
    allPlayers = [];

  // For "view all" mode
  if (teamData && teamData.all && Array.isArray(teamData.all)) {
    allPlayers = teamData.all;
    goalkeepers = allPlayers.filter(
      (p) =>
        p?.playerType?.toLowerCase().includes("goalkeeper") ||
        p?.playerType?.toLowerCase().includes("goalie")
    );
    defenders = allPlayers.filter(
      (p) =>
        p?.playerType?.toLowerCase().includes("defender") ||
        p?.playerType?.toLowerCase().includes("defence")
    );
    midfielders = allPlayers.filter(
      (p) =>
        p?.playerType?.toLowerCase().includes("midfielder") ||
        p?.playerType?.toLowerCase().includes("midfield")
    );
    forwards = allPlayers.filter(
      (p) =>
        p?.playerType?.toLowerCase().includes("forward") ||
        p?.playerType?.toLowerCase().includes("striker") ||
        p?.playerType?.toLowerCase().includes("attack")
    );
    const unknownPositions = allPlayers.filter((p) => {
      const type = p?.playerType?.toLowerCase() || "";
      return !(
        type.includes("goalkeeper") ||
        type.includes("goalie") ||
        type.includes("defender") ||
        type.includes("defence") ||
        type.includes("midfielder") ||
        type.includes("midfield") ||
        type.includes("forward") ||
        type.includes("striker") ||
        type.includes("attack")
      );
    });
    midfielders = [...midfielders, ...unknownPositions];
  } else {
    if (teamData && typeof teamData === "object") {
      goalkeepers = Array.isArray(teamData.goalkeepers) ? teamData.goalkeepers : [];
      defenders = Array.isArray(teamData.defenders) ? teamData.defenders : [];
      midfielders = Array.isArray(teamData.midfielders) ? teamData.midfielders : [];
      forwards = Array.isArray(teamData.forwards) ? teamData.forwards : [];
      allPlayers = [...goalkeepers, ...defenders, ...midfielders, ...forwards];
    } else {
      allPlayers = [];
    }
  }

  const currentCounts = {
    gk: goalkeepers.length || 0,
    def: defenders.length || 0,
    mid: midfielders.length || 0,
    fwd: forwards.length || 0
  };

  // Total current players
  const currentPlayerCount = Object.values(currentCounts).reduce((a, b) => a + b, 0);

  // Calculate ideal distribution based on max player count
  const idealDist = getSectionDistribution(validNumPlayers);

  // Calculate remaining slots available in each section
  const remainingSlots = {
    gk: Math.max(0, idealDist.gk - currentCounts.gk),
    def: Math.max(0, idealDist.def - currentCounts.def),
    mid: Math.max(0, idealDist.mid - currentCounts.mid),
    fwd: Math.max(0, idealDist.fwd - currentCounts.fwd)
  };

  // Calculate minimum required players for each section
  const minRequirements = {
    gk: 1,
    def: validNumPlayers >= 2 ? 1 : 0,
    mid: validNumPlayers >= 4 ? 1 : 0,
    fwd: validNumPlayers >= 3 ? 1 : 0
  };

  // Apply minimum requirements and current counts
  const sections = [
    { key: "goalkeepers", arr: goalkeepers, max: 1, min: minRequirements.gk },
    { key: "defenders", arr: defenders, max: 4, min: minRequirements.def },
    { key: "midfielders", arr: midfielders, max: 5, min: minRequirements.mid },
    { key: "forwards", arr: forwards, max: 3, min: minRequirements.fwd },
  ];

  // Create position slots with players first, then add empty slots
  let positions = [];

  // Add existing players first
  sections.forEach(({ key, arr }) => {
    arr.forEach((player, idx) => {
      positions.push({
        player,
        section: key,
        positionId: `${key.slice(0, 3)}-${idx}`
      });
    });
  });

  // Determine remaining slots to add
  const remainingSlotsCount = validNumPlayers - currentPlayerCount;
  if (remainingSlotsCount > 0) {
    // Priority order for adding slots
    const sectionPriority = ["goalkeepers", "defenders", "midfielders", "forwards"];

    // Add empty slots based on section priority and remaining count
    let slotsToAdd = remainingSlotsCount;
    sectionPriority.forEach(sectionKey => {
      if (slotsToAdd <= 0) return;

      const section = sections.find(s => s.key === sectionKey);
      const currentSectionCount = positions.filter(p => p.section === sectionKey).length;
      const idealSectionCount = sectionKey === "goalkeepers" ? idealDist.gk :
        sectionKey === "defenders" ? idealDist.def :
          sectionKey === "midfielders" ? idealDist.mid : idealDist.fwd;

      const slotsNeeded = Math.max(0, idealSectionCount - currentSectionCount);
      const slotsToAddInSection = Math.min(slotsToAdd, slotsNeeded);

      for (let i = 0; i < slotsToAddInSection; i++) {
        positions.push({
          player: null,
          section: sectionKey,
          positionId: `empty-${sectionKey.slice(0, 3)}-${currentSectionCount + i}`
        });
      }

      slotsToAdd -= slotsToAddInSection;
    });
  }

  // Placement constants
  const fieldWidth = 90; // percent
  const centerX = 50;
  const gkY = 85,
    defY = 65,
    midY = 40,
    fwdY = 15;

  // Transform positions array to include coordinates
  const positionsWithCoordinates = [];

  // Process by section for positional arrangement
  const gkPositions = positions.filter(p => p.section === "goalkeepers");
  const defPositions = positions.filter(p => p.section === "defenders");
  const midPositions = positions.filter(p => p.section === "midfielders");
  const fwdPositions = positions.filter(p => p.section === "forwards");

  // GK
  gkPositions.forEach((pos, index) => {
    positionsWithCoordinates.push({
      ...pos,
      x: centerX,
      y: gkY,
    });
  });

  // DEF
  const defSpacing = fieldWidth / (defPositions.length + 1);
  defPositions.forEach((pos, index) => {
    positionsWithCoordinates.push({
      ...pos,
      x: defPositions.length === 1 ? centerX : 5 + (index + 1) * defSpacing,
      y: defY,
    });
  });

  // MID - Updated to show in straight line when 4 midfielders
  const midSpacing = fieldWidth / (midPositions.length + 1);
  midPositions.forEach((pos, index) => {
    positionsWithCoordinates.push({
      ...pos,
      x: midPositions.length === 1 ? centerX : 5 + (index + 1) * midSpacing,
      // When there are exactly 4 midfielders, show them in a straight line
      y: midPositions.length === 4 ? midY : midY + (index % 2 === 0 ? -3 : 3),
    });
  });

  // FWD
  const fwdSpacing = fieldWidth / (fwdPositions.length + 1);
  fwdPositions.forEach((pos, index) => {
    positionsWithCoordinates.push({
      ...pos,
      x: fwdPositions.length === 1 ? centerX : 5 + (index + 1) * fwdSpacing,
      y: fwdY,
    });
  });

  return positionsWithCoordinates;
};

const PitchView = ({ teamData, handleOpenPlayerSelection, handleRemovePlayer, playerPointsData = {} }) => {
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
  const isViewMode = viewMode === "VIEW_TEAM";

  // Updated to check if player redistribution is valid
  const onReplacePlayer = (player) => {
    let section = "midfielders";
    if (player?.playerType) {
      const type = player.playerType.toLowerCase();
      if (type.includes("goalkeeper") || type.includes("goalie")) section = "goalkeepers";
      else if (type.includes("defender") || type.includes("defence")) section = "defenders";
      else if (type.includes("midfielder") || type.includes("midfield")) section = "midfielders";
      else if (type.includes("forward") || type.includes("striker") || type.includes("attack")) section = "forwards";
    }

    // Check if replacing this player would violate minimum requirements
    const currentCounts = {
      goalkeepers: (teamData?.goalkeepers || []).length,
      defenders: (teamData?.defenders || []).length,
      midfielders: (teamData?.midfielders || []).length,
      forwards: (teamData?.forwards || []).length
    };

    // If removing would bring a position below minimum
    if (section === "goalkeepers" && currentCounts.goalkeepers <= 1) {
      Alert.alert("Invalid Change", "You must keep at least 1 goalkeeper.");
      return;
    }

    if (section === "defenders" && currentCounts.defenders <= 1 && playerLimit >= 2) {
      Alert.alert("Invalid Change", "You must keep at least 1 defender.");
      return;
    }

    if (section === "midfielders" && currentCounts.midfielders <= 1 && playerLimit >= 4) {
      Alert.alert("Invalid Change", "You must keep at least 1 midfielder.");
      return;
    }

    if (section === "forwards" && currentCounts.forwards <= 1 && playerLimit >= 3) {
      Alert.alert("Invalid Change", "You must keep at least 1 forward.");
      return;
    }

    const positions = calculatePositions(playerLimit, teamData);
    const playerPos = positions.find((pos) => pos.player && pos.player._id === player._id);
    const positionId = playerPos?.positionId || `replace-${player._id || Date.now()}`;
    const coordinates = playerPos
      ? {
        x: (playerPos.x / 100) * containerDimensions.width,
        y: (playerPos.y / 100) * containerDimensions.height,
      }
      : undefined;
    handleRemovePlayer(player, true);
    handleOpenPlayerSelection(section, positionId, coordinates);
  };

  // Handle selecting a position to add a player
  const handleSelectPosition = (section, positionId, coordinates) => {
    // Check if adding a player would cause other positions to go below minimum
    const currentCounts = {
      goalkeepers: (teamData?.goalkeepers || []).length,
      defenders: (teamData?.defenders || []).length,
      midfielders: (teamData?.midfielders || []).length,
      forwards: (teamData?.forwards || []).length
    };

    const totalPlayers = Object.values(currentCounts).reduce((a, b) => a + b, 0);

    // If we're at playerLimit, adding would require removing from elsewhere
    if (totalPlayers >= playerLimit) {
      // Calculate which position would lose a slot
      const idealDist = getSectionDistribution(playerLimit);

      // If adding to this section would cause another to go below minimum
      if (section === "defenders" &&
        currentCounts.defenders >= idealDist.def &&
        (currentCounts.midfielders <= idealDist.mid || currentCounts.forwards <= idealDist.fwd)) {
        Alert.alert("Invalid Change", "Adding another defender would reduce forwards or midfielders below minimum required.");
        return;
      }

      if (section === "midfielders" &&
        currentCounts.midfielders >= idealDist.mid &&
        (currentCounts.defenders <= idealDist.def || currentCounts.forwards <= idealDist.fwd)) {
        Alert.alert("Invalid Change", "Adding another midfielder would reduce forwards or defenders below minimum required.");
        return;
      }

      if (section === "forwards" &&
        currentCounts.forwards >= idealDist.fwd &&
        (currentCounts.defenders <= idealDist.def || currentCounts.midfielders <= idealDist.mid)) {
        Alert.alert("Invalid Change", "Adding another forward would reduce midfielders or defenders below minimum required.");
        return;
      }
    }

    handleOpenPlayerSelection(section, positionId, coordinates);
  };

  useEffect(() => { }, [teamData]);

  // Always calculate positions with the correct minimums
  const positions = calculatePositions(playerLimit, teamData);

  return (
    <View
      className="flex-1 w-full h-full relative overflow-hidden"
      onLayout={handleLayout}
    >
      {/* Football pitch background */}
      <Image
        source={footballPitch}
        className="absolute w-full h-full rounded-xl"
        style={{
          transform: [
            { perspective: 500 },
            { rotateX: "25deg" },
            { scale: 1.12 },
          ],
        }}
        resizeMode="cover"
        blurRadius={1}
      />
      {/* Gradient overlay for depth */}
      <View className="absolute w-full h-full bg-gradient-to-t from-black/30 to-transparent rounded-xl z-0" />

      {positions.map((position, index) => {
        const player = position.player;
        const posX = (position.x / 100) * containerDimensions.width;
        const posY = (position.y / 100) * containerDimensions.height;

        // Get player points if they exist
        const playerPoints = player && player._id ? playerPointsData[player._id] : undefined;
        if (player && player._id && playerPoints !== undefined) {
          console.log(`Points for ${player.name}: ${playerPoints}`);
        }
        return player ? (
          <View
            key={position.positionId || `player-${player._id || index}`}
            className="absolute z-10 items-center"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: [{ translateX: -36 }, { translateY: -36 }],
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 6,
              elevation: 6,
            }}
          >
            <PlayerCard
              key={`player-card-${player._id || index}`}
              player={player}
              isPitch={true}
              onRemovePlayer={() => handleRemovePlayer(player)}
              onReplacePlayer={onReplacePlayer}
              position={{ x: posX, y: posY }}
              className="w-18 h-18"
              playerPoints={playerPoints} // Pass the player points to the PlayerCard
            />
          </View>
        ) : (
          !isViewMode && (
            <TouchableOpacity
              key={`slot-${position.positionId || index}`}
              className="absolute items-center justify-center z-5"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: [{ translateX: -32 }, { translateY: -32 }],
              }}
              onPress={() =>
                handleSelectPosition(position.section, position.positionId, {
                  x: posX,
                  y: posY,
                })
              }
              activeOpacity={0.7}
            >
              <View
                className="bg-white/70 border-2 border-dashed border-gray-300 rounded-full w-16 h-16 flex items-center justify-center"
                style={{
                  shadowColor: "#3B82F6",
                  shadowOpacity: 0.09,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  elevation: 2,
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