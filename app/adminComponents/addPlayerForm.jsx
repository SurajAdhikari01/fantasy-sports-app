import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  StyleSheet, // Keep StyleSheet if other styles exist, otherwise remove
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import api from "../config/axios"; // Ensure path is correct
// Remove Picker import if no longer used elsewhere
// import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import CustomDropdown from "./customDropdown"; // *** Import CustomDropdown *** (Adjust path if needed)

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
  // Define positions directly in the format needed for CustomDropdown
  const playerPositions = [
    { label: "Goalkeeper", value: "goalkeeper" },
    { label: "Defender", value: "defender" },
    { label: "Midfielder", value: "midfielder" },
    { label: "Forward", value: "forward" },
  ];

  const { tournament: tournamentParam } = useLocalSearchParams();
  let tournament = {}; // Initialize as empty object
  try {
    // Safely parse tournament data
    tournament = tournamentParam ? JSON.parse(tournamentParam) : {};
  } catch (e) {
    console.error("Error parsing tournament data:", e);
    Alert.alert("Error", "Invalid tournament data received.");
    // Optionally navigate back or show an error state
  }

  const router = useRouter();

  const [playerData, setPlayerData] = useState({
    name: "",
    price: "", // Keep price as string for input, parse on submit/change
    photo: "",
    // matches: [], // Matches likely added later, not on creation? Removed for simplicity.
    playerType: "", // Dropdown selection value
    tournamentId: tournament?._id || null, // Ensure tournamentId is set or null
    franchiseId: "", // Dropdown selection value
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  // Prepare franchise options for the dropdown
  const franchiseOptions =
    tournament?.franchises?.map((f) => ({
      label: f.name,
      value: f._id,
    })) || []; // Ensure it's an array

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied", // Clearer title
            "Camera roll access is required to upload player photos."
          );
        }
      }
    })();
  }, []);

  const handleInputChange = (name, value) => {
    // Handle price separately to allow empty string but store number eventually
    if (name === "price") {
      setPlayerData({
        ...playerData,
        [name]: value, // Keep as string in state for input flexibility
      });
    } else {
      setPlayerData({
        ...playerData,
        [name]: value,
      });
    }
  };

  const pickImage = async () => {
    // Check permissions again before picking
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll access in your device settings to upload photos."
        );
        return; // Stop if permission not granted
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Use 1:1 aspect ratio for profile pics?
        quality: 0.8, // Reduce quality slightly for faster uploads
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImagePreview(imageUri); // Show preview immediately

        setIsUploading(true); // Indicate upload start

        const formData = new FormData();
        // Determine file type (more robustly if possible)
        let fileType = "image/jpeg";
        if (imageUri.endsWith(".png")) {
          fileType = "image/png";
        }
        let fileName = imageUri.split("/").pop() || "upload.jpg";
        // Ensure unique enough filename if needed, though Cloudinary handles it
        // fileName = `${Date.now()}_${fileName}`;

        formData.append("file", {
          uri: imageUri,
          type: fileType, // Dynamically set type if possible
          name: fileName,
        });
        formData.append("upload_preset", uploadPreset);
        formData.append("cloud_name", cloudName); // Often needed

        console.log("Uploading to Cloudinary...");
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
            headers: {
              // Not usually needed for basic preset upload
              // 'Content-Type': 'multipart/form-data', // fetch usually sets this
            },
          }
        );

        const responseText = await response.text(); // Get raw response text
        // console.log("Cloudinary Raw Response:", responseText);

        if (!response.ok) {
          // Attempt to parse error if possible
          try {
            const errorData = JSON.parse(responseText);
            console.error("Cloudinary Upload Error:", errorData);
            throw new Error(
              errorData.error?.message ||
                `HTTP error! status: ${response.status}`
            );
          } catch (parseError) {
            console.error(
              "Cloudinary Upload Error (non-JSON response):",
              responseText
            );
            throw new Error(
              `HTTP error! status: ${response.status} - ${responseText}`
            );
          }
        }

        const data = JSON.parse(responseText); // Parse JSON only if response is ok
        // console.log("Cloudinary Success Response:", data);
        const imageUrl = data.secure_url;

        if (!imageUrl) {
          throw new Error("Cloudinary response did not contain a secure_url.");
        }

        setPlayerData((prevData) => ({ ...prevData, photo: imageUrl }));
        setIsUploading(false); // Indicate upload finish
        console.log("Image uploaded:", imageUrl);
      } else {
        // console.log("Image picking cancelled or no assets found.");
      }
    } catch (error) {
      console.error("Error during image pick/upload:", error);
      Alert.alert("Upload Error", `Failed to upload image: ${error.message}`);
      setIsUploading(false); // Ensure loading state is reset on error
      setImagePreview(null); // Optionally clear preview on error
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); // Indicate submission start

    // --- Validation ---
    const priceValue = parseInt(playerData.price);
    if (!playerData.name.trim()) {
      Alert.alert("Validation Error", "Please enter the player's name.");
      setIsSubmitting(false);
      return;
    }
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid price greater than 0."
      );
      setIsSubmitting(false);
      return;
    }
    if (!playerData.playerType) {
      Alert.alert("Validation Error", "Please select the player's position.");
      setIsSubmitting(false);
      return;
    }
    if (!playerData.franchiseId) {
      Alert.alert("Validation Error", "Please select the player's franchise.");
      setIsSubmitting(false);
      return;
    }
    if (!playerData.photo) {
      Alert.alert("Validation Error", "Please upload the player's photo.");
      setIsSubmitting(false);
      return;
    }
    if (!playerData.tournamentId) {
      Alert.alert("Error", "Tournament ID is missing. Cannot add player.");
      setIsSubmitting(false);
      return;
    }
    // --- End Validation ---

    // Prepare data for submission (ensure price is a number)
    const dataToSubmit = {
      ...playerData,
      price: priceValue,
    };

    console.log(
      "Submitting player data:",
      JSON.stringify(dataToSubmit, null, 2)
    ); // Use JSON.stringify for better logging

    try {
      // Use POST request with JSON body
      const response = await api.post("/players/addNewPlayer", dataToSubmit, {
        headers: {
          "Content-Type": "application/json", // Ensure correct content type
        },
      });

      // Check for successful status code (e.g., 201 Created)
      if (response.status === 201 || response.status === 200) {
        // Allow 200 OK as well
        Alert.alert("Success", "Player added successfully!");
        router.back(); // Navigate back after success
      } else {
        // Handle potential API errors included in the response body
        const errorMessage =
          response.data?.message ||
          `Server responded with status ${response.status}`;
        console.error(
          "Failed to add player:",
          response.data || response.status
        );
        Alert.alert(
          "Submission Error",
          `Failed to add player: ${errorMessage}`
        );
      }
    } catch (error) {
      console.error(
        "Error adding player:",
        error.response?.data || error.message || error
      );
      // Provide more specific error feedback if possible
      let message = "An unexpected error occurred. Please try again.";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      Alert.alert("Submission Error", message);
    } finally {
      setIsSubmitting(false); // Indicate submission finish
    }
  };

  // Determine if submit button should be disabled
  const isSubmitDisabled = isUploading || isSubmitting;

  return (
    <StyledSafeAreaView className="flex-1 bg-[#2a2a2a]">
      {/* Header */}
      <StyledView className="flex-row items-center p-4 border-b border-gray-700">
        <StyledTouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </StyledTouchableOpacity>
        <StyledText className="text-xl text-white font-semibold">
          Add New Player
        </StyledText>
      </StyledView>

      <StyledScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Player Name */}
        <StyledView className="w-full mb-4">
          <StyledText className="text-white mb-2 ml-1">Player Name</StyledText>
          <StyledTextInput
            className="bg-[#3a3a3a] text-white p-3 rounded-lg border border-gray-700"
            placeholder="Enter player name"
            placeholderTextColor="#888"
            value={playerData.name}
            onChangeText={(text) => handleInputChange("name", text)}
            editable={!isSubmitDisabled} // Disable input while submitting/uploading
          />
        </StyledView>

        {/* Player Price */}
        <StyledView className="w-full mb-4">
          <StyledText className="text-white mb-2 ml-1">Price</StyledText>
          <StyledTextInput
            className="bg-[#3a3a3a] text-white p-3 rounded-lg border border-gray-700"
            placeholder="Enter player price (e.g., 100)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={playerData.price.toString()} // Keep value as string for input
            onChangeText={(text) =>
              handleInputChange("price", text.replace(/[^0-9]/g, ""))
            } // Allow only numbers
            editable={!isSubmitDisabled}
          />
        </StyledView>

        {/* Player Position Dropdown */}
        <StyledView className="w-full mb-4">
          <CustomDropdown
            label="Player Position"
            options={playerPositions}
            selectedValue={playerData.playerType}
            onValueChange={(value) => handleInputChange("playerType", value)}
            placeholder="-- Select Position --"
            disabled={isSubmitDisabled}
          />
        </StyledView>

        {/* Franchise Dropdown */}
        <StyledView className="w-full mb-4">
          <CustomDropdown
            label="Franchise"
            options={franchiseOptions}
            selectedValue={playerData.franchiseId}
            onValueChange={(value) => handleInputChange("franchiseId", value)}
            placeholder="-- Select Franchise --"
            disabled={franchiseOptions.length === 0 || isSubmitDisabled} // Also disable if no options
          />
          {franchiseOptions.length === 0 && (
            <StyledText className="text-xs text-yellow-400 mt-1 ml-1 italic">
              No franchises found for this tournament.
            </StyledText>
          )}
        </StyledView>

        {/* Photo Upload */}
        <StyledView className="w-full mb-4">
          <StyledText className="text-white mb-2 ml-1">Player Photo</StyledText>
          <StyledTouchableOpacity
            className={`bg-[#3a3a3a] p-4 rounded-lg mb-2 border border-gray-700 flex-row justify-center items-center ${
              isUploading ? "opacity-50" : ""
            }`}
            onPress={pickImage}
            disabled={isUploading} // Disable while uploading
          >
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={isUploading ? "#888" : "white"}
              style={{ marginRight: 8 }}
            />
            <StyledText
              className={`text-center ${
                isUploading ? "text-gray-500" : "text-white"
              }`}
            >
              {isUploading
                ? "Uploading..."
                : playerData.photo
                ? "Change Photo"
                : "Upload Photo"}
            </StyledText>
          </StyledTouchableOpacity>

          {/* Preview Area */}
          {imagePreview &&
            !isUploading && ( // Show preview only when not uploading
              <StyledView className="mt-2 items-center p-2 bg-[#3a3a3a] rounded-lg border border-gray-700">
                <StyledImage
                  source={{ uri: imagePreview }}
                  className="w-32 h-32 rounded-md" // Slightly rounded corners
                  resizeMode="cover"
                />
                <StyledText className="text-xs text-gray-400 mt-1">
                  Preview
                </StyledText>
              </StyledView>
            )}
          {/* Show indicator below button while uploading */}
          {isUploading && (
            <StyledView className="items-center mt-2">
              <ActivityIndicator size="small" color="#00bfff" />
              <StyledText className="text-xs text-gray-400 mt-1">
                Processing image...
              </StyledText>
            </StyledView>
          )}
        </StyledView>

        {/* Submit Button */}
        <StyledTouchableOpacity
          className={`p-4 rounded-lg mt-5 ${
            isSubmitDisabled ? "bg-gray-600" : "bg-blue-600 shadow-md"
          }`} // Use blue, disable style
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <StyledView className="flex-row justify-center items-center">
              <Ionicons
                name="person-add-outline"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <StyledText className="text-white text-center font-bold text-base">
                Add Player
              </StyledText>
            </StyledView>
          )}
        </StyledTouchableOpacity>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
};

// Keep StyleSheet if needed for other styles, otherwise remove
const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16, // Use padding on the scroll view content
    paddingBottom: 40, // Extra padding at the bottom
  },
  // pickerItem style is likely no longer needed if Picker is removed
  // pickerItem: {
  //   color: "white", // This might not work reliably across platforms for native Picker
  // },
});

export default AddPlayerForm;
