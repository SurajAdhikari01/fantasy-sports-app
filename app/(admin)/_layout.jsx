import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { styled } from "nativewind";
import { BlurView } from "expo-blur"; // Import BlurView

// Styling container with NativeWind
const Container = styled(View, "flex-1 bg-gray-900");

export default function AdminTabsLayout() {
  return (
    <Container>
      {/* Main content of the application */}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarStyle: {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              // height: 80, // Adjust for padding
              // borderRadius: 30, // Rounded edges for the bar
              backgroundColor: "rgba(0,0,0,0.5)", // Slightly transparent background
              borderTopWidth: 0, // Remove the top border
              elevation: 5, // Add elevation for Android shadow
              zIndex: 2, // Ensure the tab bar is above the BlurView
            },
            tabBarActiveTintColor: "#F97316", // Orange color for active state
            tabBarInactiveTintColor: "#9CA3AF", // Grey for inactive state
            headerShown: false,
            tabBarBackground: () => (
              <BlurView
                style={{ height: 55 }} // Match the height of the tab bar
                intensity={100} // Adjust as needed
                tint="dark"
                borderRadius={30} // Rounded edges for the BlurView
              />
            ),
          }}
        >
          {/* Admin Dashboard Tab */}
          <Tabs.Screen
            name="adminDashboard"
            options={{
              tabBarLabel: "Dashboard",
              tabBarIcon: ({ color }) => (
                <Ionicons name="grid" size={24} color={color} />
              ),
            }}
          />

          {/* Live Matches Tab */}
          <Tabs.Screen
            name="liveMatches"
            options={{
              tabBarLabel: "Live Matches",
              tabBarIcon: ({ color }) => (
                <Ionicons name="pulse" size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </Container>
  );
}
