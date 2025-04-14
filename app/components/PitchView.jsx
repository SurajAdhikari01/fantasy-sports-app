import { useState, useEffect } from "react"
import { View, TouchableOpacity, Dimensions, Image } from "react-native"
import PlayerCard from "./PlayerCard"
import { FontAwesome5 } from "@expo/vector-icons"
import footballPitch from "../../assets/football-field.jpg"
import { useRecoilValue } from "recoil"
import { sportState, playerLimitState, viewModeState } from "./atoms"

// Get the width and height of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

// Calculate player positions according to football formations
const calculatePositions = (numPlayers, teamData) => {
  const validNumPlayers = Math.max(0, Number(numPlayers) || 0)

  // Initialize arrays for different player types
  let goalkeepers = []
  let defenders = []
  let midfielders = []
  let forwards = []
  let allPlayers = []

  // Check if teamData has an "all" property (viewing mode)
  if (teamData && teamData.all && Array.isArray(teamData.all)) {
    allPlayers = teamData.all

    // Categorize players by their playerType
    goalkeepers = allPlayers.filter(
      (p) => p?.playerType?.toLowerCase().includes("goalkeeper") || p?.playerType?.toLowerCase().includes("goalie"),
    )

    defenders = allPlayers.filter(
      (p) => p?.playerType?.toLowerCase().includes("defender") || p?.playerType?.toLowerCase().includes("defence"),
    )

    midfielders = allPlayers.filter(
      (p) => p?.playerType?.toLowerCase().includes("midfielder") || p?.playerType?.toLowerCase().includes("midfield"),
    )

    forwards = allPlayers.filter(
      (p) =>
        p?.playerType?.toLowerCase().includes("forward") ||
        p?.playerType?.toLowerCase().includes("striker") ||
        p?.playerType?.toLowerCase().includes("attack"),
    )

    // Handle players with unknown position types
    const unknownPositions = allPlayers.filter((p) => {
      const type = p?.playerType?.toLowerCase() || ""
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
      )
    })

    // Assign unknown positions to midfielders by default
    midfielders = [...midfielders, ...unknownPositions]

    // Debug log
    // console.log("Player distribution:", {
    //   goalkeepers: goalkeepers.length,
    //   defenders: defenders.length,
    //   midfielders: midfielders.length,
    //   forwards: forwards.length,
    //   unknown: unknownPositions.length,
    //   total: allPlayers.length,
    // })
  } else {
    // Original behavior for creation mode - extract from teamData object
    if (teamData && typeof teamData === "object") {
      goalkeepers = Array.isArray(teamData.goalkeepers) ? teamData.goalkeepers : []
      defenders = Array.isArray(teamData.defenders) ? teamData.defenders : []
      midfielders = Array.isArray(teamData.midfielders) ? teamData.midfielders : []
      forwards = Array.isArray(teamData.forwards) ? teamData.forwards : []
      allPlayers = [...goalkeepers, ...defenders, ...midfielders, ...forwards]
    } else {
      console.warn("Invalid teamData format:", teamData)
      allPlayers = []
    }
  }

  const positions = []
  const currentPlayers = allPlayers.filter((p) => p).length
  let emptySlots = Math.max(0, validNumPlayers - currentPlayers)

  // Use a percentage of the container width instead of absolute values
  const fieldWidth = 90 // 90% of container width
  const centerX = 50 // Center at 50%

  // Y positions as percentages of container height
  const gkY = 85
  const defY = 65
  const midY = 40
  const fwdY = 15

  // Determine needed slots per section
  const missingGk = goalkeepers.length === 0 ? 1 : 0
  const idealDef = Math.min(4, Math.ceil(numPlayers * 0.4))
  const neededDef = Math.max(0, idealDef - defenders.length)
  const idealMid = Math.min(4, Math.ceil(numPlayers * 0.3))
  const neededMid = Math.max(0, idealMid - midfielders.length)
  const idealFwd = Math.min(3, Math.ceil(numPlayers * 0.3))
  const neededFwd = Math.max(0, idealFwd - forwards.length)

  // Goalkeepers
  const combinedGk = [...goalkeepers];
  if (missingGk && emptySlots > 0) {
    combinedGk.push(null);
    emptySlots--;
  }
  combinedGk.forEach((player, index) => {
    positions.push({
      player,
      x: centerX,
      y: gkY,
      section: "goalkeepers",
      positionId: player ? `gk-${index}` : `empty-gk-0`,
    });
  });
  // Defenders
  const defToAdd = Math.min(emptySlots, neededDef);
  const combinedDef = [...defenders, ...Array(defToAdd).fill(null)];
  emptySlots -= defToAdd;
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

  // Midfielders
  const midToAdd = Math.min(emptySlots, neededMid);
  const combinedMid = [...midfielders, ...Array(midToAdd).fill(null)];
  emptySlots -= midToAdd;
  const midSpacing = fieldWidth / (combinedMid.length + 1);
  combinedMid.forEach((player, index) => {
    positions.push({
      player,
      x: 5 + (index + 1) * midSpacing,
      y: midY + (index % 2 === 0 ? -5 : 5), // Alternate Y position slightly
      section: "midfielders",
      positionId: player ? `mid-${index}` : `empty-mid-${index}`,
    });
  });

  // Forwards
  const fwdToAdd = Math.min(emptySlots, neededFwd);
  const combinedFwd = [...forwards, ...Array(fwdToAdd).fill(null)];
  emptySlots -= fwdToAdd;
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


  // Distribute remaining empty slots across rows
  const rows = [
    { y: defY, section: "defenders" },
    { y: midY, section: "midfielders" },
    { y: fwdY, section: "forwards" },
  ]

  // Limit the number of extra slots to prevent overcrowding
  const maxExtraSlotsPerRow = 2
  let extraSlotsAdded = 0

  while (emptySlots > 0 && extraSlotsAdded < rows.length * maxExtraSlotsPerRow) {
    for (const row of rows) {
      if (emptySlots <= 0 || extraSlotsAdded >= rows.length * maxExtraSlotsPerRow) break

      // Calculate spacing based on current slots in this row
      const existingSlotsInRow = positions.filter((pos) => pos.y === row.y).length
      const spacing = fieldWidth / (existingSlotsInRow + 2) // +2 to account for margins

      positions.push({
        player: null,
        x: 5 + spacing * (existingSlotsInRow + 1), // Add 5% offset from edge
        y: row.y,
        section: row.section,
        positionId: `empty-extra-${row.section}-${emptySlots}`,
      })

      emptySlots--
      extraSlotsAdded++
    }
  }

  return positions
}

const PitchView = ({ teamData, handleOpenPlayerSelection, handleRemovePlayer }) => {
  const [containerDimensions, setContainerDimensions] = useState({ width: screenWidth, height: screenHeight * 0.6 })
  const handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })
  }
  const sport = useRecoilValue(sportState)
  const playerLimit = useRecoilValue(playerLimitState)
  const viewMode = useRecoilValue(viewModeState)

  // Determine if we're in view mode
  const isViewMode = viewMode === "VIEW_TEAM"

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
    
    teamData.points.forEach(matchData => {
      if (matchData?.players && Array.isArray(matchData.players)) {
        const playerPointEntry = matchData.players.find(p => p?.playerId === player._id);
        if (playerPointEntry && typeof playerPointEntry.points === 'number') {
          totalPoints += playerPointEntry.points;
        }
      }
    });
    
    return totalPoints;
  };

  const onReplacePlayer = (player) => {
    // Determine player section based on player type
    let section = "midfielders"; // Default section
    if (player?.playerType) {
      const type = player.playerType.toLowerCase();
      if (type.includes("goalkeeper") || type.includes("goalie")) {
        section = "goalkeepers";
      } else if (type.includes("defender") || type.includes("defence")) {
        section = "defenders";
      } else if (type.includes("midfielder") || type.includes("midfield")) {
        section = "midfielders";
      } else if (type.includes("forward") || type.includes("striker") || type.includes("attack")) {
        section = "forwards";
      }
    }

    // Find position information for this player
    const playerPos = positions.find(pos => pos.player && pos.player._id === player._id);
    const positionId = playerPos?.positionId || `replace-${player._id || Date.now()}`;
    const coordinates = playerPos ? {
      x: (playerPos.x / 100) * containerDimensions.width,
      y: (playerPos.y / 100) * containerDimensions.height
    } : undefined;

    // To handle max player limit, remove the player being replaced without alert
    handleRemovePlayer(player, true); // Pass true to skip the alert

    // Then open player selection for the same position
    handleOpenPlayerSelection(section, positionId, coordinates);
  }

  // Debug log
  useEffect(() => {
    if (teamData && teamData.all) {
      console.log("View mode teamData:", {
        count: teamData.all.length,
        sample: teamData.all.slice(0, 2).map((p) => ({
          name: p.name,
          type: p.playerType,
        })),
        pointsData: teamData.points ? `${teamData.points.length} matches` : "No points data"
      })
    }
  }, [teamData])

  // Calculate positions based on player types and available players
  const positions = calculatePositions(playerLimit, teamData)

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
          transform: [
            { perspective: 400 },
            { rotateX: "30deg" },
            { scale: 1.1 }, // Slightly reduced scale to fit better
          ],
        }}
        resizeMode="cover" // Changed to cover for better field display
      />

      {positions.map((position, index) => {
        const player = position.player
        // Calculate absolute positions based on percentages
        const posX = (position.x / 100) * containerDimensions.width
        const posY = (position.y / 100) * containerDimensions.height
        
        // Calculate player points if in view mode and player exists
        const playerPoints = player ? calculatePlayerPoints(player) : undefined;

        return player ? (
          <View
            key={position.positionId || `player-${player._id || index}`}
            style={{
              position: "absolute",
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: [{ translateX: -32 }, { translateY: -32 }],
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
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: [{ translateX: -32 }, { translateY: -32 }],
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
              }}
              onPress={() => handleOpenPlayerSelection(position.section, position.positionId, { x: posX, y: posY })}
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
        )
      })}
    </View>
  )
}

export default PitchView