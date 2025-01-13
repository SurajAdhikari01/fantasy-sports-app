import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const AdminDashboard = () => {
  return (
    <StyledSafeAreaView className="flex-1 bg-gray-900 p-4">
      <StyledView className="w-full items-center mt-10">
        <StyledTouchableOpacity
          className="w-full"
          onPress={() => router.push("(admin)/createTeamForm")}
        >
          <LinearGradient
            colors={["#ff9a9e", "#fad0c4", "#fad0c4", "#ff9a9e"]}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              width: "100%",
              paddingVertical: 24,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
            }}
          >
            <Ionicons
              name="add"
              size={24}
              color="black"
              style={{
                borderWidth: 3,
                borderColor: "black",
                borderRadius: 4,
                padding: 0,
                marginRight: 8,
                backgroundColor: "white",
              }}
            />
            <StyledText className="text-black text-lg font-extrabold">
              Create New Team
            </StyledText>
          </LinearGradient>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledSafeAreaView>
  );
};

export default AdminDashboard;
