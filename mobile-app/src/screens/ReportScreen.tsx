import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, Image, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';

export default function ReportScreen() {
  const [duong, setDuong] = useState('');
  const [mucNgap, setMucNgap] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm xử lý chọn ảnh hoặc chụp ảnh
  const handleAddImage = () => {
    Alert.alert(
      "Thêm ảnh điểm ngập",
      "Bạn muốn lấy ảnh từ đâu?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Mở máy ảnh", onPress: takePhoto },
        { text: "Chọn từ thư viện", onPress: pickImage }
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần cấp quyền camera để chụp ảnh!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submitReport = async () => {
    if (!duong || !mucNgap) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đường và mức ngập.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Khi gửi file ảnh, BẮT BUỘC phải dùng FormData thay vì JSON bình thường
      const formData = new FormData();
      formData.append('ten_duong', duong);
      formData.append('muc_ngap_uoc_tinh', mucNgap);

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('hinh_anh', { 
          uri: imageUri, 
          name: filename, 
          type 
        } as any);
      }

      await axiosClient.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert('Thành công', 'Đã báo cáo điểm ngập cho cộng đồng! Cảm ơn bạn.');
      setDuong(''); 
      setMucNgap(''); 
      setImageUri(null);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại.');
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Báo Cáo Điểm Ngập</Text>
          <Text style={styles.headerSub}>Giúp cộng đồng tránh rủi ro thủy kích</Text>
        </View>

        {/* Khối nhập liệu 3D */}
        <View style={styles.card3D}>
          <View style={styles.inputGroup}>
            <Ionicons name="location" size={20} color="#0068FF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Tên đường (VD: Nguyễn Oanh)" 
              value={duong} 
              onChangeText={setDuong} 
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="water" size={20} color="#00BAFF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Mức ngập ước tính (cm)" 
              value={mucNgap} 
              onChangeText={setMucNgap} 
              keyboardType="numeric" 
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Khu vực ảnh chụp 3D */}
        <Text style={styles.sectionTitle}>Hình ảnh thực tế (Tùy chọn)</Text>
        <TouchableOpacity style={styles.imageBox3D} onPress={handleAddImage} activeOpacity={0.8}>
          {imageUri ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => setImageUri(null)}>
                <Ionicons name="close-circle" size={28} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="camera" size={32} color="#0068FF" />
              </View>
              <Text style={styles.placeholderText}>Nhấn để chụp hoặc chọn ảnh</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nút bấm 3D nổi */}
        <TouchableOpacity 
          style={[styles.button3D, isSubmitting && styles.buttonDisabled]} 
          activeOpacity={0.7}
          onPress={submitReport}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Đang gửi...' : 'GỬI BÁO CÁO'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F4F6F9' // Nền xám xanh nhạt để làm nổi bật khối 3D màu trắng
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 25,
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#1A202C',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 15,
    color: '#718096',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 5,
  },
  
  // Khối Card 3D cho Input
  card3D: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    // Đổ bóng 3D
    shadowColor: '#A0AEC0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: { 
    flex: 1,
    padding: 15, 
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },

  // Khối chứa ảnh 3D
  imageBox3D: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    // Đổ bóng 3D
    shadowColor: '#A0AEC0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    color: '#718096',
    fontSize: 15,
    fontWeight: '500',
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 15,
    elevation: 5,
  },

  // Nút bấm 3D phong cách Neumorphism Pop
  button3D: { 
    backgroundColor: '#FF3B30', 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    // Tạo hiệu ứng khối 3D dày ở phần đáy
    borderBottomWidth: 6,
    borderColor: '#C81B12',
    // Đổ bóng phát sáng
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#FEB2B2',
    borderColor: '#E53E3E',
    shadowOpacity: 0.2,
  },
  buttonText: { 
    color: '#FFF', 
    fontWeight: '900', 
    fontSize: 18,
    letterSpacing: 1,
  }
});