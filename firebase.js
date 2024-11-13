const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');

// const { getAuth } = require('firebase/auth');
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBnIeWU4ARmLnxVzxRXseyCihDwzJmiA44',
  authDomain: 'bioproduct-fa5a4.firebaseapp.com',
  databaseURL: 'https://bioproduct-fa5a4-default-rtdb.firebaseio.com',
  projectId: 'bioproduct-fa5a4',
  storageBucket: 'bioproduct-fa5a4.appspot.com',
  messagingSenderId: '349999915954',
  appId: '1:349999915954:web:8cac66788e128a09667aab',
  measurementId: 'G-5D2JDZGW5W',
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

module.exports = { storage, ref, getDownloadURL, uploadBytes, deleteObject };
