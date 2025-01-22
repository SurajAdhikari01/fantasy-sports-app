import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text } from 'react-native';
import {Picker} from '@react-native-picker/picker';

const FilterModal = ({ visible, onClose, onApplyFilters, franchises }) => {
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState('');

  const applyFilters = () => {
    onApplyFilters({ position: selectedPosition, price: selectedPrice, franchise: selectedFranchise });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{ width: 300, padding: 20, backgroundColor: '#1F2937', borderRadius: 10 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, marginBottom: 10 }}>Filter Players</Text>

          {/* Position Filter */}
          <Text style={{ color: '#FFFFFF', marginBottom: 5 }}>Position</Text>
          <Picker
            selectedValue={selectedPosition}
            style={{ height: 50, color: '#FFFFFF' }}
            onValueChange={(itemValue) => setSelectedPosition(itemValue)}
          >
            <Picker.Item label="All" value="" />
            <Picker.Item label="Forward" value="fwd" />
            <Picker.Item label="Defender" value="def" />
            <Picker.Item label="Midfielder" value="mid" />
            <Picker.Item label="Goalkeeper" value="gk" />
          </Picker>

          {/* Price Filter */}
          <Text style={{ color: '#FFFFFF', marginTop: 10, marginBottom: 5 }}>Price</Text>
          <Picker
            selectedValue={selectedPrice}
            style={{ height: 50, color: '#FFFFFF' }}
            onValueChange={(itemValue) => setSelectedPrice(itemValue)}
          >
            <Picker.Item label="All" value="" />
            <Picker.Item label="Upto 5M" value="5" />
            <Picker.Item label="Upto 6M" value="6" />
            <Picker.Item label="Upto 7M" value="7" />
            <Picker.Item label="Upto 8M" value="8" />
            <Picker.Item label="Upto 9M" value="9" />
            <Picker.Item label="Upto 10M" value="10" />
          </Picker>

          {/* Franchise Filter */}
          <Text style={{ color: '#FFFFFF', marginTop: 10, marginBottom: 5 }}>Franchise</Text>
          <Picker
            selectedValue={selectedFranchise}
            style={{ height: 50, color: '#FFFFFF' }}
            onValueChange={(itemValue) => setSelectedFranchise(itemValue)}
          >
            <Picker.Item label="All" value="" />
            {franchises.map((franchise) => (
              <Picker.Item key={franchise._id} label={franchise.name} value={franchise._id} />
            ))}
          </Picker>

          {/* Apply Filters Button */}
          <TouchableOpacity
            onPress={applyFilters}
            style={{ backgroundColor: '#10B981', padding: 10, borderRadius: 5, marginTop: 20 }}
          >
            <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;