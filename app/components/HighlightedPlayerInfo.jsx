// import React from "react";
// import { View, Text, Image, TouchableOpacity, Modal, ScrollView } from "react-native";
// import { Feather } from "@expo/vector-icons";

// const StatsBox = ({ label, value, icon }) => (
//   <View className="bg-gray-800 rounded-lg py-4 flex-1 mx-2">
//     <View className="flex-row items-center justify-center mb-2">
//       <Feather name={icon} size={16} color="#60A5FA" />
//       <Text className="text-white text-xs ml-2">{label}</Text>
//     </View>
//     <Text className="text-center text-white font-bold text-lg">{value}</Text>
//   </View>
// );

// const HighlightedPlayerInfo = ({ player, visible, onClose }) => {
//   if (!player) return null;

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View className="flex-1 justify-end bg-black/60">
//         <View className="bg-white rounded-t-3xl p-6">
//           {/* Player Header Section */}
//           <View className="flex-row items-center mb-6">
//             <Image
//               source={{ uri: player.image || "https://via.placeholder.com/150" }}
//               className="w-24 h-24 rounded-full bg-gray-200"
//               resizeMode="cover"
//             />
//             <View className="ml-4 flex-1">
//               <Text className="text-2xl font-bold text-gray-900">
//                 {player.name || "N/A"}
//               </Text>
//               <Text className="text-gray-600 text-sm">
//                 {player.team || "Unknown Team"}
//               </Text>
//             </View>
//           </View>

//           {/* Stats Overview Section */}
//           <View className="flex-row justify-around mb-6">
//             <StatsBox
//               label="Points"
//               value={player.points || "0"}
//               icon="star"
//             />
//             <StatsBox
//               label="Price"
//               value={`$${player.price || "0"}M`}
//               icon="dollar-sign"
//             />
//             <StatsBox
//               label="Role"
//               value={player.role || "Unknown"}
//               icon="user"
//             />
//           </View>

//           {/* Detailed Stats Section */}
//           {player.stats && (
//             <ScrollView
//               className="border-t border-gray-200 pt-4 max-h-60"
//               showsVerticalScrollIndicator={false}
//             >
//               {Object.entries(player.stats).map(([key, value]) => (
//                 <View
//                   key={key}
//                   className="flex-row justify-between py-3 border-b border-gray-100"
//                 >
//                   <Text className="capitalize text-gray-600 text-base">
//                     {key.replace(/([A-Z])/g, " $1").trim()}
//                   </Text>
//                   <Text className="font-bold text-gray-800 text-base">{value}</Text>
//                 </View>
//               ))}
//             </ScrollView>
//           )}

//           {/* Close Button */}
//           <TouchableOpacity
//             onPress={onClose}
//             className="mt-6 bg-blue-600 py-4 rounded-full"
//             accessible
//             accessibilityRole="button"
//           >
//             <Text className="text-white text-center font-bold text-lg">
//               Close
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default HighlightedPlayerInfo;