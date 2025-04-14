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
  const totalPoints = useRecoilValue(totalPointsState)
  const [teamId, setTeamId] = useRecoilState(teamIdState)

  // Reset functions
  const resetSelectedTournament = useResetRecoilState(selectedTournamentState)
  const resetPlayerLimit = useResetRecoilState(playerLimitState)
  const resetFetchedPlayers = useResetRecoilState(fetchedPlayersState)
  const resetViewMode = useResetRecoilState(viewModeState)

  useEffect(() => {
    if (selectedTournament) {
      fetchTournamentPlayers()
    }
  }, [selectedTournament, currentStage])

  const fetchTournamentPlayers = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/teams`)

      if (response.data.success) {
        const teamForTournament = response.data.data.find((team) => team.tournamentId?._id === selectedTournament)

        if (teamForTournament) {
          const stagePlayers = [...(teamForTournament.players?.[currentStage] || [])].map((p) => ({
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

  const handleEdit = () => {
    if (!teamId) {
      Alert.alert("Error", "No team found to edit");
      return;
    }
    setTeamId(teamId)
    console.log("teamId", teamId)
    router.push('components/EditTeam');
  };

  const handleBack = () => {
    resetSelectedTournament()
    resetPlayerLimit()
    resetFetchedPlayers()
    resetViewMode()
    // router.back() //not needed as selectedTournament reset vayesi afai back janxa
  }

  const renderContent = () => {
    if (players.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <MaterialCommunityIcons name="account-group-outline" size={64} color="#CBD5E1" />
          <Text className="text-gray-500 text-lg font-medium text-center mt-4">No players found</Text>
          <Text className="text-gray-400 text-center mt-2">Stage has ended or not started yet</Text>
        </View>
      )
    }

    return (
      <View className="flex-1">
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

        {/* Squad Status */}
        <View className="mb-6 mx-2">
          <LinearGradient
            colors={["#EFF6FF", "#DBEAFE"]}
            className="p-4 rounded-xl shadow-sm"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View className="flex-row justify-between items-center">
              <View className="items-end">
                <View className="flex-row items-center mt-1">
                  <MaterialCommunityIcons name="star" size={18} color="#1D4ED8" />
                  <Text className="font-bold text-blue-800 text-lg ml-1">{totalPoints} Points</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-3">Your Team</Text>
        {teamId && (
          <TouchableOpacity
            onPress={handleEdit}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Stage Selection Tabs */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row bg-gray-100 p-1 rounded-xl">
          {[
            { title: "Knockout", stageName: "knockout", icon: "trophy-outline" },
            { title: "Semifinal", stageName: "semifinal", icon: "git-network-outline" },
            { title: "Final", stageName: "final", icon: "star-outline" },
          ].map((stage) => (
            <TouchableOpacity
              key={stage.stageName}
              className={`flex-1 py-2.5 px-3 rounded-lg flex-row items-center justify-center ${currentStage === stage.stageName ? "bg-white shadow-sm" : ""
                }`}
              onPress={() => setCurrentStage(stage.stageName)}
            >
              <Ionicons name={stage.icon} size={16} color={currentStage === stage.stageName ? "#3B82F6" : "#6B7280"} />
              <Text
                className={`font-medium text-sm ml-1.5 ${currentStage === stage.stageName ? "text-blue-500" : "text-gray-500"
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
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4 font-medium">Loading team data...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{renderContent()}</ScrollView>
      )}
    </SafeAreaView>
  )
}

export default ViewTeam