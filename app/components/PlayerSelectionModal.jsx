"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { Ionicons, Feather } from "@expo/vector-icons"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

const PlayerSelectionModal = ({
  visible,
  onClose,
  onSelectPlayer,
  availablePlayers = [],
  section,
  franchises = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedPrice, setSelectedPrice] = useState("")
  const [selectedFranchise, setSelectedFranchise] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filterHeight = useMemo(() => new Animated.Value(0), [])
  const filterOpacity = useMemo(() => new Animated.Value(0), [])
  const modalSlide = useMemo(() => new Animated.Value(20), [])
  const modalOpacity = useMemo(() => new Animated.Value(0), [])

  useEffect(() => {
    if (!visible) {
      setSearchQuery("")
      setIsFilterExpanded(false)
      setSelectedPosition("")
      setSelectedPrice("")
      setSelectedFranchise("")
    } else {
      Animated.parallel([
        Animated.timing(modalSlide, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible, modalSlide, modalOpacity])

  const filteredPlayers = useMemo(() => {
    setIsLoading(true)
    let result = availablePlayers.filter(
      (player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (player.franchise?.name && player.franchise.name.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    if (selectedPosition) {
      result = result.filter((player) => player.playerType.toLowerCase().includes(selectedPosition.toLowerCase()))
    }
    if (selectedPrice) {
      const maxPrice = Number.parseFloat(selectedPrice)
      result = result.filter((player) => player.price <= maxPrice)
    }
    if (selectedFranchise) {
      result = result.filter((player) => player.franchise?._id === selectedFranchise)
    }
    setIsLoading(false)
    return result
  }, [availablePlayers, searchQuery, selectedPosition, selectedPrice, selectedFranchise])

  const sectionDisplayName =
    {
      goalkeepers: "Goalkeeper",
      defenders: "Defender",
      midfielders: "Midfielder",
      forwards: "Forward",
    }[section] || "Player"

  const toggleFilterSection = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  const resetFilters = () => {
    setSelectedPosition("")
    setSelectedPrice("")
    setSelectedFranchise("")
  }

  return (
    <Modal visible={visible} animationType="none" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <Animated.View
          className="bg-gray-800 rounded-t-2xl h-5/6 pt-5"
          style={{
            opacity: modalOpacity,
            transform: [{ translateY: modalSlide }],
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 mb-4">
            <View>
              <Text className="text-xl font-bold text-white">{`Select ${sectionDisplayName}`}</Text>
              <Text className="text-sm text-gray-400 mt-1">{filteredPlayers.length} players available</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-9 h-9 rounded-full bg-gray-700/80 items-center justify-center">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search and Filter Bar */}
          <View className="flex-row px-5 mb-4 items-center">
            <View className="flex-1 flex-row items-center bg-gray-700 rounded-xl px-3 h-12">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search players..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-white text-base ml-2 h-12"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity className="w-12 h-12 rounded-xl bg-gray-700 items-center justify-center ml-3" onPress={toggleFilterSection}>
              <Feather name="sliders" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Filter Section */}
          {isFilterExpanded && (
            <View className="bg-gray-700 rounded-xl mx-5 px-5 py-5">
              {/* Position Filter */}
              <Text className="text-white mb-2">Position</Text>
              <Picker
                selectedValue={selectedPosition}
                style={{ color: "#FFFFFF", backgroundColor: "#374151", borderRadius: 5 }}
                onValueChange={(itemValue) => setSelectedPosition(itemValue)}
              >
                <Picker.Item label="All" value="" />
                <Picker.Item label="Forward" value="forward" />
                <Picker.Item label="Defender" value="defender" />
                <Picker.Item label="Midfielder" value="midfielder" />
                <Picker.Item label="Goalkeeper" value="goalkeeper" />
              </Picker>

              {/* Price Filter */}
              <Text className="text-white mt-4 mb-2">Price</Text>
              <Picker
                selectedValue={selectedPrice}
                style={{ color: "#FFFFFF", backgroundColor: "#374151", borderRadius: 5 }}
                onValueChange={(itemValue) => setSelectedPrice(itemValue)}
              >
                <Picker.Item label="All" value="" />
                <Picker.Item label="Upto 5M" value="5" />
                <Picker.Item label="Upto 6M" value="6" />
                <Picker.Item label="Upto 7M" value="7" />
                <Picker.Item label="Upto 8M" value="8" />
                <Picker.Item label="Upto 9M" value="9" />
                <Picker.Item label="Upto 10M" value="10" />
              </Picker>

              {/* Franchise Filter */}
              <Text className="text-white mt-4 mb-2">Franchise</Text>
              <Picker
                selectedValue={selectedFranchise}
                style={{ color: "#FFFFFF", backgroundColor: "#374151", borderRadius: 5 }}
                onValueChange={(itemValue) => setSelectedFranchise(itemValue)}
              >
                <Picker.Item label="All" value="" />
                {Array.isArray(franchises) &&
                  franchises.map((franchise) => (
                    <Picker.Item
                      key={franchise._id || franchise.name}
                      label={franchise.name}
                      value={franchise._id}
                    />
                  ))}
              </Picker>

              {/* Reset and Apply Buttons */}
              <View className="flex-row justify-between mt-5">
                <TouchableOpacity onPress={resetFilters} className="bg-gray-500 rounded-md px-4 py-2">
                  <Text className="text-white font-bold">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleFilterSection} className="bg-green-500 rounded-md px-4 py-2">
                  <Text className="text-white font-bold">Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Player List */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className="text-gray-400 text-sm mt-3">Loading players...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredPlayers}
              keyExtractor={(item) => item._id || item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => onSelectPlayer(item)}
                  className="flex-row bg-gray-700 rounded-2xl p-3 mb-3 items-center"
                >
                  <Image
                    source={{ uri: item.photo || "https://via.placeholder.com/150" }}
                    className="w-14 h-14 rounded-full bg-gray-600"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-white text-base font-bold">{item.name}</Text>
                    <Text className="text-gray-400 text-sm mt-1">{item.franchise?.name || "No Franchise"}</Text>
                  </View>
                  <Ionicons name="add-circle" size={28} color="#10B981" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-10">
                  <Ionicons name="search-outline" size={48} color="#6B7280" />
                  <Text className="text-white text-base font-bold mt-3">No players found</Text>
                  <Text className="text-gray-400 text-sm mt-1 text-center">Try adjusting your search or filters</Text>
                </View>
              }
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  )
}

export default PlayerSelectionModal