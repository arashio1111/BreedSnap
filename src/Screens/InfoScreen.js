import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import Modal from 'react-native-modal';

let db;

const InfoScreen = ({ route }) => {
  const { selectedImage } = route.params;
  const [resultArray, setResultArray] = useState([]);
  const [firstItem, setFirstItem] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalImageUri, setModalImageUri] = useState(null);

  const buttonSize = Dimensions.get('window').width * 0.2;

  const loadResult = async () => {
    try {
      const resultString = await RNFS.readFile(`${RNFS.DocumentDirectoryPath}/result.txt`, 'utf8');
      const rows = resultString
        .split('\n')
        .map(line => line.trim().split(','))
        .filter(row => row.length === 2)
        .map(row => [row[0], parseFloat(row[1])]);
      setResultArray(rows);
      console.log(resultArray);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadResult();

    db = SQLite.openDatabase(
      {
        name: 'BREEDSNAP.db',
        location: 'default',
      },
      () => {
        console.log('Database opened');
      },
      (error) => {
        console.log('Error occurred while connecting to the database.', error);
      },
    );
  }, []);

  useEffect(() => {
    if (resultArray.length > 0) {
      setFirstItem(resultArray[0][0]);
    }
  }, [resultArray]);

  const handleButtonPress = (imageName) => {
    const query = `SELECT ${imageName} FROM SPECIES WHERE SNAME = ?`;

    db.transaction((tx) => {
      tx.executeSql(
        query,
        [firstItem],
        (tx, results) => {
          const len = results.rows.length;
          console.log('len:', len);
          if (len > 0) {
            for (let i = 0; i < len; i++) {
              let row = results.rows.item(i);
              console.log(`Row ${i}:`, row);
            }
            const DocumentDirectoryPath = 'file:///data/data/com.projectapp/files/'
            const speciesData = results.rows.item(0);
            const speciesDataString = JSON.stringify(speciesData);
            const speciesDataString2 = speciesDataString.replace(/"/g, '');
            const speciesDataString3 = speciesDataString2.replace(/:/g, ': ');
            const speciesDataString5 = speciesDataString3.replace(/{/g, '');
            const speciesDataString6 = speciesDataString5.replace(/}/g, '');
            setModalImageUri(`${DocumentDirectoryPath}/picture/${firstItem}.jpg`);
            setModalContent(speciesDataString6);
            setModalVisible(true);
          }
        },
        (tx, error) => {
          console.log('Database error: ', error.message);
          Alert.alert('Error', 'Failed to fetch species data: ' + error.message);
        },
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image style={styles.selectedImage} source={{ uri: selectedImage }} />
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('PERSONALITY')}>
            <Image
              source={require('../Assets/Personality.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('HOBBY')}>
            <Image
              source={require('../Assets/Hobby.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('EYESNOTE')}>
            <Image
              source={require('../Assets/EyesNote.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('MOUTHNOTE')}>
            <Image
              source={require('../Assets/MouthNote.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('NOSENOTE')}>
            <Image
              source={require('../Assets/NoseNote.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('SKINNOTE')}>
            <Image
              source={require('../Assets/SkinNote.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('EATNOTE')}>
            <Image
              source={require('../Assets/EatNote.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('LIMBNOTE')}>
            <Image
              source={require('../Assets/LimbNote.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.circleButton} onPress={() => handleButtonPress('ACTNOTE')}>
            <Image
              source={require('../Assets/ActNote.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1.1 }]}
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.row, styles.centerRow]}>
          <TouchableOpacity style={[styles.circleButton, styles.centerButton]} onPress={() => handleButtonPress('EARNOTE')}>
            <Image
              source={require('../Assets/EarsNote.png')}
              style={[styles.buttonImage, { width: buttonSize * 1, height: buttonSize * 1 }]}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Image source={{ uri: modalImageUri }} style={styles.modalImage} />
          <Text>{modalContent}</Text>
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
    marginTop: -10,
  },
  selectedImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    margin: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerRow: {
    marginBottom: 4,
  },
  circleButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    margin: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    alignSelf: 'center', // Center the button horizontally
    bottom: 0,
  },
  buttonImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});

export default InfoScreen;
