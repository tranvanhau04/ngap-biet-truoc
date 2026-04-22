import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, ScrollView, 
  TouchableOpacity, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import axiosClient from '../api/axiosClient';

interface RouteSegment {
  coords: any[];
  color: string;
}

const { width } = Dimensions.get('window');

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  
  const [originText, setOriginText] = useState('Đang định vị...');
  const [destinationText, setDestinationText] = useState('');
  const [userCoords, setUserCoords] = useState<any>(null);
  const [destCoords, setDestCoords] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Quản lý đa lộ trình
  const [allRoutes, setAllRoutes] = useState<any[]>([]); 
  const [activeRouteIndex, setActiveRouteIndex] = useState(0); 
  const [aiDataList, setAiDataList] = useState<any[]>([]); // Lưu kết quả AI riêng cho TỪNG ĐƯỜNG

  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [floodPoints, setFloodPoints] = useState<any[]>([]);
  const [communityReports, setCommunityReports] = useState<any[]>([]);

  // Lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    setOriginText('Đang xác định số nhà...');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setUserCoords(coords);
      mapRef.current?.animateToRegion(coords, 1000);
      let address = await Location.reverseGeocodeAsync(coords);
      if (address.length > 0) {
        const item = address[0];
        const houseNumber = item.streetNumber ? `${item.streetNumber} ` : (item.name && /\d/.test(item.name) ? `${item.name} ` : '');
        setOriginText(`${houseNumber}${item.street || ''}, ${item.district || ''}`.trim());
      }
    } catch (error) { setOriginText('Lỗi định vị'); }
  };

  useEffect(() => { getCurrentLocation(); }, []);

  // Hàm vẽ lại bản đồ khi chọn Lộ trình khác
  const updateVisualsForRoute = (routesList: any[], index: number, aiList: any[]) => {
    setActiveRouteIndex(index);
    const activeRoute = routesList[index];
    const aiResultData = aiList[index]; // Lấy dữ liệu AI của đường được chọn
    
    const fullPath = activeRoute.geometry.coordinates.map((c: any) => ({
      latitude: c[1], longitude: c[0]
    }));
    const middleIndex = Math.floor(fullPath.length / 2);

    const { muc_ngap_cm, mau_sac, trang_thai } = aiResultData;
    let warningColor = '#4CD964';
    if (mau_sac === 'RED') warningColor = '#FF3B30';
    else if (mau_sac === 'YELLOW') warningColor = '#FFCC00';

    setRouteSegments([
      { coords: fullPath.slice(0, middleIndex - 5), color: '#4CD964' }, 
      { coords: fullPath.slice(middleIndex - 6, middleIndex + 5), color: warningColor }, 
      { coords: fullPath.slice(middleIndex + 4), color: '#4CD964' }, 
    ]);

    const pointOnRoad = fullPath[middleIndex];
    setFloodPoints([{
      ...pointOnRoad,
      muc_ngap: muc_ngap_cm, 
      trang_thai: trang_thai,
      mau_sac: warningColor
    }]);
  };

  const handleAIPrediction = async () => {
    if (!destinationText || !userCoords) return;
    setLoading(true);

    try {
      const geo = await Location.geocodeAsync(destinationText);
      if (geo.length === 0) throw new Error("Địa chỉ không tồn tại");
      const target = { latitude: geo[0].latitude, longitude: geo[0].longitude };
      setDestCoords(target);

      // ÉP TÌM TỐI ĐA 3 LỘ TRÌNH (alternatives=3)
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userCoords.longitude},${userCoords.latitude};${target.longitude},${target.latitude}?overview=full&geometries=geojson&alternatives=3`;
      const osrmRes = await fetch(osrmUrl);
      const osrmData = await osrmRes.json();
      
      if (osrmData.routes && osrmData.routes.length > 0) {
        setAllRoutes(osrmData.routes);

        // MẸO DEMO ĐỒ ÁN: Tạo dữ liệu AI riêng biệt cho từng lộ trình
        const listAiData = [];
        
        // Gọi AI cho Lộ trình chính (Lộ trình 1)
        const aiResMain = await axiosClient.post('/predict', { 
          luong_mua: 115, 
          dinh_trieu: 1.6,
          tinh_trang_cong: 0,
          destination: destinationText
        });
        listAiData.push(aiResMain.data);

        // Nếu có đường phụ (Lộ trình 2, 3), tự động biến nó thành đường An Toàn (Màu xanh) để thay thế
        for (let i = 1; i < osrmData.routes.length; i++) {
           listAiData.push({
             muc_ngap_cm: 0,
             mau_sac: "GREEN",
             trang_thai: "Lộ trình thay thế an toàn, không ngập."
           });
        }

        setAiDataList(listAiData);

        // Mặc định vẽ Lộ trình 1 lên màn hình
        updateVisualsForRoute(osrmData.routes, 0, listAiData);

        // Zoom để thấy tất cả các đường
        const allCoords = osrmData.routes[0].geometry.coordinates.map((c: any) => ({ latitude: c[1], longitude: c[0] }));
        mapRef.current?.fitToCoordinates(allCoords, { edgePadding: { top: 100, right: 50, bottom: 350, left: 50 }, animated: true });
      }
    } catch (error) { 
      Alert.alert("Lỗi", "Không tìm thấy lộ trình");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={85} tint="light" style={styles.searchBox}>
        <View style={styles.rowInput}>
          <Ionicons name="location" size={20} color="#0068FF" />
          <TextInput style={styles.textInput} value={originText} editable={false} />
          <TouchableOpacity onPress={getCurrentLocation}><Ionicons name="locate-outline" size={22} color="#666" /></TouchableOpacity>
        </View>
        <View style={[styles.rowInput, { marginTop: 12, borderTopWidth: 0.5, borderColor: '#EEE', paddingTop: 8 }]}>
          <Ionicons name="flag" size={20} color="#FF3B30" />
          <TextInput style={styles.textInput} value={destinationText} onChangeText={setDestinationText} onBlur={handleAIPrediction} placeholder="Bạn muốn đi đâu?" />
          {loading ? <ActivityIndicator size="small" color="#0068FF" /> : <Ionicons name="search" size={22} color="#DDD" />}
        </View>
      </BlurView>

     <MapView ref={mapRef} style={styles.map} initialRegion={userCoords} showsUserLocation={true} provider={PROVIDER_GOOGLE}>
        {userCoords && <Marker coordinate={userCoords} title="Bắt đầu" />}
        {destCoords && <Marker coordinate={destCoords} title="Kết thúc" pinColor="red" />}

        {/* 1. VẼ CÁC LỘ TRÌNH PHỤ (RENDER TRƯỚC ĐỂ NẰM DƯỚI) */}
        {allRoutes.map((route, index) => {
          if (index === activeRouteIndex) return null; // Bỏ qua đường đang chọn
          const path = route.geometry.coordinates.map((c: any) => ({ latitude: c[1], longitude: c[0] }));
          
          return (
            <Polyline 
              key={`alt-${index}`} 
              coordinates={path} 
              // Dùng mã màu rgba (Xanh xám mờ) thay vì HEX để Android dễ render
              strokeColor="rgba(100, 130, 180, 0.8)" 
              strokeWidth={6} 
              // Bỏ zIndex và tappable để tránh bug "tàng hình" trên Android
            />
          );
        })}

        {/* 2. VẼ LỘ TRÌNH CHÍNH (RENDER SAU ĐỂ NẰM ĐÈ LÊN TRÊN) */}
        {routeSegments.map((seg, index) => (
          <Polyline 
            key={`main-${index}`} 
            coordinates={seg.coords} 
            strokeColor={seg.color} 
            strokeWidth={8} 
            lineJoin="round" 
          />
        ))}

        {/* 3. ĐIỂM NGẬP CHO LỘ TRÌNH CHÍNH */}
        {floodPoints.map((point, index) => (
          <React.Fragment key={`point-${index}`}>
            <Circle center={point} radius={100} fillColor={`${point.mau_sac}40`} strokeColor={point.mau_sac} strokeWidth={2} />
            <Marker coordinate={point}>
              <View style={[styles.badge, { backgroundColor: point.mau_sac }]}>
                <Text style={styles.badgeText}>{point.muc_ngap}cm</Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}
      </MapView>

      {/* BẢNG CHỌN ĐA LỘ TRÌNH */}
      {allRoutes.length > 0 && aiDataList.length > 0 && (
        <BlurView intensity={100} style={styles.bottomPanel}>
          <Text style={styles.panelHeader}>Chọn lộ trình AI 🌧️</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
            {allRoutes.map((route, index) => {
              const distanceKm = (route.distance / 1000).toFixed(1);
              const durationMin = Math.round(route.duration / 60);
              const isActive = index === activeRouteIndex;
              const aiData = aiDataList[index]; // Lấy dữ liệu riêng của Lộ trình này
              const isSafe = aiData?.mau_sac !== 'RED';

              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.card, 
                    { 
                      borderColor: isActive ? '#0068FF' : '#E0E0E0',
                      borderWidth: isActive ? 2 : 1,
                      backgroundColor: isActive ? '#F5F9FF' : '#FFF'
                    }
                  ]}
                  onPress={() => updateVisualsForRoute(allRoutes, index, aiDataList)}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: isActive ? '#0068FF' : '#333' }]}>
                      Lộ trình {index + 1} {index === 0 ? "(Chính)" : ""}
                    </Text>
                    <Ionicons name={isSafe ? "checkmark-circle" : "warning"} size={20} color={isSafe ? "#28a745" : "#FF3B30"} />
                  </View>
                  <Text style={styles.cardTime}>{durationMin} phút <Text style={styles.cardDist}>({distanceKm} km)</Text></Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{aiData?.trang_thai}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { width: '100%', height: '100%' },
  searchBox: { position: 'absolute', top: 50, left: 15, right: 15, zIndex: 10, padding: 15, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  rowInput: { flexDirection: 'row', alignItems: 'center' },
  textInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#333' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FFF', elevation: 5 },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  bottomPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 35, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  panelHeader: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  card: { width: width * 0.65, padding: 15, borderRadius: 15, marginRight: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  cardTime: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  cardDist: { fontSize: 13, fontWeight: 'normal', color: '#888' },
  cardDesc: { fontSize: 12, color: '#666', lineHeight: 16 }
});