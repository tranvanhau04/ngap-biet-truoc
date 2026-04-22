import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

// Định nghĩa kiểu dữ liệu cho props navigation
export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    // Thêm logic chặn nếu người dùng bấm đăng nhập mà không nhập gì
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu!');
      return;
    }

    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      await AsyncStorage.setItem('userToken', response.data.token);
      navigation.replace('MainTabs'); 
    } catch {
      Alert.alert('Lỗi', 'Sai email hoặc mật khẩu!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ngập Biết Trước 🌧️</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        keyboardType="email-address"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Mật khẩu" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      
      {/* NÚT ĐĂNG NHẬP CHÍNH */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      {/* NÚT CHUYỂN SANG MÀN HÌNH ĐĂNG KÝ */}
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F5FA' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0068FF', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#EBEBF0' },
  button: { backgroundColor: '#0068FF', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#0068FF', fontSize: 14 }
});