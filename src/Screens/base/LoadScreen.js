import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { RNTensorflowLite } from 'react-native-tensorflow-lite';
import ImageResizer from 'react-native-image-resizer';
import RNTensorFlowLite from 'react-native-tensorflow-lite';
import { NativeModules } from 'react-native';
const TFLite = NativeModules.TFLite;



// 调用index.js



const DogResult = ['American_Bulldog', 'American_Cocker_Spaniel','American_Pit_Bull_Terrier','Basset_Hound','Beagle','Bedlington_Terrier','Bichon_Frise','Border_Collie','Boston_Terrier','Boxer','Cavalier_King_Charles_Spaniel','Chihuahua','Dachshund','English_Cocker_Spaniel','English_Setter','French_Bulldog','German_Shorthaired','Golden_Retriever','Great_Pyrenees','Havanese','Italian_Greyhound','Japanese_Chin','Japanese_Spitz','Jindo_Dog','Keeshond','Labrador_Retriever','Leonberger','Maltese','Miniature_Pinscher','Miniature_Poodle','Miniature_Schnauzer','Newfoundland','Papillon','Pekingese','Pembroke_Welsh_Corgi','Pomeranian','Poodle','Poongsan_Dog','Pug','Saint_Bernard','Samoyed','Scottish_Terrier','Shetland_Sheepdog','Shiba_Inu','Shih_Tzu','Siberian_Husky','Staffordshire_Bull_Terrier','Standard_Poodle','Toy_Poodle','Welsh_Corgi','Wheaten_Terrier','Yorkshire_Terrier']
const CatResult = ['Abyssinian', 'Bengal', 'Birman', 'Bombay', 'British_Shorthair', 'Egyptian_Mau', 'Maine_Coon','Persian','Ragdoll','Russian_Blue','Siamese','Sphynx']
const output = [];
const imagePath = `${RNFS.DocumentDirectoryPath}/selectedImage.jpg`;

// photo의 filter(224*224)
async function scaleImage(uri) {
  const width = 224;
  const height = 224;

  try {
    const resizedImage = await ImageResizer.createResizedImage(uri, width, height, 'JPEG', 100);
    const destinationPath = `${RNFS.DocumentDirectoryPath}/scaled_image.jpg`;
    await RNFS.moveFile(resizedImage.uri, destinationPath);
    return destinationPath;
  }  catch (error) {
    console.log('Error occurred while scaling image:', error);
    throw error;
  }
}


const LoadScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [output, setOutput] = useState([]);

  useEffect(() => {
    fetchData();
    startAnimation();
  }, []);

  const requestFilePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permission);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage Permission Granted.');
        } else {
          console.log('Storage Permission Denied.');
        }
      } else if (Platform.OS === 'ios') {
        const permission = Platform.PermissionTypes.photoLibrary;
        const status = await requestPermission(permission);
        if (status === 'granted') {
          console.log('Storage Permission Granted.');
        } else {
          console.log('Storage Permission Denied.');
        }
      }
    } catch (error) {
      console.log('Error requesting storage permission:', error);
    }
  };
  



  const fetchData = async () => {
    let selectedResult;
    let model;
    let label;
  
    try {
      Selectscreen = await RNFS.readFile(`${RNFS.DocumentDirectoryPath}/selected.txt`, 'utf8');
      await requestFilePermission();
      let selectedResult = [];
      let modelPath;
      let labelNum;

    
      const externalFilesDir = RNFS.ExternalStorageDirectoryPath;
      if (Selectscreen.trim() === 'dog') {
        modelPath = RNFS.DocumentDirectoryPath + "/DogModel.tflite";
        label = DogResult;
        labelNum = 52;
      } else {
        modelPath = RNFS.DocumentDirectoryPath + "/CatModel.tflite";
        label = CatResult;
        labelNum = 12;
      }
      

      const result = await TFLite.runModelOnImage(modelPath, imagePath, labelNum)
        .then((outputArray) => {
          console.log(outputArray);

          return outputArray; 
        })
        .catch((error) => {
          console.error(error);
        });
    
        setOutput(result);

        // 将result得到的数组与label中的元素一一对应
        const predictions = await Array.from(result).map((item, index) => {
          const breed = label[index];
          const probability = item;
          return [breed, probability];
        });

        // 按概率值降序排序并只取前三个
        const sortedPredictions = await predictions.sort((a, b) => b[1] - a[1]).slice(0, 3);
        console.log(sortedPredictions);

        // 将概率值转换为百分比
        sortedPredictions.forEach((item) => {
          item[1] = `${(item[1] * 100).toFixed(2)}%`;
        });


        const resultString = sortedPredictions.map(([breed, probability]) => `${breed},${probability}`).join('\n');
        console.log(resultString);


    

      await RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/result.txt`, resultString, 'utf8');
      console.log('FILE WRITTEN!');
      navigation.navigate('ResultScreen', { output: resultString });
      //navigation.navigate('Output', { output });
    
    } catch (error) {
      console.error('Error reading or loading model:', error);
      console.error(error.stack);
      throw error;
    }
    
  
  };


  const startAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      setProgress(1);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
        검사중... 잠시만 기다려주세요
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    width: '0%',
    height: 10,
    backgroundColor: 'blue',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
  },
});

export default LoadScreen;

