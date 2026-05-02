import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Alert, ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown'; 
import axiosClient from '../api/axiosClient';
import { Ionicons } from '@expo/vector-icons';

// Import data nội bộ (Nhớ đảm bảo file DataXe.js nằm đúng đường dẫn nhé)
import { VN_BRANDS, VN_MODELS } from '../constants/DataXe';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const [hoTen, setHoTen] = useState('');
  const [gamXe, setGamXe] = useState('0'); // Sàn xe gốc (để hiển thị UI)
  
  // State cho Dropdown
  const [modelsList, setModelsList] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 1. Lấy thông tin user (Xử lý chống cộng dồn)
  const fetchUserProfile = async () => {
    try {
      const res = await axiosClient.get('/users/profile');
      setHoTen(res.data.ho_ten);
      
      // Ưu tiên lấy cái sàn xe gốc đã lưu ngầm trong điện thoại ra hiển thị
      const sanXeGoc = await AsyncStorage.getItem('san_xe_goc_cm');
      
      if (sanXeGoc) {
        setGamXe(sanXeGoc);
      } else {
        // Nếu không có cache (người dùng đổi điện thoại hoặc mới đăng nhập)
        // Lấy con số Lội Nước Max trên Database trừ đi 12 để ước lượng lại cái sàn xe
        const loiNuocMax = res.data.thong_tin_xe.khoang_sang_gam_xe_cm;
        setGamXe((loiNuocMax > 15 ? loiNuocMax - 12 : loiNuocMax).toString());
      }
    } catch (err) {
      console.log("Lỗi tải profile:", err);
    }
  };

  // 2. Tính toán giới hạn lội nước thực tế (AI sẽ dùng số này)
  const getSafeWadingDepth = (gamCm: string) => {
    const gam = parseFloat(gamCm);
    if (isNaN(gam) || gam === 0) return 0;
    
    // Khai báo các hãng xe điện để cộng biên độ lội nước trâu hơn (+15cm)
    const isEV = 
      selectedBrand === 'VinFast_Moto' || 
      selectedBrand === 'DatBike' || 
      selectedBrand === 'Yadea' ||
      selectedBrand === 'VinFast_Car' || 
      selectedBrand === 'BYD_Car';
      
    // Xe xăng bô/lọc gió thường cao hơn gầm 12cm
    return (gam + (isEV ? 15 : 12)).toFixed(1);
  };

  // 3. Lưu thông số (Đẩy số to lên DB, lưu số nhỏ vào máy)
  const saveProfile = async () => {
    try {
      if (!gamXe || gamXe === '0') {
        Alert.alert('Chưa chọn xe', 'Vui lòng chọn dòng xe của bạn.');
        return;
      }
      
      // Tính ra con số lội nước tối đa (Ví dụ gầm 15cm -> lội 27cm)
      const loiNuocMax = getSafeWadingDepth(gamXe);

      // GHI ĐÈ biến này bằng con số lội nước MAX để AI Backend tự bốc ra dùng
      await axiosClient.put('/users/vehicle', { 
        khoang_sang_gam_xe_cm: Number(loiNuocMax) 
      });

      // LƯU NGẦM cái sàn gốc (15cm) vào đt để UI không bị cộng dồn sai ở lần mở app tiếp theo
      await AsyncStorage.setItem('san_xe_goc_cm', gamXe.toString());

      Alert.alert('Thành công', 'Đã thiết lập mức lội nước an toàn cho hệ thống AI!');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật cấu hình xe');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Hồ Sơ Của Bạn</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>👤 Chủ xe</Text>
        <Text style={styles.userName}>{hoTen}</Text>
      </View>

      <Text style={styles.sectionTitle}>Thiết lập phương tiện</Text>
      <View style={styles.card}>
        
        <Text style={styles.label}>Chọn hãng</Text>
        <Dropdown
          style={styles.dropdown}
          data={VN_BRANDS}
          search
          labelField="label"
          valueField="value"
          placeholder="Tìm hãng..."
          value={selectedBrand}
          onChange={item => {
            setSelectedBrand(item.value);
            setModelsList(VN_MODELS[item.value as keyof typeof VN_MODELS] || []);
            setSelectedModel(null);
            setGamXe('0');
          }}
        />

        <Text style={[styles.label, { marginTop: 15 }]}>Chọn dòng xe</Text>
        <Dropdown
          style={[styles.dropdown, !selectedBrand && { opacity: 0.5 }]}
          data={modelsList}
          search
          labelField="label"
          valueField="value"
          placeholder="Tìm dòng xe..."
          disable={!selectedBrand}
          value={selectedModel}
          onChange={item => {
            setSelectedModel(item.value);
            setGamXe(item.value); // Set trực tiếp cm sàn xe gốc
          }}
        />

        {/* HIỂN THỊ THÔNG SỐ TRỰC QUAN */}
        {gamXe !== '0' && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="car-sport-outline" size={24} color="#718096" />
              <Text style={styles.statLabel}>Sàn để chân</Text>
              <Text style={styles.statValue}>{gamXe} cm</Text>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.statBox}>
              <Ionicons name="water-outline" size={24} color="#0068FF" />
              <Text style={styles.statLabel}>Lội nước tối đa</Text>
              <Text style={[styles.statValue, { color: '#0068FF' }]}>
                {getSafeWadingDepth(gamXe)} cm
              </Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.btnSave} onPress={saveProfile}>
        <Text style={styles.btnText}>Lưu Cài Đặt</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  header: { fontSize: 26, fontWeight: '900', marginBottom: 25, marginTop: 40, color: '#1A202C' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginBottom: 10 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 3 },
  label: { fontSize: 13, fontWeight: '600', color: '#718096', marginBottom: 8 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  dropdown: { height: 50, borderColor: '#E2E8F0', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, backgroundColor: '#F7FAFC' },
  
  // Styles cho bảng thông số lội nước
  statsContainer: { flexDirection: 'row', marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#EDF2F7', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: '#718096', marginTop: 5, marginBottom: 2 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#2D3748' },
  divider: { width: 1, backgroundColor: '#EDF2F7', height: '80%', alignSelf: 'center' },
  
  btnSave: { backgroundColor: '#0068FF', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});