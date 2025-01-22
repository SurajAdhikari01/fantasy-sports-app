import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import api from "../config/axios";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

// Initialize Cloudinary
const cloudName = "dxsorugt0"; // Replace with your Cloudinary cloud name
const uploadPreset = "fantasy"; // Replace with your Cloudinary upload preset

const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const AddPlayerForm = () => {
  const playerPositions = [
    { label: "Goalkeeper (GK)", value: "goalkeeper" },
    { label: "Defender", value: "defender" },
    { label: "Midfielder", value: "midfielder" },
    { label: "Forward", value: "forward" },
  ];

  const { tournament: tournamentParam } = useLocalSearchParams();
  const tournament = JSON.parse(tournamentParam || "{}");
  const router = useRouter();

  const [playerData, setPlayerData] = useState({
    name: "",
    price: 0,
    photo: "",
    matches: [],
    playerType: "", // Start with an empty value
    tournamentId: tournament?._id,
    franchiseId: "", // Start with an empty value
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Sorry, we need camera roll permissions to upload images!"
          );
        }
      }
    })();
  }, []);

  const handleInputChange = (name, value) => {
    setPlayerData({
      ...playerData,
      [name]: name === "price" ? parseInt(value) || 0 : value,
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setImagePreview(imageUri);

        setIsUploading(true); // Set uploading state to true

        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          type: "image/jpeg",
          name: "upload.jpg",
        });
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        const imageUrl = data.secure_url;

        setPlayerData({ ...playerData, photo: imageUrl });
        setIsUploading(false); // Set uploading state to false
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
      setIsUploading(false); // Set uploading state to false in case of error
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting player data:", playerData);

      if (!playerData.name || playerData.price <= 0 || !playerData.photo) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      const formData = new FormData();
      Object.keys(playerData).forEach((key) => {
        formData.append(key, playerData[key]);
      });

      const response = await api.post("/players/addNewPlayer", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        Alert.alert("Success", "Player added successfully.");

        router.back();
      } else {
        console.error("Failed to add player:", response);
        Alert.alert("Error", "Failed to add player. Please try again.");
      }
    } catch (error) {
      console.error("Error adding player:", error);
      Alert.alert("Error", "Failed to add player. Please try again.");
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      <StyledScrollView>
        <StyledView className="flex-row items-center mb-4">
          <StyledTouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </StyledTouchableOpacity>
          <StyledText className="text-lg text-white ml-2">
            Add Player
          </StyledText>
        </StyledView>

        <StyledView className="w-full mb-4">
          <StyledText className="text-white mb-2">Name</StyledText>
          <StyledTextInput
            className="bg-gray-800 text-white p-2 rounded-lg"
            placeholder="Enter player name"
            placeholderTextColor="#888"
            value={playerData.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
        </StyledView>

        <StyledView className="w-full mb-4">
          <StyledText className="text-white mb-2">Price</StyledText>
          <StyledTextInput
            className="bg-gray-800 text-white p-2 rounded-lg"
            placeholder="Enter player price"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={playerData.price.toString()}
            onChangeText={(text) => handleInputChange("price", text)}
          />
        </StyledView>

        <StyledView className="w-full mb-4">
          <StyledText className="text-white mb-2">Player Position</StyledText>
          <StyledView className="bg-gray-800 rounded-lg">
            <Picker
              selectedValue={playerData.playerType}
              onValueChange={(itemValue) =>
                handleInputChange("playerType", itemValue)
              }
              style={{ color: "white" }}
              itemStyle={{ color: "white" }}
            >
              <Picker.Item
                style={styles.pickerItem}
                label="Select a position..."
                value=""
              />
              {playerPositions.map((position) => (
                <Picker.Item
                  style={styles.pickerItem}
                  key={position.value}
                  label={position.label}
                  value={position.value}
                />
              ))}
            </Picker>
          </StyledView>
        </StyledView>

        <StyledView className="w-full mb-4">
          <StyledText className="text-white mb-2">Franchise</StyledText>
          <StyledView className="bg-gray-800 rounded-lg">
            <Picker
              selectedValue={playerData.franchiseId}
              onValueChange={(itemValue) =>
                handleInputChange("franchiseId", itemValue)
              }
              style={{ color: "white" }}
              itemStyle={{ color: "white" }}
            >
              <Picker.Item
                style={styles.pickerItem}
                label="Select a franchise..."
                value=""
              />
              {tournament?.franchises?.map((franchise) => (
                <Picker.Item
                  style={styles.pickerItem}
                  key={franchise._id}
                  label={franchise.name}
                  value={franchise._id}
                />
              ))}
            </Picker>
          </StyledView>
        </StyledView>

        <StyledView className="w-full mb-4">
          <StyledText className="text-white mb-2">Photo</StyledText>
          <StyledTouchableOpacity
            className="bg-gray-800 p-4 rounded-lg mb-2"
            onPress={pickImage}
          >
            <StyledText className="text-white text-center">
              Pick an image from camera roll
            </StyledText>
          </StyledTouchableOpacity>

          {isUploading && <ActivityIndicator size="large" color="#00ff00" />}

          {imagePreview && (
            <StyledView className="mt-2 items-center">
              <StyledImage
                source={{ uri: imagePreview }}
                className="w-32 h-32 rounded-lg"
                resizeMode="cover"
              />
            </StyledView>
          )}
        </StyledView>

        <StyledTouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mt-4"
          onPress={handleSubmit}
          disabled={isUploading} // Disable submit button while uploading
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <StyledText className="text-white text-center font-bold">
              Add Player
            </StyledText>
          )}
        </StyledTouchableOpacity>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

const styles = StyleSheet.create({
  pickerItem: {
    color: "white",
  },
});

export default AddPlayerForm;
