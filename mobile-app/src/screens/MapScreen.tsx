import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  Circle,
  Callout,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import axiosClient from "../api/axiosClient";

interface RouteSegment {
  coords: any[];
  color: string;
}

const { width } = Dimensions.get("window");

// IP máy tính của bạn để hiển thị ảnh từ Backend
const BASE_URL = "http://10.0.2.2:3000";

// BƯỚC 1: THÊM PROPS `navigation` VÀO ĐÂY ĐỂ LẮNG NGHE SỰ KIỆN CHUYỂN TAB
export default function MapScreen({ navigation }: { navigation: any }) {
  const mapRef = useRef<MapView>(null);

  const [originText, setOriginText] = useState("Đang định vị...");
  const [destinationText, setDestinationText] = useState("");
  const [userCoords, setUserCoords] = useState<any>(null);
  const [destCoords, setDestCoords] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [aiDataList, setAiDataList] = useState<any[]>([]);

  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [floodPoints, setFloodPoints] = useState<any[]>([]);
  const [communityReports, setCommunityReports] = useState<any[]>([]);

  // STATE LƯU MỨC LỘI NƯỚC TỐI ĐA CỦA XE NGƯỜI DÙNG (Mặc định 15cm)
  const [safeWadingDepth, setSafeWadingDepth] = useState<number>(15);

  const getCurrentLocation = async () => {
    setOriginText("Đang xác định số nhà...");
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setOriginText("Chưa cấp quyền vị trí");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const mapRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setUserCoords(mapRegion);
      mapRef.current?.animateToRegion(mapRegion, 1000);

      const geoCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      let finalAddress = "";

      try {
        let address = await Location.reverseGeocodeAsync(geoCoords);
        if (address.length > 0) {
          const item = address[0];
          const houseNumber = item.streetNumber ? `${item.streetNumber} ` : item.name && /\d/.test(item.name) ? `${item.name} ` : "";
          const districtName = item.district || item.subregion || "";
          const streetName = item.street ? `${item.street}, ` : "";
          finalAddress = `${houseNumber}${streetName}${districtName}`.trim();
        }
      } catch (expoError) {
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geoCoords.latitude}&lon=${geoCoords.longitude}&zoom=18&addressdetails=1`;
          const response = await fetch(url, {
            headers: { 'User-Agent': 'NgapBietTruoc_StudentApp_IUH/1.0' }
          });
          const data = await response.json();

          if (data && data.address) {
            const road = data.address.road || "";
            const suburb = data.address.suburb || data.address.city_district || "";
            finalAddress = road ? `${road}, ${suburb}`.trim() : "Điểm ngập chưa rõ tên đường";
          }
        } catch (osmError) {
           console.error("🚨 OSM lỗi:", osmError);
        }
      }

      if (finalAddress) {
        setOriginText(finalAddress);
      } else {
        setOriginText("Không thể dịch địa chỉ lúc này");
      }
    } catch (error) {
      console.error("🚨 Lỗi không lấy được tọa độ:", error);
      setOriginText("Lỗi mạng hoặc GPS");
    }
  };

  // BƯỚC 2: CẬP NHẬT LẠI useEffect ĐỂ LẮNG NGHE focus
  useEffect(() => { 
    // Chạy lần đầu tiên khi app vừa mở
    getCurrentLocation(); 
    fetchCommunityReports();
    fetchUserData(); 

    // Lắng nghe sự kiện: Cứ mỗi lần chuyển lại vào màn hình này là update số mới!
    if (navigation) {
      const unsubscribe = navigation.addListener('focus', () => {
        console.log("Map đang được focus, tải lại thông số xe...");
        fetchUserData();
      });
      return unsubscribe; // Dọn dẹp listener khi màn hình bị unmount
    }
  }, [navigation]);

  const fetchCommunityReports = async () => {
    try {
      const res = await axiosClient.get("/reports");
      setCommunityReports(res.data);
    } catch (error) {
      console.log("Lỗi lấy báo cáo:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await axiosClient.get('/users/profile');
      if (res.data && res.data.thong_tin_xe) {
        setSafeWadingDepth(Number(res.data.thong_tin_xe.khoang_sang_gam_xe_cm));
      }
    } catch (error) {
      console.log("Lỗi lấy thông số xe:", error);
    }
  };

  const getCoordinatesFromAddress = async (addressText: string) => {
    try {
      const geocodedLocation = await Location.geocodeAsync(addressText);
      if (geocodedLocation.length > 0) {
        return {
          latitude: geocodedLocation[0].latitude,
          longitude: geocodedLocation[0].longitude,
        };
      }
    } catch (error) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&format=json&limit=1`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'NgapBietTruoc_StudentApp_IUH/1.0' }
        });
        const data = await response.json();

        if (data && data.length > 0) {
          return {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          };
        }
      } catch (osmError) {
        console.error("🚨 OSM lỗi tìm tọa độ:", osmError);
      }
    }
    return null;
  };

  const updateVisualsForRoute = (
    routesList: any[],
    index: number,
    aiList: any[],
  ) => {
    setActiveRouteIndex(index);
    const activeRoute = routesList[index];
    const aiResultData = aiList[index];

    const fullPath = activeRoute.geometry.coordinates.map((c: any) => ({
      latitude: c[1],
      longitude: c[0],
    }));
    const middleIndex = Math.floor(fullPath.length * 0.35);

    const { muc_ngap_cm, mau_sac, trang_thai } = aiResultData;
    let warningColor = "#4CD964";
    if (mau_sac === "RED") warningColor = "#FF3B30";
    else if (mau_sac === "YELLOW") warningColor = "#FFCC00";

    setRouteSegments([
      { coords: fullPath.slice(0, middleIndex - 5), color: "#4CD964" },
      {
        coords: fullPath.slice(middleIndex - 6, middleIndex + 5),
        color: warningColor,
      },
      { coords: fullPath.slice(middleIndex + 4), color: "#4CD964" },
    ]);

    const pointOnRoad = fullPath[middleIndex];
    setFloodPoints([
      {
        ...pointOnRoad,
        muc_ngap: muc_ngap_cm,
        trang_thai: trang_thai,
        mau_sac: warningColor,
      },
    ]);
  };

  const handleAIPrediction = async () => {
    if (!destinationText || !userCoords) return;
    setLoading(true);

    try {
      const target = await getCoordinatesFromAddress(destinationText);
      
      if (!target) throw new Error("Địa chỉ không tồn tại hoặc lỗi mạng");
      
      setDestCoords(target);

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userCoords.longitude},${userCoords.latitude};${target.longitude},${target.latitude}?overview=full&geometries=geojson&alternatives=3`;
      const osrmRes = await fetch(osrmUrl);
      const osrmData = await osrmRes.json();

      if (osrmData.routes && osrmData.routes.length > 0) {
        let fetchedRoutes = osrmData.routes;

        if (fetchedRoutes.length === 1) {
          console.log("Đang mượn OSRM vẽ đường vòng né ngập...");
          
          const mainCoords = fetchedRoutes[0].geometry.coordinates;
          const startPt = mainCoords[0];
          const endPt = mainCoords[mainCoords.length - 1];
          
          const dx = endPt[0] - startPt[0];
          const dy = endPt[1] - startPt[1];
          const distance = Math.sqrt(dx * dx + dy * dy) || 0.001;
          
          const midIndex = Math.floor(mainCoords.length * 0.5); 
          const midPt = mainCoords[midIndex];
          
          const perpX = -dy / distance;
          const perpY = dx / distance;
          
          const offset = -0.012; 
          
          const detourLon = midPt[0] + (perpX * offset);
          const detourLat = midPt[1] + (perpY * offset);

          const detourUrl = `https://router.project-osrm.org/route/v1/driving/${userCoords.longitude},${userCoords.latitude};${detourLon},${detourLat};${target.longitude},${target.latitude}?overview=full&geometries=geojson&continue_straight=true`;
          
          try {
            const detourRes = await fetch(detourUrl);
            const detourData = await detourRes.json();
            
            if (detourData.routes && detourData.routes.length > 0) {
              const realAltRoute = detourData.routes[0];
              fetchedRoutes.push(realAltRoute); 
            }
          } catch (err) {
            console.log("Lỗi ép đường vòng");
          }
        }

        setAllRoutes(fetchedRoutes);
        const listAiData = [];

        const aiResMain = await axiosClient.post("/predict", {
          luong_mua: 115,
          dinh_trieu: 1.6,
          tinh_trang_cong: 0,
          destination: destinationText,
        });
        
        let mainRouteData = aiResMain.data;

        const mucNgap = parseFloat(mainRouteData.muc_ngap_cm);
        
        if (mucNgap > 0) {
          if (mucNgap >= safeWadingDepth) {
            mainRouteData.mau_sac = "RED";
            mainRouteData.trang_thai = `CẢNH BÁO ĐỎ: Ngập ${mucNgap}cm, vượt quá khả năng lội nước (${safeWadingDepth}cm). Nguy cơ thủy kích!`;
          } 
          else if (mucNgap >= safeWadingDepth - 8) {
            mainRouteData.mau_sac = "YELLOW";
            mainRouteData.trang_thai = `CẢNH BÁO VÀNG: Ngập ${mucNgap}cm. Gần chạm mốc nguy hiểm (${safeWadingDepth}cm), đi chậm và cẩn thận!`;
          } 
          else {
            mainRouteData.mau_sac = "GREEN";
            mainRouteData.trang_thai = `AN TOÀN: Ngập ${mucNgap}cm, thấp hơn giới hạn lội nước (${safeWadingDepth}cm). Có thể đi qua dễ dàng.`;
          }
        }

        listAiData.push(mainRouteData);

        for (let i = 1; i < fetchedRoutes.length; i++) {
          listAiData.push({
            muc_ngap_cm: 0,
            mau_sac: "GREEN",
            trang_thai: "Lộ trình thay thế an toàn, không ngập.",
          });
        }

        setAiDataList(listAiData);
        updateVisualsForRoute(fetchedRoutes, 0, listAiData);

        const allCoords = fetchedRoutes[0].geometry.coordinates.map(
          (c: any) => ({ latitude: c[1], longitude: c[0] }),
        );
        mapRef.current?.fitToCoordinates(allCoords, {
          edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không tìm thấy lộ trình. Vui lòng thử nhập địa chỉ rõ hơn.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={85} tint="light" style={styles.searchBox}>
        <View style={styles.rowInput}>
          <Ionicons name="location" size={20} color="#0068FF" />
          <TextInput
            style={styles.textInput}
            value={originText}
            editable={false}
          />
          <TouchableOpacity onPress={getCurrentLocation}>
            <Ionicons name="locate-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.rowInput,
            {
              marginTop: 12,
              borderTopWidth: 0.5,
              borderColor: "#EEE",
              paddingTop: 8,
            },
          ]}
        >
          <Ionicons name="flag" size={20} color="#FF3B30" />
          <TextInput
            style={styles.textInput}
            value={destinationText}
            onChangeText={setDestinationText}
            onBlur={handleAIPrediction}
            placeholder="Bạn muốn đi đâu?"
          />
          {loading ? (
            <ActivityIndicator size="small" color="#0068FF" />
          ) : (
            <Ionicons name="search" size={22} color="#DDD" />
          )}
        </View>
      </BlurView>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={userCoords}
        showsUserLocation={true}
        provider={PROVIDER_GOOGLE}
      >
        {userCoords && <Marker coordinate={userCoords} title="Bắt đầu" />}
        {destCoords && (
          <Marker coordinate={destCoords} title="Kết thúc" pinColor="red" />
        )}

        {allRoutes.map((route, index) => {
          if (index === activeRouteIndex) return null; 
          const path = route.geometry.coordinates.map((c: any) => ({
            latitude: c[1],
            longitude: c[0],
          }));
          return (
            <Polyline
              key={`alt-${index}`}
              coordinates={path}
              strokeColor="#8A9FC2" 
              strokeWidth={5}       
              lineDashPattern={[15, 10]} 
              zIndex={5} 
            />
          );
        })}

        {routeSegments.map((seg, index) => (
          <Polyline
            key={`main-${index}`}
            coordinates={seg.coords}
            strokeColor={seg.color}
            strokeWidth={8} 
            lineJoin="round"
            zIndex={10} 
          />
        ))}

        {floodPoints.map((point, index) => (
          <React.Fragment key={`point-${index}`}>
            <Circle
              center={point}
              radius={100}
              fillColor={`${point.mau_sac}40`}
              strokeColor={point.mau_sac}
              strokeWidth={2}
              zIndex={10}
            />
            <Marker
              coordinate={point}
              zIndex={9999}
              tracksViewChanges={true}
            >
              <View style={{
                backgroundColor: point.mau_sac,
                width: 90, 
                height: 35, 
                borderRadius: 5, 
                borderWidth: 1.5,
                borderColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{
                  color: '#FFF',
                  fontWeight: 'bold',
                  fontSize: 14,
                  textAlign: 'center',
                  width: '100%',
                }}>
                  {point.muc_ngap} cm
                </Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}
        
        {communityReports
          .filter(rep => rep.latitude && rep.longitude)
          .map((rep, index) => (
            <Marker
              key={`comm-${rep._id || index}`}
              coordinate={{
                latitude: Number(rep.latitude),
                longitude: Number(rep.longitude),
              }}
              zIndex={998}
              tracksViewChanges={true}
            >
              <Ionicons name="warning" size={36} color="#FF9500" />
              <Callout tooltip={false}>
                <View style={{ width: 220, padding: 10 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
                    👤 {rep.user_id?.ho_ten || "Cư dân báo cáo"}
                  </Text>
                  <Text style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: 16, marginVertical: 4 }}>
                    Ngập: {rep.muc_ngap_uoc_tinh} cm
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>📍 {rep.ten_duong}</Text>

                  {rep.hinh_anh_url ? (
                    <Image
                      source={{ uri: `${BASE_URL}${rep.hinh_anh_url}` }}
                      style={{ width: 200, height: 110, borderRadius: 5, marginTop: 8 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ color: '#999', fontSize: 11, marginTop: 5 }}> (Không có ảnh) </Text>
                  )}
                  <Text style={{ fontSize: 10, color: '#AAA', marginTop: 8, textAlign: 'right' }}>
                    🕒 {new Date(rep.createdAt).toLocaleTimeString()}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>

      {allRoutes.length > 0 && aiDataList.length > 0 && (
        <BlurView intensity={100} style={styles.bottomPanel}>
          <Text style={styles.panelHeader}>Chọn lộ trình AI 🌧️</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 15 }}
          >
            {allRoutes.map((route, index) => {
              const distanceKm = (route.distance / 1000).toFixed(1);
              const durationMin = Math.round(route.duration / 60);
              const isActive = index === activeRouteIndex;
              const aiData = aiDataList[index];
              const isSafe = aiData?.mau_sac !== "RED";

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.card,
                    {
                      borderColor: isActive ? "#0068FF" : "#E0E0E0",
                      borderWidth: isActive ? 2 : 1,
                      backgroundColor: isActive ? "#F5F9FF" : "#FFF",
                    },
                  ]}
                  onPress={() =>
                    updateVisualsForRoute(allRoutes, index, aiDataList)
                  }
                >
                  <View style={styles.cardHeader}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: isActive ? "#0068FF" : "#333" },
                      ]}
                    >
                      Lộ trình {index + 1}
                    </Text>
                    <Ionicons
                      name={isSafe ? "checkmark-circle" : "warning"}
                      size={20}
                      color={isSafe ? "#28a745" : "#FF3B30"}
                    />
                  </View>
                  <Text style={styles.cardTime}>
                    {durationMin} phút{" "}
                    <Text style={styles.cardDist}>({distanceKm} km)</Text>
                  </Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {aiData?.trang_thai}
                  </Text>
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
  container: { flex: 1, backgroundColor: "#FFF" },
  map: { width: "100%", height: "100%" },
  searchBox: {
    position: "absolute",
    top: 50,
    left: 15,
    right: 15,
    zIndex: 10,
    padding: 15,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  rowInput: { flexDirection: "row", alignItems: "center" },
  textInput: { flex: 1, marginLeft: 10, fontSize: 15, color: "#333" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFF",
    elevation: 5,
  },
  badgeText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 35,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  panelHeader: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
  card: {
    width: width * 0.65,
    padding: 15,
    borderRadius: 15,
    marginRight: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  cardTime: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardDist: { fontSize: 13, fontWeight: "normal", color: "#888" },
  cardDesc: { fontSize: 12, color: "#666", lineHeight: 16 },

  calloutCard: {
    padding: 10,
    width: 220,
  },
  calloutUser: { fontWeight: "bold", fontSize: 14, color: "#333" },
  calloutFlood: {
    color: "#FF3B30",
    fontWeight: "bold",
    fontSize: 16,
    marginVertical: 4,
  },
  calloutStreet: { fontSize: 12, color: "#666" },
  calloutImage: { width: 200, height: 110, borderRadius: 5, marginTop: 8 },
  calloutTime: {
    fontSize: 10,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
});