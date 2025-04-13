import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { styled } from "nativewind";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Styling container with NativeWind
const Container = styled(View, "flex-1 bg-gray-900");

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 55;

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
              height: TAB_BAR_HEIGHT + insets.bottom, // Account for safe area
              borderTopWidth: 0,
              elevation: 5,
              zIndex: 2,
            },
            tabBarActiveTintColor: "#F97316",
            tabBarInactiveTintColor: "#9CA3AF",
            headerShown: false,
            tabBarBackground: () => (
              <BlurView
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
                intensity={100}
                tint="dark"
                borderRadius={30}
              />
            ),
            // Add bottom padding to prevent content overlap with tab bar
            contentStyle: {
              paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
            },
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

          <Tabs.Screen
            name="leaderboard"
            options={{
              tabBarLabel: "Leaderboard",
              tabBarIcon: ({ color }) => (
                <Ionicons name="trophy" size={24} color={color} />
              ),
            }}
          />

          {/* Team select Tab */}
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
                    marginBottom: 0,
                    zIndex: 3,
                  }}
                >
                  <View
                    style={{
                      width: 65,
                      height: 65,
                      backgroundColor: "#F97316",
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
                      borderRadius: 15,
                      position: "relative",
                      justifyContent: "center",
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
                <Ionicons name="receipt" size={24} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="more"
            options={{
              tabBarLabel: "More",
              tabBarIcon: ({ color }) => (
                <Ionicons name="options" size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </Container>
  );
}
