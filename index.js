import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", async function () {
  let prayerTimes = [];
  const tableBody = document.getElementById("prayerTableBody");

  const prayerTimesRef = collection(db, "Prayer Times");
  const querySnapshot = await getDocs(prayerTimesRef);
  console.log(prayerTimesRef);
  console.log(querySnapshot);

  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
    prayerTimes.push({ id: doc.id, ...doc.data() });
  });

  console.log(prayerTimes);

  const prayerOrder = ["Subh", "Zuhr", "Asr", "Maghrib", "Isha"];

  // Sort the prayerTimesArray based on the defined order
  let sortedPrayerTimes = prayerTimes.sort((a, b) => {
    return prayerOrder.indexOf(a.id) - prayerOrder.indexOf(b.id);
  });

  console.log(sortedPrayerTimes);

  async function displayPrayerTimes() {
    tableBody.innerHTML = "";
    sortedPrayerTimes.forEach((prayerTime, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td>${prayerTime.id}</td>
              <td>${prayerTime.Adhan}</td>
              <td>${prayerTime.Iqamah}</td>
        `;
      tableBody.appendChild(row);
    });
    saveToLocalStorage(sortedPrayerTimes);
  }

  function saveToLocalStorage(data) {
    localStorage.setItem("prayerTimes", JSON.stringify(data));
  }

  function loadFromLocalStorage() {
    const storedData = localStorage.getItem("prayerTimes");
    if (storedData) {
      prayerTimes = JSON.parse(storedData);
      sortedPrayerTimes = prayerTimes.sort((a, b) => {
        return prayerOrder.indexOf(a.id) - prayerOrder.indexOf(b.id);
      });
      displayPrayerTimes();
    }
  }
  loadFromLocalStorage();
  displayPrayerTimes();
});
