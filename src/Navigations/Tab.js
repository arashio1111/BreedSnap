import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, Selectscreen, LoadScreen } from '../Screens';
import ImageCropPicker from 'react-native-image-crop-picker';
import { Image } from 'react-native';

const Tab = createBottomTabNavigator();

const TabNav = () => {
  const openCamera = async () => {
    try {
      const image = await ImageCropPicker.openCamera({
        mediaType: 'photo',
        cropping: true,
      });

      console.log(image);
      // Do something with the captured image
    } catch (error) {
      console.log(error);
      // Handle camera capture error
    }
  };

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../Assets/home.png')}
              style={{ width: 100, height: 100 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cameras"
        component={Selectscreen}
        options={{
          tabBarLabel: 'Cameras',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../Assets/camera.png')}
              style={{ width: 100, height: 100 }}
            />
          ),
          tabBarOnPress: () => {
            openCamera();
          },
        }}
      />
      <Tab.Screen
        name="Album"
        component={LoadScreen}
        options={{
          tabBarLabel: 'Album',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../Assets/placeholder.jpg')}
              style={{ width: 100, height: 100 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNav;
