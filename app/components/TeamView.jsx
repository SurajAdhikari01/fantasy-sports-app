import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

// Simulated player database
const allPlayers = [
  {
    id: "1",
    name: "Virat Kohli",
    team: "RCB",
    points: 50,
    image: "https://example.com/virat.jpg",
    role: "Batsman",
    price: 10.5,
  },
  {
    id: "2",
    name: "AB de Villiers",
    team: "RCB",
    points: 48,
    image: "https://example.com/ab.jpg",
    role: "Batsman",
    price: 9.5,
  },
  {
    id: "3",
    name: "Yuzvendra Chahal",
    team: "RCB",
    points: 40,
    image: "https://example.com/chahal.jpg",
    role: "Bowler",
    price: 8.5,
  },
  {
    id: "4",
    name: "Kagiso Rabada",
    team: "DC",
    points: 42,
    image: "https://example.com/rabada.jpg",
    role: "Bowler",
    price: 9.0,
  },
  {
    id: "5",
    name: "Hardik Pandya",
    team: "MI",
    points: 45,
    image: "https://example.com/hardik.jpg",
    role: "All-Rounder",
    price: 11.0,
  },
  {
    id: "6",
    name: "Jos Buttler",
    team: "RR",
    points: 38,
    image: "https://example.com/buttler.jpg",
    role: "Wicket-Keeper",
    price: 9.0,
  },
  {
    id: "7",
    name: "Rohit Sharma",
    team: "MI",
    points: 47,
    image: "https://example.com/rohit.jpg",
    role: "Batsman",
    price: 10.0,
  },
  {
    id: "8",
    name: "Jasprit Bumrah",
    team: "MI",
    points: 46,
    image: "https://example.com/bumrah.jpg",
    role: "Bowler",
    price: 9.5,
  },
  {
    id: "9",
    name: "Andre Russell",
    team: "KKR",
    points: 44,
    image: "https://example.com/russell.jpg",
    role: "All-Rounder",
    price: 10.5,
  },
  {
    id: "10",
    name: "MS Dhoni",
    team: "CSK",
    points: 41,
    image: "https://example.com/dhoni.jpg",
    role: "Wicket-Keeper",
    price: 9.5,
  },
];

const PlayerCard = ({ player, isPitch, onPlayerPress }) => (
  <TouchableOpacity
    onPress={() => onPlayerPress(player)}
    className={`${
      isPitch
        ? "bg-white/90 rounded-lg shadow-md m-1 w-20 h-28"
        : "flex-row bg-white rounded-lg shadow-sm p-3 mb-2"
    }`}
  >
    <View className="relative flex items-center justify-center">
      <Image
        source={{ uri: player.image }}
        className={`${
          isPitch ? "w-14 h-14" : "w-16 h-16"
        } rounded-full border-2 border-blue-500`}
      />
      <View className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center">
        <Text className="text-xs font-bold text-white">{player.points}</Text>
      </View>
    </View>
    <View className={`${isPitch ? "mt-2" : "ml-4 flex-1"}`}>
      <Text
        className={`font-bold ${isPitch ? "text-xs" : "text-sm"} ${
          isPitch ? "text-center" : ""
        } text-gray-800`}
        numberOfLines={1}
      >
        {player.name}
      </Text>
      {!isPitch && (
        <>
          <Text className="text-xs text-gray-600">{player.team}</Text>
          <View className="flex-row mt-1">
            <Text className="text-xs text-gray-500 mr-2">
              <FontAwesome5 name="cricket" size={10} color="#4B5563" />{" "}
              {player.role}
            </Text>
            <Text className="text-xs text-gray-500">
              <FontAwesome5 name="dollar-sign" size={10} color="#4B5563" />{" "}
              {player.price}M
            </Text>
          </View>
        </>
      )}
    </View>
    {!isPitch && (
      <TouchableOpacity
        className="justify-center"
        onPress={() => onPlayerPress(player)}
      >
        <Ionicons name="swap-horizontal" size={24} color="#3B82F6" />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

const SectionHeader = ({ title, count, onAddPlayer }) => (
  <View className="flex-row items-center justify-between p-4 bg-gray-100">
    <Text className="text-lg font-bold text-blue-800">{title}</Text>
    <View className="flex-row items-center">
      <View className="bg-blue-800 rounded-full px-2 py-1 mr-2">
        <Text className="text-xs font-bold text-white">{count}</Text>
      </View>
      <TouchableOpacity onPress={onAddPlayer}>
        <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  </View>
);

const TeamStats = ({ totalPlayers, teamValue, avgPoints }) => (
  <View className="flex-row justify-around items-center py-4 bg-white rounded-xl shadow-sm mb-4">
    <View className="items-center">
      <Text className="text-2xl font-bold text-blue-800">
        {totalPlayers}/11
      </Text>
      <Text className="text-xs text-gray-600">Players</Text>
    </View>
    <View className="items-center">
      <Text className="text-2xl font-bold text-green-600">${teamValue}M</Text>
      <Text className="text-xs text-gray-600">Team Value</Text>
    </View>
    <View className="items-center">
      <Text className="text-2xl font-bold text-orange-500">{avgPoints}</Text>
      <Text className="text-xs text-gray-600">Avg. Points</Text>
    </View>
  </View>
);

const PlayerSelectionModal = ({
  visible,
  onClose,
  onSelectPlayer,
  availablePlayers,
}) => (
  <Modal visible={visible} animationType="slide" transparent={true}>
    <View className="flex-1 justify-end bg-black/50">
      <View className="bg-white rounded-t-3xl p-5 h-3/4">
        <Text className="text-2xl font-bold mb-4">Select Player</Text>
        <FlatList
          data={availablePlayers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectPlayer(item)}
              className="flex-row items-center p-2 border-b border-gray-200"
            >
              <Image
                source={{ uri: item.image }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View>
                <Text className="font-bold">{item.name}</Text>
                <Text className="text-sm text-gray-600">
                  {item.team} - {item.role}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          onPress={onClose}
          className="mt-4 bg-red-500 p-3 rounded-full"
        >
          <Text className="text-white text-center font-bold">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function TeamView() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState("pitch");
  const [teamData, setTeamData] = useState({
    Batsmen: [],
    Bowlers: [],
    AllRounders: [],
    WicketKeepers: [],
  });
  const [showPlayerSelectionModal, setShowPlayerSelectionModal] =
    useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const totalPlayers = Object.values(teamData).flat().length;
  const teamValue = Object.values(teamData)
    .flat()
    .reduce((sum, player) => sum + player.price, 0)
    .toFixed(1);
  const avgPoints =
    totalPlayers > 0
      ? (
          Object.values(teamData)
            .flat()
            .reduce((sum, player) => sum + player.points, 0) / totalPlayers
        ).toFixed(1)
      : "0.0";

  const handlePlayerPress = (player) => {
    Alert.alert(
      "Player Options",
      `What would you like to do with ${player.name}?`,
      [
        { text: "Remove", onPress: () => removePlayer(player) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleAddPlayer = (section) => {
    setSelectedSection(section);
    setShowPlayerSelectionModal(true);
  };

  const addPlayer = (player) => {
    if (totalPlayers >= 11) {
      Alert.alert("Team Full", "You can only have 11 players in your team.");
      return;
    }

    const newTeamData = { ...teamData };
    newTeamData[selectedSection] = [...newTeamData[selectedSection], player];
    setTeamData(newTeamData);
    setShowPlayerSelectionModal(false);
  };

  const removePlayer = (player) => {
    const newTeamData = { ...teamData };
    Object.keys(newTeamData).forEach((section) => {
      newTeamData[section] = newTeamData[section].filter(
        (p) => p.id !== player.id
      );
    });
    setTeamData(newTeamData);
  };

  const getAvailablePlayers = () => {
    const teamPlayerIds = new Set(
      Object.values(teamData)
        .flat()
        .map((player) => player.id)
    );
    return allPlayers.filter((player) => !teamPlayerIds.has(player.id));
  };

  const renderListView = () => (
    <FlatList
      data={Object.entries(teamData)}
      keyExtractor={(item) => item[0]}
      renderItem={({ item: [section, players] }) => (
        <View className="mb-4 bg-gray-50 rounded-xl overflow-hidden shadow-sm">
          <SectionHeader
            title={section}
            count={players.length}
            onAddPlayer={() => handleAddPlayer(section)}
          />
          <View className="p-2">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isPitch={false}
                onPlayerPress={handlePlayerPress}
              />
            ))}
          </View>
        </View>
      )}
      ListHeaderComponent={
        <TeamStats
          totalPlayers={totalPlayers}
          teamValue={teamValue}
          avgPoints={avgPoints}
        />
      }
      contentContainerStyle={{ padding: 16 }}
    />
  );

  const renderPitchView = () => (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-3 py-2">
      <TeamStats
        totalPlayers={totalPlayers}
        teamValue={teamValue}
        avgPoints={avgPoints}
      />
      <View className="flex-1 aspect-[2/3] relative rounded-xl overflow-hidden shadow-lg">
        <Image
          source={require("../../assets/cricket-field.jpeg")}
          className="w-full h-full"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.5)"]}
          className="absolute inset-0"
        />
        <View className="absolute inset-0 flex justify-around items-center p-2">
          {Object.entries(teamData).map(([section, players]) => (
            <View key={section} className="flex-row justify-around w-full">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isPitch={true}
                  onPlayerPress={handlePlayerPress}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const saveTeam = () => {
    // Implement team saving logic here
    console.log("Team saved:", teamData);
    Alert.alert("Success", "Your team has been saved!");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <LinearGradient
        colors={["#1e3c72", "#2a5298"]}
        className="py-4 px-5 rounded-b-3xl"
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">My Dream Team</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View className="flex-row justify-center bg-white shadow-md py-2 px-4 mx-4 -mt-5 rounded-full">
        <TouchableOpacity
          className={`px-4 py-2 rounded-full ${
            viewMode === "list" ? "bg-blue-100" : ""
          }`}
          onPress={() => setViewMode("list")}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={20}
            color={viewMode === "list" ? "#1e3c72" : "#4B5563"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className={`px-4 py-2 rounded-full ${
            viewMode === "pitch" ? "bg-blue-100" : ""
          }`}
          onPress={() => setViewMode("pitch")}
        >
          <MaterialCommunityIcons
            name="cricket"
            size={20}
            color={viewMode === "pitch" ? "#1e3c72" : "#4B5563"}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-1 mt-2">
        {viewMode === "list" ? renderListView() : renderPitchView()}
      </View>

      <TouchableOpacity
        onPress={saveTeam}
        className="bg-orange-600 mx-4 my-4 p-3 rounded-full shadow-md"
      >
        <Text className="text-white text-center font-bold text-lg">
          Save Team
        </Text>
      </TouchableOpacity>

      <PlayerSelectionModal
        visible={showPlayerSelectionModal}
        onClose={() => setShowPlayerSelectionModal(false)}
        onSelectPlayer={addPlayer}
        availablePlayers={getAvailablePlayers()}
      />
    </SafeAreaView>
  );
}
