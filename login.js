import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9Qhhykgsh7woPJ6BONaSd3FT20k58jXc",
  authDomain: "kontagora-estate-masjid.firebaseapp.com",
  projectId: "kontagora-estate-masjid",
  storageBucket: "kontagora-estate-masjid.appspot.com",
  messagingSenderId: "635340592248",
  appId: "1:635340592248:web:33fd4c86b87d9d63dfc98d",
  measurementId: "G-HY6P24PBE5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!email || !password) {
    showToast("Please fill all the fields", "red");
    return;
  }

  loginWithEmailAndPassword(email, password);
});

function loginWithEmailAndPassword(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredentials) => {
      const user = userCredentials.user;
      console.log("Welcome", user);
      window.location.href = "admin.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      showToast(`Login failed: ${(errorCode, errorMessage)}`, "red");
      return;
    });
}

function showToast(message, bgColor) {
  // You can use your preferred toast library or implement a custom solution
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "center",
    backgroundColor: bgColor || "linear-gradient(to right, #00b09b, #96c93d)",
  }).showToast();
}
