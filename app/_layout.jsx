// app/_layout.js
import { useEffect, useState } from "react";
import { Slot, useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { styled } from "nativewind";

const isAuthenticated = false; // Simulated authentication state

const Container = styled(View, "flex-1 bg-gray-900");

export default function RootLayout() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      if (!isAuthenticated) {
        router.replace("/(auth)/signin");
      } else {
        router.replace("/(tabs)/home");
      }
    }
  }, [isReady, router]);

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
