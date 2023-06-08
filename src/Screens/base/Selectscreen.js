import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, PermissionsAndroid, Linking } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';

const SelectScreen = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        if (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED 
        ) {
          console.log('Camera and Storage permission granted');
        } else {
          console.log('Camera and Storage permission denied');
        }
      } else {
        const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
        const photoStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (cameraStatus === RESULTS.GRANTED && photoStatus === RESULTS.GRANTED) {
          console.log('Camera and Photo Library permission granted');
        } else if (cameraStatus === RESULTS.DENIED || photoStatus === RESULTS.DENIED) {
          console.log('Permission denied for accessing camera or photo library');
        } else if (cameraStatus === RESULTS.BLOCKED || photoStatus === RESULTS.BLOCKED) {
          console.log('Permission blocked for accessing camera or photo library');
        }
      }
    } catch (error) {
      console.log('Error occurred while requesting permissions:', error);
    }
  };

  const openAppSettings = () => {
    Linking.openSettings();
  };

  const albumButton = async () => {
    try {
      const status = await requestPermission(
        Platform.OS === 'android' ? 
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE : 
        PERMISSIONS.IOS.PHOTO_LIBRARY
      );
  
      if (status === RESULTS.GRANTED) {
        const image = await ImageCropPicker.openPicker({
          mediaType: 'photo',
          cropping: true,
          // ...
        });
        setSelectedImage(image.path);

      } else if (status === RESULTS.DENIED) {
        console.log('Permission denied for accessing photo library');
      } else if (status === RESULTS.BLOCKED) {
        console.log('Permission blocked for accessing photo library');
        openAppSettings(); // Open app settings screen
      }
    } catch (error) {
      console.log('Error occurred while selecting image:', error);
    }
  };
  

  const cameraButton = async () => {
    try {
      const status = await requestPermission(Platform.OS === 'android' ? 
      PERMISSIONS.ANDROID.CAMERA : 
      PERMISSIONS.IOS.CAMERA);

      if (status === 'RESULTS.GRANTED') {
        const image = await ImageCropPicker.openCamera({
          mediaType: 'photo',
          cropping: true,
          // ...
        });
        setSelectedImage(image.path);

      } else {
        console.log('Permission denied for accessing camera');
      }
    } catch (error) {
      console.log('Error occurred while capturing image:', error);
    }
  };

  const requestPermission = async (permission) => {
    try {
      const status = await request(permission);
      return status;
    } catch (error) {
      console.log('Error occurred while requesting permission:', error);
      return 'denied';
    }
  };

  const handleCheckButtonPress = async () => {
    try {
      navigation.navigate('Load');
      const destinationPath = `${RNFS.DocumentDirectoryPath}/selectedImage.jpg`;
      console.log('destinationPath', destinationPath);
      await RNFS.mkdir(RNFS.DocumentDirectoryPath);
      await RNFS.copyFile(selectedImage, destinationPath);
      console.log('Image saved successfully');
      console.log('Error occurred while saving image:', error);
  
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
          : PERMISSIONS.IOS.PHOTO_LIBRARY;
      const status = await check(permission);
      if (status !== RESULTS.GRANTED) {
        const granted = await request(permission);
        if (granted !== RESULTS.GRANTED) {
          console.log('Permission denied for accessing storage');
          return;
        }
      }
  
      await navigation.navigate('ResultScreen', { selectedImage: `file://${destinationPath}` });
    } catch (error) {
      console.log('Error occurred:', error);
    }
  };

return (
  <View style={styles.container}>
    <View style={styles.imageContainer}>
      <View style={styles.previewContainer}>
        {selectedImage ? (
        <Image style={styles.image} source={{ uri: selectedImage }} />
        ) : (
        <Image
        style={styles.imagePlaceholder}
        source={require('../Assets/placeholder.jpg')}
        />
        )}
    </View>
  </View>
  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.button} onPress={albumButton}>
      <Image style={styles.buttonImage} source={require('../Assets/placeholder.jpg')} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={cameraButton}>
      <Image style={styles.buttonImage} source={require('../Assets/camera.png')} />
    </TouchableOpacity>
  </View>
    <TouchableOpacity style={styles.checkButton} onPress={handleCheckButtonPress}>
      <Text style={styles.checkButtonText}>검사하기</Text>
      
    </TouchableOpacity>
  </View>
  );
  };
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
    imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    previewContainer: {
    width: '100%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '200%',
    height: '200%',
    resizeMode: 'contain',
  },
    imagePlaceholder: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
    buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
    button: {
    marginHorizontal: 10,
    width: 200,
    height: 200,
  },
    buttonImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
    checkButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
    checkButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
  
  export default SelectScreen;