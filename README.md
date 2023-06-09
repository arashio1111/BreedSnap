# BreedSnap
This is an application built by react native, which contains the tensorflow lite model converted from the cat or dog breed model using ResNet50, and an example of using the sqlite3 database built at will.

# NOTE
### Model and other file resources
* All files required for program operation are located in the '/assets' directory, including the model and sqlite3 database.
* If you want to avoid stepping into pitfalls when creating Android projects in React Native and pairing them with artificial intelligence classification models, some of the content can be for your reference.

### About classification model
* The model is a CNN model built on Resnet50 and currently only supports breed classification for 52 types of dogs and 12 types of cats. And the model was originally a keras. h5 file, converted into tf lite.

### How to use tflite and sqlite3 in react-native project
* There are several Module file in the "/android/app/src/main/java/com/projectapp/" directory, which enable the project to support tensorflow lite and sqlite. However, it should be noted that there will be a reactive active sensorflow lite folder in the node_modules folder under the root directory. Every time you add a module through "npm install" or "yarn add", 
"node_modules\reactive-active-sensorflow-lite \android\build.gradle" 
There will be 
 "compile 'com. Facebook. react: react native:+'" 
 and 
 "compile 'org. sensor flow: tensorflow site:+'” 
 You need to modify 'compile' to 'implementation' so that the project can compile normally.
