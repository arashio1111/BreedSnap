import React, { useState, useEffect } from 'react';
import { View, Image, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

let db;

const ListScreen = ({ navigation }) => {
  const [dataFromDB, setDataFromDB] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    db = SQLite.openDatabase({ name: 'BREEDSNAP.db', createFromLocation: '~BREEDSNAP.db' });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT PNAME, SNAME as breed, AGE as age, GENDER as gender, UPETPICTURE FROM UPET',
        [],
        (tx, results) => {
          let data = [];
          for (let i = 0; i < results.rows.length; i++) {
            let row = results.rows.item(i);
            data.push({
              id: i.toString(),
              name: row.PNAME,
              breed: row.breed,
              age: row.age,
              gender: row.gender,
              image: row.UPETPICTURE ? `data:image/jpeg;base64,${row.UPETPICTURE}` : null,
            });
          }
          setDataFromDB(data);
        },
        (tx, error) => {
          console.log('Error: ', error);
        }
      );
    });
  }, []);

  const handleSearch = (text) => {
    setSearchText(text.toLowerCase());
  };

  const handleItemPress = (item) => {
    navigation.navigate('Detail', { item });
  };

  const renderItems = (item) => (
    <TouchableOpacity
      style={styles.itemContainer}
      key={item.id}
      onPress={() => handleItemPress(item)}
    >
      {item.image && <Image style={styles.image} source={{ uri: item.image }} />}
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );

  const filteredData = dataFromDB.filter(item => {
    const itemName = item.name ? item.name.toLowerCase() : '';
    return itemName.includes(searchText);
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="검색"
        value={searchText}
        onChangeText={handleSearch}
      />
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredData.map(renderItems)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flex: 0.5,
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListScreen;
