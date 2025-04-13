// import React, { useState } from 'react';
// import { View, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { Picker } from '@react-native-picker/picker';

// const FilterModal = ({ visible, onClose, onApplyFilters, franchises = [] }) => {
//   const [selectedPosition, setSelectedPosition] = useState('');
//   const [selectedPrice, setSelectedPrice] = useState('');
//   const [selectedFranchise, setSelectedFranchise] = useState('');

//   const applyFilters = () => {
//     onApplyFilters({
//       position: selectedPosition,
//       price: selectedPrice,
//       franchise: selectedFranchise,
//     });
//     onClose();
//   };

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Filter Players</Text>

//           {/* Position Filter */}
//           <Text style={styles.label}>Position</Text>
//           <Picker
//             selectedValue={selectedPosition}
//             style={styles.picker}
//             onValueChange={(itemValue) => setSelectedPosition(itemValue)}
//           >
//             <Picker.Item label="All" value="" />
//             <Picker.Item label="Forward" value="fwd" />
//             <Picker.Item label="Defender" value="def" />
//             <Picker.Item label="Midfielder" value="mid" />
//             <Picker.Item label="Goalkeeper" value="gk" />
//           </Picker>

//           {/* Price Filter */}
//           <Text style={styles.label}>Price</Text>
//           <Picker
//             selectedValue={selectedPrice}
//             style={styles.picker}
//             onValueChange={(itemValue) => setSelectedPrice(itemValue)}
//           >
//             <Picker.Item label="All" value="" />
//             <Picker.Item label="Upto 5M" value="5" />
//             <Picker.Item label="Upto 6M" value="6" />
//             <Picker.Item label="Upto 7M" value="7" />
//             <Picker.Item label="Upto 8M" value="8" />
//             <Picker.Item label="Upto 9M" value="9" />
//             <Picker.Item label="Upto 10M" value="10" />
//           </Picker>

//           {/* Franchise Filter */}
//           <Text style={styles.label}>Franchise</Text>
//           <Picker
//             selectedValue={selectedFranchise}
//             style={styles.picker}
//             onValueChange={(itemValue) => setSelectedFranchise(itemValue)}
//           >
//             <Picker.Item label="All" value="" />
//             {Array.isArray(franchises) &&
//               franchises.map((franchise) => (
//                 <Picker.Item
//                   key={franchise._id || franchise.name}
//                   label={franchise.name}
//                   value={franchise._id}
//                 />
//               ))}
//           </Picker>

//           {/* Apply Filters Button */}
//           <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
//             <Text style={styles.applyButtonText}>Apply Filters</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContainer: {
//     width: 300,
//     padding: 20,
//     backgroundColor: '#1F2937',
//     borderRadius: 10,
//   },
//   modalTitle: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     marginBottom: 10,
//     fontWeight: 'bold',
//   },
//   label: {
//     color: '#FFFFFF',
//     marginTop: 10,
//     marginBottom: 5,
//   },
//   picker: {
//     height: 50,
//     color: '#FFFFFF',
//     backgroundColor: '#374151',
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   applyButton: {
//     backgroundColor: '#10B981',
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 20,
//   },
//   applyButtonText: {
//     color: '#FFFFFF',
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
// });

// export default FilterModal;