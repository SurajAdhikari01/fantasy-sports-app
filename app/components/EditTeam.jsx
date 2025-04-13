
import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil"
import { Ionicons, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import PitchView from "./PitchView"
import {
    selectedTournamentState,
    playerLimitState,
    fetchedPlayersState,
    viewModeState,
    totalPointsState,
    teamDataState,
    teamIdState,
} from "./atoms"
import api from "../config/axios"
import PlayerSelectionModal from "./PlayerSelectionModal"

const { height: screenHeight } = Dimensions.get("window")

const EditTeam = ({ route }) => {
    const { teamId } = useRecoilValue(teamIdState)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [players, setPlayers] = useState([])
    const [selectedTournament] = useRecoilState(selectedTournamentState)
    const [currentStage, setCurrentStage] = useState("knockout")
    const [viewMode, setViewMode] = useRecoilState(viewModeState)
    const [teamData, setTeamData] = useRecoilState(teamDataState)
    const [fetchedPlayers, setFetchedPlayers] = useRecoilState(fetchedPlayersState)
    const [addedPlayers, setAddedPlayers] = useState([])
    const [removedPlayers, setRemovedPlayers] = useState([])
    const [showPlayerSelectionModal, setShowPlayerSelectionModal] = useState(false)
    const [selectedPosition, setSelectedPosition] = useState(null)

    useEffect(() => {
        fetchTeamData()
        fetchAvailablePlayers()
    }, [])

    const fetchTeamData = async () => {
        try {
            const response = await api.get(`/teams/${teamId}`)
            if (response.data.success) {
                const formattedPlayers = response.data.data.players[currentStage].map(p => ({
                    ...p,
                    _id: p._id,
                    playerType: p.playerType?.toLowerCase().trim(),
                }))
                setPlayers(formattedPlayers)
                setTeamData({ [currentStage]: formattedPlayers })
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load team data")
        } finally {
            setLoading(false)
        }
    }

    const fetchAvailablePlayers = async () => {
        try {
            const response = await api.get(`/players?tournament=${selectedTournament}`)
            if (response.data.success) {
                setFetchedPlayers(response.data.data)
            }
        } catch (error) {
            Alert.alert("Error", "Failed to load available players")
        }
    }

    const handleAddPlayer = (player, position) => {
        setAddedPlayers(prev => [...prev, player._id])
        setRemovedPlayers(prev => prev.filter(id => id !== player._id))
        setTeamData(prev => ({
            ...prev,
            [currentStage]: prev[currentStage].map(p =>
                p.position === position ? { ...player, position } : p
            )
        }))
    }

    const handleRemovePlayer = (playerId) => {
        setRemovedPlayers(prev => [...prev, playerId])
        setAddedPlayers(prev => prev.filter(id => id !== playerId))
        setTeamData(prev => ({
            ...prev,
            [currentStage]: prev[currentStage].filter(p => p._id !== playerId)
        }))
    }

    const handleSave = async () => {
        try {
            const payload = {
                addPlayers: addedPlayers,
                removePlayers: removedPlayers,
                stage: currentStage
            }

            const response = await api.put(`/teams/${teamId}`, payload)
            if (response.data.success) {
                Alert.alert("Success", "Team updated successfully!")
                setViewMode("VIEW")

                router.back()
            }
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to update team")
        }
    }

    const renderHeader = () => (
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
            <TouchableOpacity
                onPress={() => {
                    setViewMode("VIEW")
                    router.back()
                }}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
                <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>

            <Text className="text-xl font-bold text-gray-800">Edit Team</Text>

            <TouchableOpacity
                onPress={handleSave}
                className="bg-blue-500 px-4 py-2 rounded-lg"
            >
                <Text className="text-white font-medium">Save</Text>
            </TouchableOpacity>
        </View>
    )

    return (
        <SafeAreaView className="flex-1 bg-white">
            {renderHeader()}

            <ScrollView>
                {/* Stage Selector and other UI elements from original ViewTeam */}

                <View style={{ height: screenHeight * 0.6 }}>
                    <PitchView
                        teamData={teamData}
                        handlePlayerPress={(player) => { }}
                        handleOpenPlayerSelection={(section, positionId, position) => {
                            setSelectedPosition(position)
                            setShowPlayerSelectionModal(true)
                        }}
                        handleRemovePlayer={handleRemovePlayer}
                        editMode={true}
                    />
                </View>

                <PlayerSelectionModal
                    visible={showPlayerSelectionModal}
                    onClose={() => setShowPlayerSelectionModal(false)}
                    onSelectPlayer={(player) => handleAddPlayer(player, selectedPosition)}
                    availablePlayers={fetchedPlayers.filter(p =>
                        !teamData[currentStage].some(tp => tp._id === p._id) &&
                        !removedPlayers.includes(p._id)
                    )}
                    position={selectedPosition}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default EditTeam