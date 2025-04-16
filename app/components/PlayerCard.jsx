import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { viewModeState } from "./atoms";

const PlayerCard = ({ player, isPitch, onRemovePlayer, onReplacePlayer, position, playerPoints }) => {
  const viewMode = useRecoilValue(viewModeState); // Get the current view mode
  const [modalVisible, setModalVisible] = useState(false); // Modal state
  const isViewTeam = viewMode === "VIEW_TEAM";

  // Function to handle player press and open the modal
  const handlePlayerPress = () => {
    setModalVisible(true);
  };

  // Default position if none is provided
  const defaultPosition = { x: 0, y: 0 };
  const safePosition = position || defaultPosition;

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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Image source={{ uri: player.photo }} style={styles.modalImage} />
              <Text style={styles.modalName}>{player.name}</Text>
              <Text style={styles.modalType}>{player.playerType}</Text>
              <Text style={styles.modalPrice}>Price: ${player.price}M</Text>

              {/* Display points in modal, prioritize calculated points in view mode */}
              <Text style={styles.modalPoints}>
                Points: {isViewTeam && playerPoints !== undefined ? playerPoints : (player.points || 0)}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                <Text style={styles.franchiseLabel}>Franchise: </Text>
                <Text style={styles.franchiseValue}>
                  {player.franchise?.name || "Free Agent"}
                </Text>
              </View>

              {(viewMode === "MANAGE_TEAM" || viewMode === "EDIT_TEAM") && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#F87171" }]}
                    onPress={() => {
                      setModalVisible(false);
                      onRemovePlayer(player);
                    }}
                  >
                    <Ionicons name="trash" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Remove Player</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#3B82F6" }]}
                    onPress={() => {
                      setModalVisible(false);
                      onReplacePlayer(player);
                    }}
                  >
                    <Ionicons name="swap-horizontal" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Replace Player</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={[styles.closeButton, { marginTop: 20 }]}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="white" />
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
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
    color: "#3B82F6", // Blue color for points
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalScroll: {
    alignItems: "center",
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  modalName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalType: {
    fontSize: 16,
    color: "gray",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalPoints: {
    fontSize: 16,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  actionButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
  franchiseLabel: {
    fontSize: 16,
    marginRight: 5,
  },
  franchiseValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PlayerCard;