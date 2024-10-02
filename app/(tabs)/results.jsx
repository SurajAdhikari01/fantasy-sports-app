// app/.tab/results.js
import { View, Text } from "react-native";
import { styled } from "nativewind";

const Container = styled(
  View,
  "flex-1 justify-center items-center bg-gray-900 px-4"
);
const Title = styled(Text, "text-3xl text-green-400 font-bold");

export default function ResultsScreen() {
  return (
    <Container>
      <Title>Results</Title>
      {/* Display results, points, match scores */}
    </Container>
  );
}
