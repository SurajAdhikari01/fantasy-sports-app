import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const Container = styled(
  View,
  "flex-1 justify-center items-center bg-gray-900 px-4"
);
const Title = styled(Text, "text-3xl text-blue-400 font-bold");
const Button = styled(Pressable, "mt-6 p-4 bg-blue-600 rounded-lg");
const ButtonText = styled(Text, "text-white text-lg font-bold");

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:9005/api/v1/users/logout");

      // Clear the stored user data
      await SecureStore.deleteItemAsync("userData");

      Alert.alert("Success", "Logged out successfully!");

      // Redirect to sign-in page
      router.push("/.auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <Container>
      <Title>Profile</Title>
      {/* Add profile details */}
      <Button onPress={handleLogout}>
        <ButtonText>Log Out</ButtonText>
      </Button>
    </Container>
  );
}
