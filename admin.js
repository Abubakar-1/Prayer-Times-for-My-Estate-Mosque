import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

async function isAdmin(uid) {
  const userDoc = doc(db, "Admin", uid);
  const userSnapshot = await getDoc(userDoc);
  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();
    return userData.role === "admin";
  }
  return false;
}

// Check if the user is logged in and is an admin
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const isAdminUser = await isAdmin(user.uid);
    if (isAdminUser) {
      // Redirect the user to another page (e.g., a restricted access page)
      window.location.href = "admin.html";
    }
  } else {
    // If the user is not logged in, redirect to the login page
    window.location.href = "login.html";
  }
});

const signOutBtn = document.getElementById("signOutBtn");
if (signOutBtn) {
  signOutBtn.addEventListener("click", () => {
    // Sign out the user
    signOut(auth)
      .then(() => {
        // Redirect to the login page or handle it based on your app flow
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  });
}

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
              <td><button data-index=${index} class="edit-button">Edit</button></td>
              <td>Action</td>
        `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll(".edit-button").forEach((editButton) => {
      editButton.addEventListener("click", (event) => {
        const index = event.currentTarget.getAttribute("data-index");
        console.log(index);
        editPrayerTimes(index);
      });
    });
  }

  function editPrayerTimes(index) {
    const prayerTime = sortedPrayerTimes[index];
    console.log(prayerTime);

    const row = document.createElement("tr");
    row.innerHTML = `
  <td>${prayerTime.id}</td>
  <td><input type="text" id="editAdhan" value="${prayerTime.Adhan}"></td>
  <td><input type="text" id="editIqamah" value="${prayerTime.Iqamah}"></td>
  <td><button class="save-button" data-index="${index}">Save</button></td>
  <td><button class="cancel-button" data-index="${index}">Cancel</button></td>
  `;

    tableBody.replaceChild(row, tableBody.childNodes[index]);

    document
      .querySelector(`.save-button[data-index="${index}"]`)
      .addEventListener("click", async function () {
        await savePrayerTime(index);
        await Toastify({
          text: "Time Edited Successfully!",
          duration: 3000,
          gravity: "top",
          position: "center",
          backgroundColor: "#007bff",
        }).showToast();
      });

    document
      .querySelector(`.cancel-button[data-index="${index}"]`)
      .addEventListener("click", function () {
        displayPrayerTimes();
      });

    async function savePrayerTime(index) {
      // Retrieve the new values from the input fields
      const adhanInput = document.getElementById("editAdhan");
      const iqamahInput = document.getElementById("editIqamah");
      const newAdhan = adhanInput.value;
      const newIqamah = iqamahInput.value;

      // Retrieve the document ID from sortedPrayerTimes
      const docId = sortedPrayerTimes[index].id;

      try {
        // Update the corresponding document in Firestore
        await updateDoc(doc(prayerTimesRef, docId), {
          Adhan: newAdhan,
          Iqamah: newIqamah,
        });

        // Update the local data to reflect the changes
        sortedPrayerTimes[index].Adhan = newAdhan;
        sortedPrayerTimes[index].Iqamah = newIqamah;

        // Re-render the table with updated data
        displayPrayerTimes();
        saveToLocalStorage(sortedPrayerTimes);

        console.log("Prayer time updated successfully!");
      } catch (error) {
        console.error("Error updating prayer time: ", error);
      }
    }
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
