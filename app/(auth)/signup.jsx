import React, { useState, useRef } from "react";
import { View, Text, TextInput, Pressable, Animated } from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";

const GradientBackground = styled(
  LinearGradient,
  "flex-1 justify-center items-center px-4"
);
const Title = styled(Text, "text-4xl font-bold text-white mb-8");
const InputContainer = styled(
  View,
  "w-full mb-4 flex-row items-center bg-gray-800 text-white border-2 border-teal-600 rounded-lg"
);
const Input = styled(TextInput, "flex-1 p-4 text-lg text-white");
const IconWrapper = styled(View, "px-3");
const Button = styled(
  Pressable,
  "w-full p-4 bg-teal-500 rounded-lg items-center mt-4"
);
const ButtonText = styled(Text, "text-white text-lg font-bold");
const ErrorMessage = styled(Text, "text-red-500 mt-2"); // Error message styling

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for error message
  const [loading, setLoading] = useState(false); // For loading state
  const router = useRouter();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const validateInputs = () => {
    if (!username || !email || !password) {
      setError("All fields are required.");
      return false;
    }
    // Add more validations as needed (e.g., email format)
    return true;
  };

  const handleSignUp = async () => {
    // Validate inputs
    if (!validateInputs()) return;

    // Start loading animation
    setLoading(true);
    setError(""); // Reset error message before each signup attempt

    try {
      // Simulate a backend call (replace with actual signup logic)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success or failure
          if (Math.random() > 0.5) {
            resolve("Signup successful!");
          } else {
            reject("Signup failed. Please try again.");
          }
        }, 2000); // Simulating 2 seconds delay
      });

      // If signup is successful, forward to OTP screen
      router.replace("/otp");
    } catch (error) {
      // Show error message in case of failure
      setError(error); // Set the error message
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <GradientBackground
      colors={["#0f2027", "#203a43", "#2c5364"]}
      start={[0, 0]}
      end={[1, 1]}
    >
      <Title>Create Account</Title>

      {/* Username Input */}
      <InputContainer>
        <IconWrapper>
          <Icon name="person-outline" size={24} color="#9CA3AF" />
        </IconWrapper>
        <Input
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          value={username}
          onChangeText={setUsername}
        />
      </InputContainer>

      {/* Email Input */}
      <InputContainer>
        <IconWrapper>
          <Icon name="mail-outline" size={24} color="#9CA3AF" />
        </IconWrapper>
        <Input
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
        />
      </InputContainer>

      {/* Password Input */}
      <InputContainer>
        <IconWrapper>
          <Icon name="lock-closed-outline" size={24} color="#9CA3AF" />
        </IconWrapper>
        <Input
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </InputContainer>

      {/* Error Message Display */}
      <View style={{ minHeight: 30 }}>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      </View>

      {/* Animated Button */}
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Button
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={handleSignUp}
          disabled={loading} // Disable button while loading
        >
          <ButtonText>{loading ? "Signing Up..." : "Sign Up"}</ButtonText>
        </Button>
      </Animated.View>

      <Text className="text-white mt-6">
        Already have an account?{" "}
        <Text
          onPress={() => router.push("/(auth)/signin")}
          className="text-teal-300 font-bold"
        >
          Sign In
        </Text>
      </Text>
    </GradientBackground>
  );
}
