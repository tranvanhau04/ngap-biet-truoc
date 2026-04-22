import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const [hoTen, setHoTen] = useState('');
  const [gamXe, setGamXe] = useState('');

  useEffect(() => {
    axiosClient.get('/users/profile')
      .then(res => {
        setHoTen(res.data.ho_ten);
        setGamXe(res.data.thong_tin_xe.khoang_sang_gam_xe_cm.toString());
      })
      .catch(err => console.log(err));
  }, []);

  const saveProfile = async () => {
    try {
      await axiosClient.put('/users/vehicle', { khoang_sang_gam_xe_cm: Number(gamXe) });
      Alert.alert('Thành công', 'Đã cập nhật thông số xe!');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hồ Sơ Của Bạn</Text>
      <Text style={styles.label}>Họ tên: {hoTen}</Text>
      
      <Text style={styles.label}>Khoảng sáng gầm xe (cm):</Text>
      <TextInput style={styles.input} value={gamXe} onChangeText={setGamXe} keyboardType="numeric" />
      
      <TouchableOpacity style={styles.btnSave} onPress={saveProfile}>
        <Text style={styles.btnText}>Lưu Cài Đặt</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLogout} onPress={logout}>
        <Text style={styles.btnTextLogout}>Đăng Xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  label: { fontSize: 16, marginBottom: 10, color: '#333' },
  input: { backgroundColor: '#F5F5FA', padding: 15, borderRadius: 10, marginBottom: 20 },
  btnSave: { backgroundColor: '#0068FF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  btnLogout: { backgroundColor: '#F5F5FA', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnTextLogout: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 }
});