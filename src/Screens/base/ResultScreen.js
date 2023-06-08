import React, { useEffect, useState, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import ProgressBar from 'react-native-progress/Bar';


const externalFilesDir = RNFS.ExternalStorageDirectoryPath;
const DocumentDirectoryPath = RNFS.DocumentDirectoryPath;


  const ResultScreen = ({ route }) => {
    const navigation = useNavigation();
    const { selectedImage } = route.params;
    const [resultArray, setResultArray] = useState([]);
  
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
      navigation.navigate('SaveInput', { selectedImage });
    };

    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image style={styles.selectedImage} source={{ uri: selectedImage }} />
        </View>
        <View style={styles.rankContainer}>
          <TouchableOpacity style={styles.crownButton} onPress={CrownButtonPress}>
            <Image style={styles.crownIcon} source={require('../Assets/crown.png')} />
          </TouchableOpacity>
          <View style={styles.rankInfoContainer}>
            <Text style={styles.rankText}>1순위</Text>
            <View style={styles.inputContainer}>
              {resultArray.length > 0 && (
                <TextInput style={styles.input} placeholder={resultArray[0][0]} />
              )}
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={0.6} width={150} color={'green'} />
            <Text style={styles.progressBarPercent}>{resultArray.length > 0 ? `${resultArray[0][1]}%` : ''}</Text>
          </View>
        </View>
        <View style={styles.rankContainer}>
          <View style={styles.rankInfoContainer}>
            <Text style={styles.rankText}>2순위</Text>
            <View style={styles.inputContainer}>
              {resultArray.length > 1 && (
                <TextInput style={styles.input} placeholder={resultArray[1][0]} />
              )}
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={0.4} width={150} color={'blue'} />
            <Text style={styles.progressBarPercent}>{resultArray.length > 1 ? `${resultArray[1][1]}%` : ''}</Text>
          </View>
        </View>
        <View style={styles.rankContainer}>
          <View style={styles.rankInfoContainer}>
            <Text style={styles.rankText}>3순위</Text>
            <View style={styles.inputContainer}>
              {resultArray.length > 2 && (
                <TextInput style={styles.input} placeholder={resultArray[2][0]} />
              )}
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={0.2} width={150} color={'red'} />
            <Text style={styles.progressBarPercent}>{resultArray.length > 2 ? `${resultArray[2][1]}%` : ''}</Text>
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
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
    top: 0,
    left: 0,
    },
    crownIcon: {
    width: 40,
    height: 40,
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
    fontSize: 24,
    },
    progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 50,
    },
    progressBarPercent: {
    marginLeft: 10,
    fontSize: 14,
    },
    saveButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 100,
    },
    saveButtonText: {
    color: 'white',
    fontSize: 18,
    },
    });
    
    export default ResultScreen;