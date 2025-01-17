// app/(auth)/signin.js

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../context/AuthContext";
import api from "../config/axios";

// Styled components
const GradientBackground = styled(
  LinearGradient,
  "flex-1 justify-center items-center px-4"
);
const StyledScrollView = styled(ScrollView, "flex-1 w-full");
const Container = styled(
  View,
  "flex-1 justify-center items-center w-full px-4"
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
const ErrorMessage = styled(Text, "text-red-500 mt-2 text-center");
const ForgotPasswordText = styled(Text, "text-white mt-4 text-center");

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const { signIn } = useAuth();

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
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
      const response = await api.post(
        "/v1/users/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // Extract token from Authorization header or cookie
      let token = null;

      // Try to get token from Authorization header
      const authHeader = response.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }

      // If no token in header, check cookies in response headers
      if (!token) {
        const cookies = response.headers["set-cookie"];
        if (cookies) {
          const accessTokenCookie = cookies.find((cookie) =>
            cookie.startsWith("accessToken=")
          );
          if (accessTokenCookie) {
            token = accessTokenCookie.split(";")[0].split("=")[1];
          }
        }
      }
      console.log("Token is found on sign in:", token);

      if (!token) {
        throw new Error("No authentication token received");
      }

      const userData = {
        username: response.data.data.username,
        email: response.data.data.email,
        role: response.data.data.role,
      };

      // Use the auth context to sign in
      await signIn(userData, token);

      // Router will handle redirect based on role through AuthGuard
    } catch (error) {
      console.error("Sign in error:", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === "ECONNABORTED") {
        setError("Connection timeout. Please check your internet connection.");
      } else if (!error.response) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Invalid credentials or server error.");
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <GradientBackground
        colors={["#6a11cb", "#2575fc"]}
        start={[0, 0]}
        end={[1, 1]}
      >
        <StyledScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            <Title>Welcome Back</Title>

            <InputContainer
              className={error ? "border-red-500" : "border-purple-700"}
            >
              <IconWrapper>
                <Icon name="mail-outline" size={24} color="#9CA3AF" />
              </IconWrapper>
              <Input
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
              />
            </InputContainer>

            <InputContainer
              className={error ? "border-red-500" : "border-purple-700"}
            >
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
                  setError("");
                }}
                onSubmitEditing={handleSignIn}
                returnKeyType="done"
              />
            </InputContainer>

            {error ? <ErrorMessage>{error}</ErrorMessage> : null}

            <Animated.View
              style={{
                transform: [{ scale: scaleValue }],
                width: "100%",
              }}
            >
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

            <ForgotPasswordText
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              Forgot Password?
            </ForgotPasswordText>

            <Text className="text-white mt-6 text-center">
              Don't have an account?{" "}
              <Text
                onPress={() => router.push("/(auth)/signup")}
                className="text-pink-300 font-bold"
              >
                Sign Up
              </Text>
            </Text>
          </Container>
        </StyledScrollView>
      </GradientBackground>
    </KeyboardAvoidingView>
  );
}
