import React, { useState, useEffect } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Button, Modal, TouchableOpacity } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Picker } from '@react-native-picker/picker';

let db;

const DetailScreen = ({ route, navigation }) => {
  const [species, setSpecies] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  if (!route || !route.params || !route.params.item) {
    return <Text>No item found.</Text>;
  }
  useEffect(() => {
    db = SQLite.openDatabase(
      { name: 'BREEDSNAP.db', createFromLocation: '~BREEDSNAP.db' },
      () => {
        console.log('Database opened');
      },
      (error) => {
        console.log('Error occurred while connecting to the database.', error);
      }
    );
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

  const { item } = route.params;

  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedBreed, setEditedBreed] = useState(item.breed);
  const [editedAge, setEditedAge] = useState(item.age.toString());
  const [editedGender, setEditedGender] = useState(item.gender);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE UPET SET PNAME = ?, SNAME = ?, AGE = ?, GENDER = ? WHERE PNAME = ?',
        [editedName, editedBreed, editedAge, editedGender, item.name],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            setModalMessage('저장되었습니다.');
            setModalVisible(true);
            setEditMode(false);
            console.log('Save button pressed!');
            console.log('Name:', editedName);
            console.log('Breed:', editedBreed);
            console.log('Age:', editedAge);
            console.log('Gender:', editedGender);
          } else {
            setModalMessage('Save failed');
            setModalVisible(true);
          }
        }
      );
    });
  };

  const handleGoToList = () => {
    navigation.navigate('List');
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{ uri: item.image }} />
      <View style={styles.infoContainer}>
        <Text style={styles.label}>이름:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedName}
            onChangeText={setEditedName}
          />
        ) : (
          <Text style={styles.value}>{item.name}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>품종:</Text>
        {editMode ? (
          <Picker
            selectedValue={editedBreed}
            style={styles.input}
            onValueChange={(itemValue) => setEditedBreed(itemValue)}
          >
            {species.map((sname, index) => (
              <Picker.Item key={index} label={sname} value={sname} />
            ))}
          </Picker>
        ) : (
          <Text style={styles.value}>{item.breed}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>나이:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedAge}
            onChangeText={setEditedAge}
          />
        ) : (
          <Text style={styles.value}>{item.age}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>성별:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={editedGender}
            onChangeText={setEditedGender}
          />
        ) : (
          <Text style={styles.value}>{item.gender}</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="목록"
          containerStyle={[styles.button, styles.listButton]}
          onPress={handleGoToList}
        />
        {editMode ? (
          <Button
            title="저장"
            containerStyle={styles.button}
            onPress={handleSave}
          />
        ) : (
          <Button
            title="수정"
            containerStyle={styles.button}
            onPress={handleEdit}
          />
        )}
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>확인</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
    marginBottom: 50,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  value: {
    flex: 1,
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  listButton: {
    backgroundColor: 'green',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalMessage: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DetailScreen;