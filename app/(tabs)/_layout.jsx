import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { styled } from "nativewind";
import { BlurView } from "expo-blur"; // Import BlurView

// Styling container with NativeWind
const Container = styled(View, "flex-1 bg-gray-900");

export default function TabsLayout() {
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
              height: 80, // Adjust for padding
              borderRadius: 30, // Rounded edges for the bar
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
                style={{ height: 80 }} // Match the height of the tab bar
                intensity={100} // Adjust as needed
                tint="dark"
                borderRadius={30} // Rounded edges for the BlurView
              />
            ),
          }}
        >
          {/* Home Tab */}
          <Tabs.Screen
            name="home"
            options={{
              tabBarLabel: "Home",
              tabBarIcon: ({ color }) => (
                <Ionicons name="home" size={24} color={color} />
              ),
            }}
          />

          {/* History Tab */}
          <Tabs.Screen
            name="history"
            options={{
              tabBarLabel: "History",
              tabBarIcon: ({ color }) => (
                <Ionicons name="time" size={24} color={color} />
              ),
            }}
          />

          {/* Custom Middle Tab */}
          <Tabs.Screen
            name="main"
            options={{
              tabBarLabel: "",
              tabBarIcon: () => (
                <View
                  style={{
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 0, // Position the middle button above the tab bar
                    zIndex: 3, // Higher zIndex for middle button
                  }}
                >
                  <View
                    style={{
                      width: 65,
                      height: 65,
                      backgroundColor: "#F97316", // Custom background for middle button
                      borderRadius: 25,
                      position: "absolute",
                      justifyContent: "center",
                      alignItems: "center",
                      shadowColor: "#000",

                      shadowOffset: { width: 0, height: 5 },
                      shadowOpacity: 0.3,
                      shadowRadius: 6.27,
                      elevation: 10,
                      transform: [{ rotate: "45deg" }],
                    }}
                  />
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      position: "relative",
                      justifyContent: "center",
                      borderRadius: 15,
                      alignItems: "center",
                      backgroundColor: "#D15F12",
                      transform: [{ rotate: "45deg" }],
                    }}
                  ></View>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      position: "absolute",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="infinite" size={30} color="#fff" />
                  </View>
                </View>
              ),
            }}
          />

          {/* Results Tab */}
          <Tabs.Screen
            name="results"
            options={{
              tabBarLabel: "Results",
              tabBarIcon: ({ color }) => (
                <Ionicons name="trophy" size={24} color={color} />
              ),
            }}
          />

          {/* Profile Tab */}
          <Tabs.Screen
            name="profile"
            options={{
              tabBarLabel: "Profile",
              tabBarIcon: ({ color }) => (
                <Ionicons name="person" size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </Container>
  );
}
