// app/_layout.js
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { styled } from "nativewind";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Container = styled(View, "flex-1 bg-gray-900");

// Protected route component
function AuthGuard() {
  const { isLoading, isAuthenticated, userData } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAdminGroup = segments[0] === "(admin)";

    if (isAuthenticated) {
      // Redirect authenticated users away from auth pages
      if (inAuthGroup) {
        if (userData?.role === "admin") {
          router.replace("/(admin)/adminDashboard");
        } else {
          router.replace("/(tabs)/home");
        }
      }
      // Protect admin routes
      if (inAdminGroup && userData?.role !== "admin") {
        router.replace("/(tabs)/home");
      }
    } else {
      // Redirect unauthenticated users to sign in
      if (!inAuthGroup) {
        router.replace("/(auth)/signin");
      }
    }
  }, [isLoading, isAuthenticated, segments, userData]);

  if (isLoading) {
    return (
      <Container>
        <ActivityIndicator size="large" color="#F97316" />
      </Container>
    );
  }

  return <Slot />;
}

// Root layout component
export default function RootLayout() {
  return (
    <AuthProvider>
      <Container>
        <AuthGuard />
      </Container>
    </AuthProvider>
  );
}
