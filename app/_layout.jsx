// app/_layout.js
import { useEffect, useState } from "react";
import { Slot, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { styled } from "nativewind";
import * as SecureStore from "expo-secure-store";

const Container = styled(View, "flex-1 bg-gray-900");

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const userData = await SecureStore.getItemAsync("userData");
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setIsAuthenticated(!!parsedUserData.token);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to check authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (!isAuthenticated) {
        // router.replace("/(admin)/adminDashboard");
        router.replace("/(tabs)/home");
        //router.replace("/(auth)/signin");
      } else {
      }
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return (
      <Container>
        <ActivityIndicator size="large" color="#F97316" />
      </Container>
    );
  }

  return (
    <Container>
      <Slot />
    </Container>
  );
}
