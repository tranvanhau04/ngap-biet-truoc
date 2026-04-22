import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import toàn bộ các màn hình
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MapScreen from '../screens/MapScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Nhóm 3 màn hình chính vào Bottom Tabs (Thanh điều hướng bên dưới)
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Bản Đồ') iconName = 'map';
        else if (route.name === 'Báo Cáo') iconName = 'warning';
        else if (route.name === 'Hồ Sơ') iconName = 'person';
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0068FF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}>
      <Tab.Screen name="Bản Đồ" component={MapScreen} />
      <Tab.Screen name="Báo Cáo" component={ReportScreen} />
      <Tab.Screen name="Hồ Sơ" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Trục điều hướng chính của toàn bộ App
export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Các màn hình xác thực */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      {/* Sau khi đăng nhập thành công sẽ nhảy vào MainTabs */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}