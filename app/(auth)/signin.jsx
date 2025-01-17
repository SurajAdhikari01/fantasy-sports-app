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
import * as SecureStore from "expo-secure-store";

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
const ErrorMessage = styled(Text, "text-red-500 mt-2");

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const validateInputs = () => {
    if (!email || !password) {
      setError("All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:9005/api/v1/users/login",
        {
          email,
          password,
        }
      );

      // Store the user data securely as a JSON string
      const userData = {
        token: response.data.token,
        username: response.data.data.username, // Assuming the response includes username
        email: response.data.data.email, // Assuming the response includes email
        role: response.data.data.role, // Assuming the response includes role
      };
      await SecureStore.setItemAsync("userData", JSON.stringify(userData));

      // Redirect based on user role
      if (userData.role === "admin") {
        router.replace("/(admin)/adminDashboard");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else if (error.code === "ECONNABORTED") {
        setError("Network timeout. Please try again.");
      } else {
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
            if (error) setError("");
          }}
        />
      </InputContainer>

      {/* Error Message */}
      <View style={{ minHeight: 30 }}>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
      </View>

      {/* Animated Button */}
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <Button
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ButtonText>Sign In</ButtonText>
          )}
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
