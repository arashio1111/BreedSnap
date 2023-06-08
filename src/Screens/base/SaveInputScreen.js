import React, { useState, useEffect } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';

let db;

const SaveInputScreen = ({ route, navigation }) => {
  const { selectedImage } = route.params;
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [species, setSpecies] = useState([]);

  useEffect(() => {
    db = SQLite.openDatabase(
      {
        name: 'BREEDSNAP.db',
        location: 'default',
      },
      () => {
        console.log('Database opened');

        // Execute any database initialization or setup code here.
        db.transaction((tx) => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS UPET (id INTEGER PRIMARY KEY AUTOINCREMENT, PNAME TEXT, SNAME TEXT, AGE TEXT, GENDER TEXT);',
            [],
            () => {
              console.log('Table created successfully');
            },
            (error) => {
              console.log('Error occurred while creating the table.', error);
            },
          );
        });
      },
      (error) => {
        console.log('Error occurred while connecting to the database.', error);
      },
    );
    
    return () => {
      console.log("Closing Database Connection");
      if (db) {
        db.close();
      } else {
        console.log("Database was not OPENED");
      }
    };
  }, []);

  useEffect(() => {
    // Fetch SPECIES from db
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM SPECIES', [], (tx, results) => {
        let data = [];
        for (let i = 0; i < results.rows.length; ++i) {
          data.push(results.rows.item(i).SNAME);
        }
        setSpecies(data);
      });
    });
  }, []);

  const handleSave = async () => {
    console.log('Save button pressed!');
    console.log('Name:', name);
    console.log('Breed:', breed);
    console.log('Age:', age);
    console.log('Gender:', gender);

    const imagePath = `${RNFS.DocumentDirectoryPath}/selectedImage.jpg`;
    let base64Image = '';
    try {
      base64Image = await RNFS.readFile(imagePath, 'base64');
    } catch (error) {
      console.log('Error reading image file:', error);
    };

    const resultPath = `${RNFS.DocumentDirectoryPath}/result.txt`;
    let firstResult = '';
    try {
      const resultData = await RNFS.readFile(resultPath, 'utf8');
      firstResult = resultData.split('\n')[0].split(' ')[1];
    } catch (error) {
      console.log('Error reading result file:', error);
    };


    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO UPET (PNAME, SNAME, AGE, GENDER, FIRST, UPETPICTURE) VALUES (?, ?, ?, ?, ?, ?)',
        [name, breed, age, gender, firstResult, base64Image],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            Alert.alert('저장되었습니다.');
          } else {
            alert('Save failed');
          }
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image style={styles.selectedImage} source={{ uri: selectedImage }} />
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <Text style={styles.label}>이름</Text>
          <TextInput style={styles.input} placeholder="이름을 입력하세요" value={name} onChangeText={setName}/>
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>품종</Text>
          <Picker
            selectedValue={breed}
            style={styles.input}
            onValueChange={(itemValue) => setBreed(itemValue)}
          >
            {species.map((sname, index) => (
              <Picker.Item key={index} label={sname} value={sname} />
            ))}
          </Picker>
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>나이</Text>
          <TextInput style={styles.input} placeholder="나이를 입력하세요" value={age} onChangeText={setAge}/>
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.label}>성별</Text>
          <TextInput style={styles.input} placeholder="성별을 입력하세요" value={gender} onChangeText={setGender}/>
        </View>
        <Button title="저장하기" onPress={handleSave}/>
      </View>
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
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
});

export default SaveInputScreen;