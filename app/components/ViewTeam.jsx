import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from 'expo-router';
import PitchView from "./PitchView"
import {
  selectedTournamentState,
  playerLimitState,
  fetchedPlayersState,
  viewModeState,
  totalPointsState,
  teamIdState,
  currentRoundState,
} from "./atoms"
import api from "../config/axios"

// Get screen dimensions
const { height: screenHeight } = Dimensions.get("window")

const ViewTeam = () => {

  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState([])
  const [selectedTournament, setSelectedTournament] = useRecoilState(selectedTournamentState)
  const [currentStage, setCurrentStage] = useState("knockout")
  const playerLimit = useRecoilValue(playerLimitState)
  const [totalPoints, setTotalPoints] = useRecoilState(totalPointsState)
  const [teamId, setTeamId] = useRecoilState(teamIdState)
  const currentRound = useRecoilValue(currentRoundState) // "knockout" | "semifinal" | "final"

  // Reset functions
  const resetSelectedTournament = useResetRecoilState(selectedTournamentState)
  const resetFetchedPlayers = useResetRecoilState(fetchedPlayersState)
  const resetViewMode = useResetRecoilState(viewModeState)

  // On mount/update: set currentStage according to currentRound atom
  useEffect(() => {
    if (currentRound && ["knockout", "semifinal", "final"].includes(currentRound)) {
      setCurrentStage(currentRound)
    }
  }, [currentRound])

  useEffect(() => {
    if (selectedTournament) {
      fetchTournamentPlayers()
    }
  }, [selectedTournament, currentStage])

  //fetches team
  const fetchTournamentPlayers = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/teams`)

      if (response.data.success) {
        const teamForTournament = response.data.data.find(
          (team) => team.tournamentId?._id === selectedTournament
        )

        // ADD THIS LINE to log the selected team ID:
        if (teamForTournament) {
          console.log('Selected Team ID:', teamForTournament._id)
          setTeamId(teamForTournament._id)
        } else {
          console.log('No team found for selected tournament:', selectedTournament)
        }

        setTotalPoints(teamForTournament?.totalPoints || 0)
        if (teamForTournament) {
          const stagePlayers = [
            ...(teamForTournament.players?.[currentStage] || []),
          ].map((p) => ({
            ...p,
            playerType: (p.playerType?.toLowerCase() || "").trim(),
            photo:
              p.photo ||
              "https://i0.wp.com/e-quester.com/wp-content/uploads/2021/11/placeholder-image-person-jpg.jpg?fit=820%2C678&ssl=1",
          }))
          setPlayers(stagePlayers)
        } else {
          setPlayers([])
        }
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
      Alert.alert("Error", "Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!teamId) {
      Alert.alert("Error", "No team found to edit");
      return;
    }
    console.log("teamid", teamId)
    try {

      const response = await api.post(`/checkTeamUpdateAbility/check/${teamId}`);
      console.log("response", response.data)

      // if (response.data.success) {
        router.push('components/EditTeam');
      // } else {
      //   Alert.alert("Cannot Edit Team", response.data.message || "You do not have permission to edit this team at this time.");
      // }
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 2xx
        console.log("API error:", error.response.data, error.response.status);
      } else if (error.request) {
        // No response received
        console.log("No response from server:", error.request);
      } else {
        // Error setting up the request
        console.log("Error:", error.message);
      }
      Alert.alert("Error", "Could not verify team edit permissions. Please try again.");
    }
  };

  const handleBack = () => {
    resetSelectedTournament()
    resetFetchedPlayers()
    resetViewMode()
  }

  // PROMPT LOGIC
  const renderStagePrompt = () => {
    // If viewing a stage that has ended, or not the current round, show correct prompt
    // currentStage: the tab the user is on
    // currentRound: atom, the active round in tournament

    if (currentRound === "semifinal") {
      if (currentStage === "knockout") {
        return (
          <View className="bg-yellow-900 border border-yellow-700 rounded-lg px-4 py-3 mb-2 mx-2">
            <Text className="text-yellow-300 font-medium">
              Knockout has ended. Please proceed to Semifinal or Final.
            </Text>
          </View>
        )
      }
      if (currentStage === "semifinal") {
        return (
          <View className="bg-emerald-900 border border-emerald-700 rounded-lg px-4 py-3 mb-2 mx-2">
            <Text className="text-emerald-300 font-medium">
              Semifinal has started. Please click "Edit Team" to change your team for the Semifinal.
            </Text>
          </View>
        )
      }
      if (currentStage === "final") {
        return (
          <View className="bg-yellow-900 border border-yellow-700 rounded-lg px-4 py-3 mb-2 mx-2">
            <Text className="text-yellow-300 font-medium">
              Please proceed to Final.
            </Text>
          </View>
        )
      }
    }
    if (currentRound === "final") {
      if (currentStage === "knockout" || currentStage === "semifinal") {
        return (
          <View className="bg-yellow-900 border border-yellow-700 rounded-lg px-4 py-3 mb-2 mx-2">
            <Text className="text-yellow-300 font-medium">
              Please proceed to Final.
            </Text>
          </View>
        )
      }
      if (currentStage === "final") {
        return (
          <View className="bg-emerald-900 border border-emerald-700 rounded-lg px-4 py-3 mb-2 mx-2">
            <Text className="text-emerald-300 font-medium">
              Final has started. Please click "Edit Team" to change your team for the Final.
            </Text>
          </View>
        )
      }
    }
    return null;
  }

  const renderContent = () => {
    return (
      <View className="flex-1">
        {/* PROMPT */}
        {renderStagePrompt()}

        {players.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <MaterialCommunityIcons name="account-group-outline" size={64} color="#334155" />
            <Text className="text-slate-400 text-lg font-medium text-center mt-4">No players found</Text>
            <Text className="text-slate-500 text-center mt-2">Stage has ended or not started yet</Text>
          </View>
        ) : (
          <View style={{ height: screenHeight * 0.6, marginBottom: 16 }}>
            <PitchView
              teamData={{ all: players }}
              handlePlayerPress={(player) => Alert.alert(player.name, `Price: ${player.price || "N/A"}`)}
              handleOpenPlayerSelection={(section, positionId, position) =>
                Alert.alert("Add Player", `Add player to ${section} position`)
              }
              handleRemovePlayer={(player) =>
                Alert.alert("Remove Player", `Remove ${player.name} from team?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive" },
                ])
              }
            />
          </View>
        )}

        {/* Squad Status */}
        <View className="mb-6 mx-2">
          <LinearGradient
            colors={["#1e293b", "#334155"]}
            className="p-4 rounded-xl shadow-sm"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View className="flex-row justify-between items-center">
              <View className="items-end">
                <View className="flex-row items-center mt-1">
                  <MaterialCommunityIcons name="star" size={18} color="#a78bfa" />
                  <Text className="font-bold text-purple-300 text-lg ml-1">{totalPoints} Points</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-b border-slate-800">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#a3a3a3" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white ml-3">Your Team</Text>
        {teamId && (
          <TouchableOpacity
            onPress={handleEdit}
            className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center ml-auto"
          >
            <Ionicons name="create-outline" size={20} color="#a78bfa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stage Selection Tabs */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row bg-slate-800 p-1 rounded-xl">
          {[
            { title: "Knockout", stageName: "knockout", icon: "trophy-outline" },
            { title: "Semifinal", stageName: "semifinal", icon: "git-network-outline" },
            { title: "Final", stageName: "final", icon: "star-outline" },
          ].map((stage) => (
            <TouchableOpacity
              key={stage.stageName}
              className={`flex-1 py-2.5 px-3 rounded-lg flex-row items-center justify-center ${currentStage === stage.stageName ? "bg-slate-900 shadow-sm" : ""
                }`}
              onPress={() => setCurrentStage(stage.stageName)}
            >
              <Ionicons name={stage.icon} size={16} color={currentStage === stage.stageName ? "#a78bfa" : "#64748b"} />
              <Text
                className={`font-medium text-sm ml-1.5 ${currentStage === stage.stageName ? "text-purple-300" : "text-slate-400"
                  }`}
              >
                {stage.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#a78bfa" />
          <Text className="text-slate-400 mt-4 font-medium">Loading team data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{renderContent()}</ScrollView>
      )}
    </SafeAreaView>
  )
}

export default ViewTeam