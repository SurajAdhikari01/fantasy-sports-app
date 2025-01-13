import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import * as SecureStore from "expo-secure-store"; // For secure storage

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
const ErrorMessage = styled(Text, "text-red-500 mt-2");

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const validateInputs = () => {
    if (!username || !email || !password) {
      setError("All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:9005/api/v1/users/register",
        {
          username,
          email,
          password,
        }
      );

      // Store the user data securely as a JSON string
      const userData = {
        token: response.data.token,
        username: response.data.username,
        email: response.data.email,
      };
      await SecureStore.setItemAsync("userData", JSON.stringify(userData));

      router.replace("/(tabs)/home");
      // Navigate to OTP verification screen
      // router.replace("/otp");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else if (error.code === "ECONNABORTED") {
        setError("Network timeout. Please try again.");
      } else {
        console.log(error);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
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
          onChangeText={(text) => {
            setUsername(text);
            if (error) setError("");
          }}
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
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError("");
          }}
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
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError("");
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
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ButtonText>Sign Up</ButtonText>
          )}
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
