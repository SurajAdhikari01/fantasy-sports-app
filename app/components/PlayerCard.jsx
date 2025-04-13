import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { viewModeState } from "./atoms"; // Assuming atoms file is in the same directory
import { styled } from "nativewind";

// Create styled components for NativeWind compatibility
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledModal = styled(Modal);

const PlayerCard = ({
  player,
  isPitch,
  onRemovePlayer,
  onReplacePlayer,
  position,
  playerPoints,
}) => {
  const viewMode = useRecoilValue(viewModeState);
  const [modalVisible, setModalVisible] = useState(false);
  const isViewTeam = viewMode === "VIEW_TEAM";
  const isManageTeam = viewMode === "MANAGE_TEAM";

  const handlePlayerPress = () => {
    if (player) {
      setModalVisible(true);
    }
  };

  // Handle potential missing player data gracefully
  const playerName = player?.name || "N/A";
  const playerPhoto = player?.photo;
  const playerType = player?.playerType || "Unknown";
  const playerPrice = player?.price !== undefined ? player.price : "-";
  const franchiseName = player?.franchise?.name || "Free Agent";
  const displayPoints =
    isViewTeam && playerPoints !== undefined
      ? playerPoints
      : player?.points || 0;

  return (
    <>
      {/* Card Container */}
      <StyledTouchableOpacity
        className="items-center justify-start w-[70px] h-[95px]"
        onPress={handlePlayerPress}
        activeOpacity={0.8}
      >
        {/* Player Circle */}
        {/* Use a slightly lighter gray for dark mode circle background */}
        <StyledView className="w-[50px] h-[50px] rounded-full bg-gray-600 border-2 border-teal-400 items-center justify-center shadow-md relative overflow-visible">
          {playerPhoto ? (
            <StyledImage
              source={{ uri: playerPhoto }}
              className="w-full h-full rounded-full"
            />
          ) : (
            // Placeholder with lighter icon on dark bg
            <StyledView className="w-full h-full items-center justify-center bg-gray-700 rounded-full">
              <FontAwesome5 name="user-alt" size={24} color="#9CA3AF" />{" "}
              {/* Lighter gray icon */}
            </StyledView>
          )}

          {/* Points badge - Keep bright for visibility */}
          {isViewTeam &&
            playerPoints !== undefined &&
            playerPoints !== null && (
              <StyledView className="absolute -top-1.5 -right-1.5 bg-blue-500 min-w-[22px] h-[22px] rounded-full px-1 items-center justify-center border-2 border-gray-800 z-10 shadow">
                {/* Border color matches dark background */}
                <StyledText className="text-white text-[11px] font-bold">
                  {playerPoints}
                </StyledText>
              </StyledView>
            )}
        </StyledView>

        {/* Player Name - Use a lighter background for dark mode */}
        <StyledView className="mt-1.5 bg-gray-700/80 px-2 py-1 rounded-full max-w-full">
          <StyledText
            className="text-gray-100 text-[11px] font-medium text-center" // Light text
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {playerName}
          </StyledText>
        </StyledView>
      </StyledTouchableOpacity>

      {/* Modal */}
      {player && (
        <StyledModal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          {/* Modal Overlay */}
          <StyledView className="flex-1 bg-black/70 justify-center items-center p-5">
            {/* Modal Content - Dark Theme */}
            <StyledView className="w-full max-w-sm bg-[#3a3a3a] rounded-2xl p-5 pt-10 items-center shadow-lg relative">
              {/* Close Button Top Right */}
              <StyledTouchableOpacity
                className="absolute top-3 right-3 z-20" // Adjusted position slightly
                onPress={() => setModalVisible(false)}
              >
                {/* Lighter close icon for dark background */}
                <Ionicons name="close-circle" size={30} color="#9CA3AF" />
              </StyledTouchableOpacity>

              <StyledScrollView
                contentContainerStyle={{ alignItems: "center", width: "100%" }}
                showsVerticalScrollIndicator={false}
              >
                {/* Modal Player Image - Darker container background */}
                <StyledView className="w-[110px] h-[110px] rounded-full mb-5 bg-gray-700 shadow-md items-center justify-center">
                  {playerPhoto ? (
                    <StyledImage
                      source={{ uri: playerPhoto }}
                      className="w-[100px] h-[100px] rounded-full"
                    />
                  ) : (
                    // Darker placeholder bg, lighter icon
                    <StyledView className="w-[100px] h-[100px] rounded-full bg-gray-600 items-center justify-center border border-gray-500">
                      <FontAwesome5 name="user-alt" size={40} color="#E5E7EB" />
                    </StyledView>
                  )}
                </StyledView>

                {/* Player Details - Light text on dark background */}
                <StyledText className="text-2xl font-bold mb-3 text-center text-gray-100">
                  {playerName}
                </StyledText>
                <StyledText className="text-base text-gray-300 mb-2 text-center">
                  Position: {playerType}
                </StyledText>
                <StyledText className="text-base text-gray-300 mb-2 text-center">
                  Price: ${playerPrice}M
                </StyledText>
                <StyledText className="text-base text-gray-300 mb-4 text-center">
                  Points: {displayPoints}
                </StyledText>

                {/* Franchise Info - Darker background */}
                <StyledView className="flex-row items-center my-3 bg-gray-700 py-1.5 px-3 rounded-lg">
                  <StyledText className="text-sm text-gray-400">
                    Franchise:{" "}
                  </StyledText>
                  <StyledText className="text-sm font-semibold text-gray-200">
                    {franchiseName}
                  </StyledText>
                </StyledView>

                {/* Action Buttons - Keep colors bright for actions */}
                {isManageTeam && (
                  <StyledView className="flex-row justify-around w-full mt-4 px-2">
                    <StyledTouchableOpacity
                      className="flex-row items-center justify-center py-3 px-4 rounded-lg bg-red-600 flex-1 mx-1.5 shadow-sm active:bg-red-700" // Keep remove button red
                      onPress={() => {
                        setModalVisible(false);
                        setTimeout(() => onRemovePlayer(player), 50);
                      }}
                      activeOpacity={0.8} // Use active state for feedback
                    >
                      <Ionicons name="trash-outline" size={18} color="white" />
                      <StyledText className="text-white ml-2 font-bold text-sm">
                        Remove
                      </StyledText>
                    </StyledTouchableOpacity>

                    <StyledTouchableOpacity
                      className="flex-row items-center justify-center py-3 px-4 rounded-lg bg-blue-600 flex-1 mx-1.5 shadow-sm active:bg-blue-700" // Keep replace button blue
                      onPress={() => {
                        setModalVisible(false);
                        setTimeout(() => onReplacePlayer(player), 50);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="swap-horizontal-outline"
                        size={18}
                        color="white"
                      />
                      <StyledText className="text-white ml-2 font-bold text-sm">
                        Replace
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                )}
              </StyledScrollView>
            </StyledView>
          </StyledView>
        </StyledModal>
      )}
    </>
  );
};

export default PlayerCard;
