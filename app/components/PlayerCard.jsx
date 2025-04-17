import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { viewModeState } from "./atoms";

const PlayerCard = ({ player, isPitch, onRemovePlayer, onReplacePlayer, position, playerPoints }) => {
  const viewMode = useRecoilValue(viewModeState);
  const [PlayerDetailVisible, setPlayerDetailVisible] = useState(false);
  const isViewTeam = viewMode === "VIEW_TEAM";

  // Function to handle player press and open the modal
  const handlePlayerPress = () => {
    setPlayerDetailVisible(true);
  };

  // Default position if none is provided
  const defaultPosition = { x: 0, y: 0 };
  const safePosition = position || defaultPosition;

  // Get franchise name (if available)
  const franchiseName = player.franchise?.name || "Free Agent";

  return (
    <>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 100,
        }}
      >
        {/* Player Circle */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderWidth: 2,
            borderColor: "#10B981",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity style={{ width: "100%", height: "100%" }} onPress={handlePlayerPress}>
            {player.photo ? (
              <Image source={{ uri: player.photo }} style={{ width: "100%", height: "100%", borderRadius: 30 }} />
            ) : (
              <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontWeight: "bold" }}>{player.name ? player.name.substring(0, 2).toUpperCase() : ""}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Player name and points below the circle */}
        <View style={styles.infoContainer}>
          <Text
            style={styles.playerName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {player.name}
          </Text>

          {isViewTeam && playerPoints !== undefined && (
            <Text style={styles.pointsText}>{playerPoints} pts</Text>
          )}
        </View>
      </View>

      {/* Modal for detailed player view */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={PlayerDetailVisible}
        onRequestClose={() => setPlayerDetailVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={0.9}
            onPress={() => setPlayerDetailVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButtonSmall}
                onPress={() => setPlayerDetailVisible(false)}
              >
                {/* <Text style={{ fontSize: 20, color: "#666", marginRight: 5 }}>Close</Text> */}
                <Ionicons name="close" size={30} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.playerImageContainer}>
                <Image source={{ uri: player.photo }} style={styles.modalImage} />
                {player.playerType && (
                  <View style={styles.playerTypeBadge}>
                    <Text style={styles.playerTypeBadgeText}>{player.playerType}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.modalName}>{player.name}</Text>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Price</Text>
                  <Text style={styles.statValue}>${player.price}M</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Points</Text>
                  <Text style={styles.statValue}>
                    {isViewTeam && playerPoints !== undefined ? playerPoints : (player.points || 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.franchiseContainer}>
                <Ionicons name="shield-outline" size={18} color="#666" />
                <Text style={styles.franchiseLabel}>Franchise: </Text>
                <Text style={styles.franchiseValue}>{franchiseName}</Text>
              </View>

              {!isViewTeam && (
                <View style={styles.actionsContainer}>
                  {/* Replace Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.replaceButton]}
                    onPress={() => {
                      setPlayerDetailVisible(false);
                      onReplacePlayer(player);
                    }}
                  >
                    <Ionicons name="swap-horizontal" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Replace</Text>
                  </TouchableOpacity>

                  {/* Remove Button */}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => {
                      setPlayerDetailVisible(false);
                      onRemovePlayer(player);
                    }}
                  >
                    <Ionicons name="trash" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
    width: 70,
    alignItems: "center",
  },
  playerName: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    maxWidth: "100%",
  },
  pointsText: {
    color: "#3B82F6", // Blue 
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'flex-end',
    padding: 12,
  },
  closeButtonSmall: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  playerImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#10B981",
  },
  playerTypeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playerTypeBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: '#333', // Darker text
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#666", // Grey 
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // Darker text for value
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB", // Light grey 
    marginHorizontal: 15,
  },
  franchiseContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6", // Light grey background
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
    alignSelf: 'center',
  },
  franchiseLabel: {
    fontSize: 15,
    color: "#666",
    marginLeft: 6,
  },
  franchiseValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 6,
  },
  replaceButton: {
    backgroundColor: "#3B82F6", // Blue
  },
  removeButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default PlayerCard;