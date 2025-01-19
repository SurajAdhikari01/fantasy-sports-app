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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import api from "../config/axios";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);

const AddPlayerForm = () => {
  const playerPositions = [
    { label: "Goalkeeper (GK)", value: "goalkeeper" },
    { label: "Centre Back (CB)", value: "centre-back" },
    { label: "Right Back (RB)", value: "right-back" },
    { label: "Left Back (LB)", value: "left-back" },
    { label: "Defensive Midfielder (DM)", value: "defensive-midfielder" },
    { label: "Central Midfielder (CM)", value: "central-midfielder" },
    { label: "Attacking Midfielder (AM)", value: "attacking-midfielder" },
    { label: "Right Winger (RW)", value: "right-winger" },
    { label: "Left Winger (LW)", value: "left-winger" },
    { label: "Striker (ST)", value: "striker" },
    { label: "Forward (FW)", value: "forward" },
  ];
  const { tournamentId, franchiseId } = useLocalSearchParams();
  const router = useRouter();
  const [playerData, setPlayerData] = useState({
    name: "",
    price: "",
    photo: "",
    matches: [],
    playerType: "", // Start with an empty value
    tournamentId: tournamentId,
    franchiseId: franchiseId,
  });
  const [imagePreview, setImagePreview] = useState(null);

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
    setPlayerData({ ...playerData, [name]: value });
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
        setPlayerData({ ...playerData, photo: imageUri });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!playerData.name || !playerData.price || !playerData.photo) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

      const formData = new FormData();

      if (playerData.photo) {
        const photoName = playerData.photo.split("/").pop();
        const photoType = "image/" + (photoName.split(".").pop() || "jpeg");

        formData.append("photo", {
          uri: playerData.photo,
          name: photoName,
          type: photoType,
        });
      }

      Object.keys(playerData).forEach((key) => {
        if (key !== "photo") {
          formData.append(key, playerData[key]);
        }
      });

      const response = await api.post("/players", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        Alert.alert("Success", "Player added successfully!");
        router.back();
      } else {
        Alert.alert("Error", "Failed to add player. Please try again.");
      }
    } catch (error) {
      console.error("Error adding player:", error);
      Alert.alert("Error", "Failed to add player. Please try again.");
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      <StyledView className="flex-row items-center mb-4">
        <StyledTouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </StyledTouchableOpacity>
        <StyledText className="text-lg text-white ml-2"> Add Player</StyledText>
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
        <StyledText className="text-white mb-2">Photo</StyledText>
        <StyledTouchableOpacity
          className="bg-gray-800 p-4 rounded-lg mb-2"
          onPress={pickImage}
        >
          <StyledText className="text-white text-center">
            Pick an image from camera roll
          </StyledText>
        </StyledTouchableOpacity>

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
      >
        <StyledText className="text-white text-center font-bold">
          Add Player
        </StyledText>
      </StyledTouchableOpacity>
    </StyledSafeAreaView>
  );
};

const styles = StyleSheet.create({
  pickerItem: {
    color: "white",
  },
});

export default AddPlayerForm;
