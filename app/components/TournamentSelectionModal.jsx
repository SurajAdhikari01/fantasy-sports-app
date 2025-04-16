import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Button,
  Platform,
} from "react-native";
import api from "../config/axios";

const TournamentSelectionModal = ({ visible, onClose, onTournamentSelect }) => {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);
    setTournaments([]); // Clear previous tournaments

    try {
      // Replace with your actual API endpoint if different
      const response = await api.get("/tournaments/getAllTournaments");
      if (response.data?.success) {
        const fetchedTournaments = response.data.data || [];
        setTournaments(fetchedTournaments);
        if (fetchedTournaments.length === 0) {
          setInfoMessage("Cannot find any tournaments.");
        }
      } else {
        setError(response.data?.message || "Failed to fetch tournaments.");
      }
    } catch (err) {
      console.error("Fetch Tournaments Error:", err);
      const message =
        err.response?.data?.message ||
        (err.response?.status
          ? `Status ${err.response.status}`
          : "Network Error");
      setError(`Error fetching tournaments: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch tournaments only when the modal becomes visible
    if (visible) {
      fetchTournaments();
    }
  }, [visible, fetchTournaments]);

  const handleSelect = (tournament) => {
    if (tournament && tournament._id && tournament.name) {
      onTournamentSelect(tournament); // Pass the whole tournament object or just id/name
    } else {
      console.warn("Selected tournament is missing _id or name", tournament);
      // Optionally show an error to the user
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.itemText}>
        {item.name || `Tournament ID: ${item._id}`}
      </Text>
      {/* Add more details if needed, e.g., item.startDate */}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose} // For Android back button
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Tournament</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#007AFF"
              style={styles.centered}
            />
          ) : error ? (
            <Text style={[styles.messageText, styles.errorText]}>{error}</Text>
          ) : infoMessage ? (
            <Text style={[styles.messageText, styles.infoText]}>
              {infoMessage}
            </Text>
          ) : (
            <FlatList
              data={tournaments}
              renderItem={renderItem}
              keyExtractor={(item) => item._id} // Ensure unique keys
              ListEmptyComponent={
                <Text style={styles.messageText}>No tournaments found.</Text>
              } // Fallback if fetch succeeds but data is empty array
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8", // Background for the safe area
  },
  modalContent: {
    flex: 1,
    padding: Platform.OS === "ios" ? 15 : 20, // Adjust padding for platform
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    // backgroundColor: '#e0e0e0', // Optional background for button
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#007AFF", // iOS blue
    fontWeight: "500",
  },
  itemContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
    color: "#444",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 30,
    paddingHorizontal: 20,
    color: "#555",
  },
  errorText: {
    color: "red",
  },
  infoText: {
    color: "blue",
  },
});

export default TournamentSelectionModal;
