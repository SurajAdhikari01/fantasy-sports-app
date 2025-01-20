import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set the mounted state to true after the initial render
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Perform navigation only if the component is mounted
    if (isMounted) {
      router.replace("(auth)/signin");
    }
  }, [isMounted]);

  if (!isMounted) {
    // Optionally, you can display a loading indicator while waiting for the component to mount
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
};

export default Index;
