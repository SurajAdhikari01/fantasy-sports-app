import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Animated } from "react-native";
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const GradientBackground = styled(
  LinearGradient,
  "flex-1 justify-center items-center px-4"
);
const Title = styled(Text, "text-4xl font-bold text-white mb-8");
const InputContainer = styled(
  Animated.View,
  "w-full mb-4 flex-row justify-between"
);
const OtpInput = styled(
  TextInput,
  "w-11 p-4 py-6 text-lg rounded-lg bg-gray-800 text-white text-center"
);

export default function OTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'success', or 'failed'
  const router = useRouter();
  const inputRefs = useRef([]);

  const individualHighlights = useRef(
    otp.map(() => new Animated.Value(0))
  ).current;
  const waveAnimations = useRef(otp.map(() => new Animated.Value(0))).current;
  const pulseAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVerifying) {
      startVerificationProcess();
    }
  }, [isVerifying]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Reset verification status when user starts editing
    setVerificationStatus(null);

    // Highlight or unhighlight based on whether the field has a value
    Animated.timing(individualHighlights[index], {
      toValue: value !== "" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      setIsVerifying(true);
    }
  };

  const startVerificationProcess = () => {
    waveAnimations.forEach((anim) => anim.setValue(0));
    pulseAnimation.setValue(0);

    Animated.stagger(
      150,
      waveAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        })
      )
    ).start(() => {
      waveAnimations.forEach((anim) => anim.setValue(0));

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ]),
        { iterations: 3 }
      ).start(() => {
        setIsVerifying(false);
        // Simulating verification result (replace with actual verification logic)
        const result = Math.random() < 0.5 ? "success" : "failed";
        setVerificationStatus(result);
        if (result === "failed") {
          shakeAnimationSequence();
        } else {
          router.replace("/(tabs)/home");
        }
      });
    });
  };

  const shakeAnimationSequence = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getBorderColor = (index) => {
    if (verificationStatus === "failed") {
      return "#FF0000"; // Red for failed verification
    }
    return Animated.add(
      individualHighlights[index],
      Animated.add(waveAnimations[index], pulseAnimation)
    ).interpolate({
      inputRange: [0, 1, 2],
      outputRange: ["#2c5364", "#32CD32", "#FFD700"],
    });
  };

  const getBackgroundColor = (index) => {
    if (verificationStatus === "failed") {
      return "#4A0000"; // Darker red for failed verification
    }
    return Animated.add(
      individualHighlights[index],
      Animated.add(waveAnimations[index], pulseAnimation)
    ).interpolate({
      inputRange: [0, 1, 2],
      outputRange: ["#333333", "#4A4A4A", "#5A5A5A"],
    });
  };

  return (
    <GradientBackground
      colors={["#0f2027", "#203a43", "#2c5364"]}
      start={[0, 0]}
      end={[1, 1]}
    >
      <Title>Enter OTP</Title>

      <InputContainer style={{ transform: [{ translateX: shakeAnimation }] }}>
        {otp.map((digit, index) => (
          <Animated.View
            key={index}
            style={{
              borderColor: getBorderColor(index),
              backgroundColor: getBackgroundColor(index),
              borderWidth: 2,
              borderRadius: 8,
              width: 50,
              marginHorizontal: 5,
            }}
          >
            <OtpInput
              ref={(el) => (inputRefs.current[index] = el)}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              style={{ color: "white" }}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && index > 0 && !digit) {
                  inputRefs.current[index - 1].focus();
                }
              }}
            />
          </Animated.View>
        ))}
      </InputContainer>

      <Text className="text-white mt-6">
        Didn't receive the OTP?{" "}
        <Text className="text-teal-300 font-bold">Resend</Text>
      </Text>
    </GradientBackground>
  );
}
