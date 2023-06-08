// App.js
import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, Selectscreen, LoadScreen, ResultScreen, InfoScreen, ListScreen, DetailScreen, SaveInputScreen } from './Screens';
import ImageCropPicker from 'react-native-image-crop-picker';
import { Image, TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StackNav = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen name="Home" component={HomeScreen} 
    options={{headerTitleAlign: "center", headerTitle: "강아지/고양이 검사"}}/>
    <Stack.Screen name="Picture" component={Selectscreen} 
    options={{headerTitleAlign: "center", headerTitle: "사진/앨범 선택"}}/>
    <Stack.Screen name="Load" component={LoadScreen} 
    options={{headerTitleAlign: "center", headerBackVisible: false, headerTitle: "검사 중.."}}/>
    <Stack.Screen name="ResultScreen" component={ResultScreen} 
    options={{headerTitleAlign: "center", headerBackVisible: false, headerTitle: "결과 확인"}}/>
    <Stack.Screen name="Info" component={InfoScreen} 
    options={{headerTitleAlign: "center", headerTitle: "정보"}}/>
    <Stack.Screen name="SaveInput" component={SaveInputScreen} 
    options={{headerTitleAlign: "center", headerTitle: "결과 저장"}}/>
    <Stack.Screen name="Detail" component={DetailScreen} 
    options={{headerTitleAlign: "center", headerBackVisible: false, headerTitle: "상세 정보"}}/>
    <Stack.Screen name="List" component={ListScreen} 
    options={{headerTitleAlign: "center", headerTitle: "목록"}}/>
  </Stack.Navigator>
);

const TabNav = () => {
  const navigation = useNavigation();

  const handleCameraPress = async () => {
    try {
      const image = await ImageCropPicker.openCamera({
        mediaType: 'photo',
        cropping: true,
        width: 300,
        height: 300,
      });
      console.log(image);
      navigation.navigate('Picture', { selectedImage: image.path });
    } catch (error) {
      console.log(error);
      // Handle camera capture error
    }
  };
  

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="StackNav"
        component={StackNav}
        options={{ headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('./Assets/home.png')}
              style={{ width: 30, height: 30 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={Selectscreen}
        options={{
          tabBarLabel: 'Camera',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('./Assets/camera.png')}
              style={{ width: 50, height: 50 }}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} onPress={handleCameraPress} />
          ),
        }}
      />
      <Tab.Screen
        name="Album"
        component={ListScreen}
        options={{
          tabBarLabel: 'Album',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('./Assets/placeholder.png')}
              style={{ width: 50, height: 50 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => (
  <NavigationContainer>
    <TabNav />
  </NavigationContainer>
);

export default App;