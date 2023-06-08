import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, Selectscreen, LoadScreen, ResultScreen } from '../Screens';
import { Picker } from '@react-native-picker/picker';
import SQLite from 'react-native-sqlite-storage';

const Stack = createNativeStackNavigator();

const StackNav = () => {
    <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Picture" component={Selectscreen} />
        <Stack.Screen name="Load" component={LoadScreen} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
    </Stack.Navigator>
};

export default StackNav;