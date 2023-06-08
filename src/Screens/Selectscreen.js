import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, PermissionsAndroid, Linking, Alert, Modal } from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

const SelectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (route.params && route.params.selectedImage) {
      setSelectedImage(route.params.selectedImage);
    }
  }, [route.params]);

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
      const status = await requestPermission(
        Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA
      );

      if (status === 'granted') {
        const image = await ImageCropPicker.openCamera({
          mediaType: 'photo',
          cropping: true,
          width: 300,
          height: 300,
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
      setShowModal(false); // 关闭模态框
      navigation.navigate('Load', { selectedImage: selectedImage });
      const destinationPath = `${RNFS.DocumentDirectoryPath}/selectedImage.jpg`;
      console.log('destinationPath', destinationPath);
      await RNFS.mkdir(RNFS.DocumentDirectoryPath);
  
      // 缩放图片为500x500大小
      const resizedImage = await ImageResizer.createResizedImage(selectedImage, 500, 500, 'JPEG', 100);
  
      // 获取缩放后的图像路径
      const resizedImagePath = resizedImage.uri;
  
      await RNFS.copyFile(resizedImagePath, destinationPath);
      console.log('Image written');
  
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
          : PERMISSIONS.IOS.PHOTO_LIBRARY;
      const status = await check(permission);
      if (status !== RESULTS.GRANTED) {
        const granted = await request(permission);
        if (granted !== RESULTS.GRANTED) {
          console.log('拒绝访问存储权限');
          return;
        }
      }
    } catch (error) {
      console.log('error:', error);
    }
  };
  const confirmSelection = () => {
    if (selectedImage) {
      setShowModal(true);
    } else {
      Alert.alert('사진이 선택되지 않았습니다.', '사진을 선택해주세요!');
    }
  };
  const closeModal = () => {
    setShowModal(false);
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <View style={styles.frameContainer}>
          {selectedImage ? (
            <Image style={styles.image} source={{ uri: selectedImage }} />
          ) : (
            <Image style={styles.imagePlaceholder} source={require('../Assets/placeholder.png')} />
          )}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={albumButton}>
          <Image style={styles.buttonImage} source={require('../Assets/placeholder.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={cameraButton}>
          <Image style={styles.buttonImage} source={require('../Assets/camera.png')} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.checkButton} onPress={confirmSelection}>
        <Text style={styles.checkButtonText}>검사하기</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          {selectedImage && (
            <Image style={styles.modalImage} source={{ uri: selectedImage }} />
          )}
          <Text style={styles.modalText}>이 사진으로 사용하시겠습니까?</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={handleCheckButtonPress}>
              <Text style={styles.modalButtonText}>예</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>아니오</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  frameContainer: {
    width: 240,
    height: 240,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '120%',
    height: '120%',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  modalText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
  
  export default SelectScreen;