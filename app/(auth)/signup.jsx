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
import api from "../config/axios";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const validateInputs = () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
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
      const data = {
        username,
        email,
        password,
        ...(isAdmin && { role: "admin" }),
      };

      const response = await api.post("/v1/users/register", data);

      let token = null;
      const authHeader = response.headers["authorization"];
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }

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

      if (!token) {
        throw new Error("No authentication token received.");
      }

      const userData = {
        username: response.data.data.username,
        email: response.data.data.email,
        role: response.data.data.role,
      };

      // Save token and redirect
      Alert.alert("Success", "Account created successfully!");
      router.push("/(auth)/signin");
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
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

  const handleLongPress = () => {
    setIsAdmin(true);
    Alert.alert("Admin Mode", "You are now in admin registration mode.");
  };

  return (
    <GradientBackground
      colors={["#0f2027", "#203a43", "#2c5364"]}
      start={[0, 0]}
      end={[1, 1]}
    >
      <Pressable onLongPress={handleLongPress}>
        <Title>Create Account</Title>
      </Pressable>

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
            setError("");
          }}
        />
      </InputContainer>

      <InputContainer>
        <IconWrapper>
          <Icon name="mail-outline" size={24} color="#9CA3AF" />
        </IconWrapper>
        <Input
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError("");
          }}
        />
      </InputContainer>

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
            setError("");
          }}
        />
      </InputContainer>

      {error ? <ErrorMessage>{error}</ErrorMessage> : null}

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
