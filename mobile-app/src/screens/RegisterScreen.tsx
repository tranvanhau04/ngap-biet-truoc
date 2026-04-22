import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axiosClient from '../api/axiosClient';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [hoTen, setHoTen] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleRegister = async () => {
    if (!hoTen || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin!');
      return;
    }

    try {
      // Gọi API sang Backend Node.js
      await axiosClient.post('/auth/register', { 
        ho_ten: hoTen, 
        email: email, 
        password: password 
      });
      
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch{
      Alert.alert('Lỗi', 'Email này đã tồn tại hoặc có lỗi xảy ra!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo Tài Khoản 🚀</Text>
      
      <TextInput style={styles.input} placeholder="Họ và tên" value={hoTen} onChangeText={setHoTen} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng Ký</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Đã có tài khoản? Quay lại Đăng nhập</Text>
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