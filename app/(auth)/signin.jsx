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
  "w-full mb-4 flex-row items-center bg-gray-800 text-white border-2 rounded-lg"
);
const Input = styled(TextInput, "flex-1 p-4 text-lg text-white");
const IconWrapper = styled(View, "px-3");
const Button = styled(
  Pressable,
  "w-full p-4 bg-purple-600 rounded-lg items-center mt-4"
);
const ButtonText = styled(Text, "text-white text-lg font-bold");
const ErrorMessage = styled(Text, "text-red-500 mt-2"); // Error message styling

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for error message
  const [loading, setLoading] = useState(false); // For loading state
  const router = useRouter();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const simulateBackendCall = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success or failure randomly
        if (Math.random() > 0.5) {
          resolve("Login successful!");
        } else {
          reject("Invalid email or password");
        }
      }, 2000); // Simulating 2 seconds delay
    });
  };

  const handleSignIn = async () => {
    // Start loading animation
    setLoading(true);
    setError(""); // Reset error message before each login attempt

    // Prepare data to send to backend
    const payload = {
      email,
      password,
    };

    try {
      // Simulating a backend call
      await simulateBackendCall();

      // If login is successful, forward to home
      router.replace("/(tabs)/home");
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

  // Determine input field border color based on error state
  const emailInputStyle = error ? "border-red-500" : "border-purple-700";
  const passwordInputStyle = error ? "border-red-500" : "border-purple-700";

  return (
    <GradientBackground
      colors={["#6a11cb", "#2575fc"]}
      start={[0, 0]}
      end={[1, 1]}
    >
      <Title>Welcome Back</Title>

      {/* Email Input */}
      <InputContainer className={emailInputStyle}>
        <IconWrapper>
          <Icon name="mail-outline" size={24} color="#9CA3AF" />
        </IconWrapper>
        <Input
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError(""); // Clear error on input change
          }}
        />
      </InputContainer>

      {/* Password Input */}
      <InputContainer className={passwordInputStyle}>
        <IconWrapper>
          <Icon name="lock-closed-outline" size={24} color="#9CA3AF" />
        </IconWrapper>
        <Input
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError(""); // Clear error on input change
          }}
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
          onPress={handleSignIn}
          disabled={loading} // Disable button while loading
        >
          <ButtonText>{loading ? "Signing In..." : "Sign In"}</ButtonText>
        </Button>
      </Animated.View>

      <Text className="text-white mt-6">
        Don't have an account?{" "}
        <Text
          onPress={() => router.push("/(auth)/signup")}
          className="text-pink-300 font-bold"
        >
          Sign Up
        </Text>
      </Text>
    </GradientBackground>
  );
}
