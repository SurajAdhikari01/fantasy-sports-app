// app/(auth)/_layout.js
import { Slot } from "expo-router";
import { View } from "react-native";
import { styled } from "nativewind";

const Container = styled(
  View,
  "flex-1 bg-gray-900 justify-center items-center"
);

export default function AuthLayout() {
  return (
    <Container>
      <Slot />
    </Container>
  );
}
