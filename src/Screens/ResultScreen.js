import React, { useEffect, useState, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import ProgressBar from 'react-native-progress/Bar';

const externalFilesDir = RNFS.ExternalStorageDirectoryPath;
const DocumentDirectoryPath = RNFS.DocumentDirectoryPath;

const ResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { resultString, selectedImage, selectedBreed } = route.params;
  const [resultArray, setResultArray] = useState([]);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    const loadResult = async () => {
      try {
        const resultString = await RNFS.readFile(
          `${DocumentDirectoryPath}/result.txt`,
          'utf8'
        );
        const rows = resultString
          .split('\n')
          .map(line => line.trim().split(','))
          .filter(row => row.length === 2)
          .map(row => [row[0], parseFloat(row[1])]);
        setResultArray(rows);
      } catch (error) {
        console.log(error);
      }
    };

    loadResult();
  }, []);

  const CrownButtonPress = () => {
    navigation.navigate('Info', { selectedImage });
  };

  const handleSaveButtonPress = () => {
    navigation.navigate('SaveInput', { selectedImage, text: resultArray[0][0], selectedBreed });
  };

  const animatedStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 5],
        }),
      },
    ],
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.5, 1],
    }),
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image style={styles.selectedImage} source={{ uri: selectedImage }} />
      </View>
      <View style={styles.rankContainer}>
        <TouchableOpacity style={styles.crownButton} onPress={CrownButtonPress}>
          <Animated.Image
            style={[styles.crownIcon, animatedStyle]}
            source={require('../Assets/crown.png')}
          />
        </TouchableOpacity>
        <View style={styles.rankInfoContainer}>
          <Text style={styles.rankText}>1순위</Text>
          <View style={styles.inputContainer}>
            {resultArray.length > 0 && <Text style={styles.input}>{resultArray[0][0]}</Text>}
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <ProgressBar
            progress={resultArray.length > 0 ? resultArray[0][1] / 100 : 0}
            width={150}
            height={15}
            color={'green'}
          />
          <Text style={styles.progressBarPercent}>
            {resultArray.length > 0 ? `${resultArray[0][1]}%` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.rankContainer}>
        <View style={styles.rankInfoContainer}>
          <Text style={styles.rankText}>2순위</Text>
          <View style={styles.inputContainer}>
            {resultArray.length > 1 && <Text style={styles.input}>{resultArray[1][0]}</Text>}
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <ProgressBar
            progress={resultArray.length > 1 ? resultArray[1][1] / 100 : 0}
            width={150}
            height={15}
            color={'blue'}
          />
          <Text style={styles.progressBarPercent}>
            {resultArray.length > 1 ? `${resultArray[1][1]}%` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.rankContainer}>
        <View style={styles.rankInfoContainer}>
          <Text style={styles.rankText}>3순위</Text>
          <View style={styles.inputContainer}>
            {resultArray.length > 2 && <Text style={styles.input}>{resultArray[2][0]}</Text>}
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <ProgressBar
            progress={resultArray.length > 2 ? resultArray[2][1] / 100 : 0}
            width={150}
            height={15}
            color={'red'}
          />
          <Text style={styles.progressBarPercent}>
            {resultArray.length > 2 ? `${resultArray[2][1]}%` : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveButtonPress}>
        <Text style={styles.saveButtonText}>저장</Text>
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
    margin: 30,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  input: {
    fontSize: 15,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  crownButton: {
    position: 'absolute',
    top: -20,
    left: 30,
  },
  crownIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  rankInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emptySpace: {
    flex: 1,
  },
  rankText: {
    fontSize: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 50,
  },
  progressBarPercent: {
    marginLeft: 10,
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 50,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default ResultScreen;
