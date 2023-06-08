import React from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';

const CustomButton = ({ title, onPress, isSelected }) => {
  return (
    <TouchableOpacity
      style={[styles.button, isSelected ? styles.selectedButton : null]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();

  const Selectscreen = (image) => {
    navigation.navigate('Picture', { image });
  };

  return (
    <View style={styles.container}>
      <View style={styles.halfContainer}>
        <Image
          style={styles.image}
          source={require('../Assets/dog.jpg')}
        />
        <CustomButton
          title="검사하기"
          onPress={async () => {
            await RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/selected.txt`, 'dog', 'utf8');
            navigation.navigate('Picture');
          }}
        />
      </View>
      <View style={styles.halfContainer}>
        <Image
          style={styles.image}
          source={require('../Assets/cat.jpg')}
        />
        <CustomButton
          title="검사하기"
          onPress={async () => {
            await RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/selected.txt`, 'cat', 'utf8');
            navigation.navigate('Picture');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  halfContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: 'skyblue',
    width: 200,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
  image: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
    margin: 15,
    borderRadius: 30,
  },
});

export default HomeScreen;
