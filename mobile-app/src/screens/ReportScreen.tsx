import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';
import * as Location from 'expo-location';

export default function ReportScreen() {
  const [duong, setDuong] = useState('');
  const [mucNgap, setMucNgap] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Tự động lấy vị trí khi vừa mở màn hình
  useEffect(() => {
    autoFillLocation();
  }, []);

  // HÀM LẤY VỊ TRÍ ĐÃ ĐƯỢC BỌC THÉP BẰNG OPENSTREETMAP
  const autoFillLocation = async () => {
    setIsLocating(true);
    setDuong('Đang xác định vị trí...');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Vui lòng cho phép truy cập vị trí để tự động lấy tên đường.');
        setDuong('');
        return;
      }

      // Đổi sang Balanced để tránh lỗi timeout trên Android
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geoCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      let finalAddress = "";

      // PHƯƠNG ÁN A: Dùng Geocoder mặc định
      try {
        let address = await Location.reverseGeocodeAsync(geoCoords);
        if (address.length > 0) {
          const item = address[0];
          const streetName = item.street || "";
          const district = item.district || item.subregion || "";
          const houseNumber = item.streetNumber ? `${item.streetNumber} ` : "";
          finalAddress = `${houseNumber}${streetName}, ${district}`.trim();
        }
      } catch (expoError) {
        console.log("⚠️ Android Geocoder sập ở ReportScreen, nhờ OpenStreetMap dịch hộ...");
        
        // PHƯƠNG ÁN B: Phao cứu sinh OpenStreetMap
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoCoords.latitude}&lon=${geoCoords.longitude}&zoom=18&addressdetails=1`;
          const response = await fetch(url, {
            headers: { 'User-Agent': 'NgapBietTruoc_StudentApp_IUH/1.0' }
          });
          const data = await response.json();

          if (data && data.address) {
            const road = data.address.road || "";
            const suburb = data.address.suburb || data.address.city_district || "";
            finalAddress = road ? `${road}, ${suburb}`.trim() : "Chưa rõ tên đường";
          }
        } catch (osmError) {
          console.error("🚨 Cả 2 phương án đều thất bại:", osmError);
        }
      }

      // Xóa dấu phẩy thừa nếu địa chỉ chỉ có Quận
      finalAddress = finalAddress.replace(/^,\s*/, '');

      if (finalAddress) {
        setDuong(finalAddress);
      } else {
        setDuong("Không thể dịch địa chỉ");
      }

    } catch (error) {
      setDuong('');
      console.log("Lỗi lấy địa chỉ:", error);
    } finally {
      setIsLocating(false);
    }
  };

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
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submitReport = async () => {
    if (!duong || !mucNgap || duong === 'Đang xác định vị trí...' || duong === 'Không thể dịch địa chỉ') {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đường và mức ngập.');
      return;
    }

    setIsSubmitting(true);
    try {
      let location = await Location.getCurrentPositionAsync({
         accuracy: Location.Accuracy.Balanced,
      });
    
      const formData = new FormData();
      formData.append('ten_duong', duong);
      formData.append('muc_ngap_uoc_tinh', mucNgap);
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());

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
      setMucNgap(''); 
      setImageUri(null);
      // Cập nhật lại vị trí mới sau khi gửi xong
      autoFillLocation();
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

        <View style={styles.card3D}>
          <View style={styles.inputGroup}>
            <Ionicons name="location" size={20} color="#0068FF" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Tên đường" 
              value={duong} 
              onChangeText={setDuong} 
              placeholderTextColor="#999"
            />
            {/* Nút bấm để cập nhật lại vị trí bằng tay */}
            <TouchableOpacity onPress={autoFillLocation} style={{ paddingRight: 15 }}>
              {isLocating ? (
                <ActivityIndicator size="small" color="#0068FF" />
              ) : (
                <Ionicons name="locate" size={22} color="#0068FF" />
              )}
            </TouchableOpacity>
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

        <TouchableOpacity 
          style={[styles.button3D, (isSubmitting || isLocating) && styles.buttonDisabled]} 
          activeOpacity={0.7}
          onPress={submitReport}
          disabled={isSubmitting || isLocating}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'ĐANG GỬI...' : 'GỬI BÁO CÁO'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Giữ nguyên Styles của Hậu...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  headerContainer: { marginBottom: 25 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1A202C' },
  headerSub: { fontSize: 15, color: '#718096', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginBottom: 10, marginTop: 10, marginLeft: 5 },
  card3D: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 20, shadowColor: '#A0AEC0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  inputIcon: { paddingLeft: 15 },
  input: { flex: 1, padding: 15, fontSize: 16, color: '#2D3748', fontWeight: '500' },
  imageBox3D: { backgroundColor: '#FFF', borderRadius: 20, minHeight: 180, justifyContent: 'center', alignItems: 'center', marginBottom: 35, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', shadowColor: '#A0AEC0', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  placeholderContent: { alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  placeholderText: { color: '#718096', fontSize: 15, fontWeight: '500' },
  imageWrapper: { width: '100%', height: 200, borderRadius: 18, overflow: 'hidden', position: 'relative' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FFF', borderRadius: 15, elevation: 5 },
  button3D: { backgroundColor: '#FF3B30', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderBottomWidth: 6, borderColor: '#C81B12', shadowColor: '#FF3B30', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  buttonDisabled: { backgroundColor: '#FEB2B2', borderColor: '#E53E3E', shadowOpacity: 0.2 },
  buttonText: { color: '#FFF', fontWeight: '900', fontSize: 18, letterSpacing: 1 }
});