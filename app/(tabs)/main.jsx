import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur"; // Import BlurView for blur effect
import TeamView from "../components/TeamView";
import EnhancedTeamView from "../components/EnhancedTeamView";

const MainPage = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-900 pb-12">
      <EnhancedTeamView />
    </SafeAreaView>
  );
};

export default MainPage;
