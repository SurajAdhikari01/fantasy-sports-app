import { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, Dimensions } from "react-native";
import PlayerCard from "./PlayerCard";
import { FontAwesome5 } from "@expo/vector-icons";
import footballPitch from "../../assets/football-field.jpg";
import { useRecoilValue } from "recoil";
import { sportState, playerLimitState, viewModeState } from "./atoms";

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Helper: ensure at least 1 for each outfield line if total players is less
function getSectionDistribution(numPlayers) {
  if (numPlayers <= 1) {
    // Just 1: always GK
    return { gk: 1, def: 0, mid: 0, fwd: 0 };
  }
  if (numPlayers === 2) {
    // GK + DEF
    return { gk: 1, def: 1, mid: 0, fwd: 0 };
  }
  if (numPlayers === 3) {
    // GK + DEF + FWD
    return { gk: 1, def: 1, mid: 0, fwd: 1 };
  }
  if (numPlayers === 4) {
    // GK + DEF + MID + FWD
    return { gk: 1, def: 1, mid: 1, fwd: 1 };
  }
  // For 5+, distribute roughly as 1-2-2 (DEF-MID-FWD), or more
  // Always at least 1 in each outfield, rest distributed
  const gk = 1;
  let spots = numPlayers - 1;
  let def = 1, mid = 1, fwd = 1;
  spots -= 3;
  // Now distribute remaining spots
  while (spots > 0) {
    if (def <= mid && def <= fwd) def++;
    else if (mid <= def && mid <= fwd) mid++;
    else fwd++;
    spots--;
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

  // --- Section distribution ---
  const dist = getSectionDistribution(validNumPlayers);

  // Clamp to at least one in each outfield line for positions
  const gkLen = Math.max(dist.gk, goalkeepers.length);
  const defLen = Math.max(dist.def, defenders.length);
  const midLen = Math.max(dist.mid, midfielders.length);
  const fwdLen = Math.max(dist.fwd, forwards.length);

  // Compose arrays for rendering, fill with null for open slots
  const combinedGk = [...goalkeepers, ...Array(Math.max(0, gkLen - goalkeepers.length)).fill(null)];
  const combinedDef = [...defenders, ...Array(Math.max(0, defLen - defenders.length)).fill(null)];
  const combinedMid = [...midfielders, ...Array(Math.max(0, midLen - midfielders.length)).fill(null)];
  const combinedFwd = [...forwards, ...Array(Math.max(0, fwdLen - forwards.length)).fill(null)];

  // Placement constants
  const fieldWidth = 90; // percent
  const centerX = 50;
  const gkY = 85,
    defY = 65,
    midY = 40,
    fwdY = 15;

  const positions = [];

  // GK
  combinedGk.forEach((player, index) => {
    positions.push({
      player,
      x: centerX,
      y: gkY,
      section: "goalkeepers",
      positionId: player ? `gk-${index}` : `empty-gk-${index}`,
    });
  });

  // DEF
  const defSpacing = fieldWidth / (combinedDef.length + 1);
  combinedDef.forEach((player, index) => {
    positions.push({
      player,
      x: 5 + (index + 1) * defSpacing,
      y: defY,
      section: "defenders",
      positionId: player ? `def-${index}` : `empty-def-${index}`,
    });
  });

  // MID
  const midSpacing = fieldWidth / (combinedMid.length + 1);
  combinedMid.forEach((player, index) => {
    positions.push({
      player,
      x: 5 + (index + 1) * midSpacing,
      y: midY + (index % 2 === 0 ? -3 : 3),
      section: "midfielders",
      positionId: player ? `mid-${index}` : `empty-mid-${index}`,
    });
  });

  // FWD (always render at least 1 if dist.fwd >= 1)
  const fwdSpacing = fieldWidth / (combinedFwd.length + 1);
  combinedFwd.forEach((player, index) => {
    positions.push({
      player,
      x: 5 + (index + 1) * fwdSpacing,
      y: fwdY,
      section: "forwards",
      positionId: player ? `fwd-${index}` : `empty-fwd-${index}`,
    });
  });

  return positions;
};

const PitchView = ({ teamData, handleOpenPlayerSelection, handleRemovePlayer }) => {
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

  const onReplacePlayer = (player) => {
    let section = "midfielders";
    if (player?.playerType) {
      const type = player.playerType.toLowerCase();
      if (type.includes("goalkeeper") || type.includes("goalie")) section = "goalkeepers";
      else if (type.includes("defender") || type.includes("defence")) section = "defenders";
      else if (type.includes("midfielder") || type.includes("midfield")) section = "midfielders";
      else if (type.includes("forward") || type.includes("striker") || type.includes("attack")) section = "forwards";
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
        // const playerPoints = player ? calculatePlayerPoints(player) : undefined;

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
              // playerPoints={playerPointsMap[player._id] ?? 0}
              className="w-18 h-18"
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
                handleOpenPlayerSelection(position.section, position.positionId, {
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