import React from "react"; // Import useRef
import { View, Text, Dimensions } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
const { width, height } = Dimensions.get("window");
const adjustedWidth = width * 0.9;
const adjustedHeight = height * 0.23;

const StatisticsCard = ({ scoreEarned, tournamentJoined }) => (
  <View className="mt-6 items-center">
    <View className="relative">
      <View
        className={`absolute top-[${
          adjustedHeight * 0.3
        }px] right-0 p-8 z-10 pt-24 items-end`}
      >
        <Text className="text-white text-2xl">{tournamentJoined}</Text>
        <Text className="text-white mt-2">Tournament</Text>
      </View>

      <Svg
        height={adjustedHeight}
        width={adjustedWidth}
        viewBox={`0 0 ${adjustedWidth} ${adjustedHeight}`}
      >
        {/* Background Path */}
        <Path
          d={`
            M 0 ${adjustedHeight * 0.3}
            A 30, 30 0 0 1 ${adjustedWidth * 0.05}, ${adjustedHeight * 0.1}
            L ${adjustedWidth * 0.5} ${adjustedHeight * 0.3}
            L ${adjustedWidth * 0.9} ${adjustedHeight * 0.1}
            A 30,30 0 0 1 ${adjustedWidth}, ${adjustedHeight * 0.3}
            L ${adjustedWidth} ${adjustedHeight * 0.78}
            A 30, 30 0 0 1 ${adjustedWidth * 0.9}, ${adjustedHeight * 0.99}
            L ${adjustedWidth * 0.5} ${adjustedHeight * 0.9}
            L ${adjustedWidth * 0.09} ${adjustedHeight}
            A 30,30 0 0 1 0, ${adjustedHeight * 0.8}
            L 0 ${adjustedHeight * 0.3}
            Z
          `}
          fill="#1f1f1f"
          stroke="#ddd"
          strokeWidth="3"
          strokeDasharray="12, 8"
        />
      </Svg>

      <Svg
        height={adjustedHeight}
        width={adjustedWidth}
        viewBox={`0 0 ${adjustedWidth} ${adjustedHeight}`}
        style={{ position: "absolute", top: 0 }}
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ff416c" />
            <Stop offset="1" stopColor="#ff4b2b" />
          </LinearGradient>
        </Defs>
        <View className="absolute top-0 left-0 p-8">
          <Text className="text-white text-2xl">{scoreEarned}</Text>
          <Text className="text-white mt-2">Highest Score</Text>
        </View>

        <Path
          d={`
            M ${adjustedWidth * 0.1} 0
            A 20, 20 1 1 1 ${adjustedWidth * 0.07} 0
            L ${adjustedWidth * 0.6} 0
            A 20, 20 0 0 1 ${adjustedWidth * 0.65}, ${adjustedHeight * 0.15}
            L ${adjustedWidth * 0.58} ${adjustedHeight * 0.6}
            A 20, 20 0 0 1 ${adjustedWidth * 0.54}, ${adjustedHeight * 0.69}
            L ${adjustedWidth * 0.135} ${adjustedHeight * 0.81}
            A 30, 30 0 0 1 ${adjustedWidth * 0.038}, ${adjustedHeight * 0.7}
            L ${adjustedWidth * 0.03} ${adjustedHeight * 0.1}
            Z
          `}
          fill="url(#grad)"
        />
      </Svg>
    </View>
  </View>
);

export default StatisticsCard;
