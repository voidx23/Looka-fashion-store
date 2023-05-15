// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwQAFoMEx-v_ps9XYr6ARzts8lRYiy4X8",
  authDomain: "looka-c543f.firebaseapp.com",
  projectId: "looka-c543f",
  storageBucket: "looka-c543f.appspot.com",
  messagingSenderId: "192722822787",
  appId: "1:192722822787:web:213e734f32f53bf8d31db6",
  measurementId: "G-4094VB7NWW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);