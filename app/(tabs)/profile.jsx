// app/.tab/profile.js
import { View, Text, Pressable } from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";

const Container = styled(
  View,
  "flex-1 justify-center items-center bg-gray-900 px-4"
);
const Title = styled(Text, "text-3xl text-blue-400 font-bold");
const Button = styled(Pressable, "mt-6 p-4 bg-blue-600 rounded-lg");
const ButtonText = styled(Text, "text-white text-lg font-bold");

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/.auth/signin");
  };

  return (
    <Container>
      <Title>Profile</Title>
      {/* Add profile details */}
      <Button onPress={handleLogout}>
        <ButtonText>Log Out</ButtonText>
      </Button>
    </Container>
  );
}
