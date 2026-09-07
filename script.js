// ======================================================
// WORKERPAY - COMPLETE script.js
// Firebase + 3-Day Free Trial + Razorpay Subscription
// ======================================================

// ================= FIREBASE IMPORTS ====================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ================= FIREBASE CONFIG =====================

const firebaseConfig = {
  apiKey: "AIzaSyDT5PdWyAyqrfGtEh9kYyeHvFA3DQ7QDsA",
  authDomain: "worker-pay.firebaseapp.com",
  projectId: "worker-pay",
  storageBucket: "worker-pay.firebasestorage.app",
  messagingSenderId: "145618936395",
  appId: "1:145618936395:web:310a3e79e52c9b733763ce"
};


// ================= INITIALIZE FIREBASE =================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ======================================================
// HELPER
// ======================================================

const $ = (id) => document.getElementById(id);


// ======================================================
// DEFAULT OPERATIONS
// ======================================================

let operations = [
  {
    name: "Kafa Stitching",
    rate: 3.75
  },
  {
    name: "Badan Patti",
    rate: 0.90
  },
  {
    name: "Kacha Patti",
    rate: 0.90
  },
  {
    name: "Button Patti / Kaj Patti",
    rate: 1.90
  },
  {
    name: "Back Shoulder",
    rate: 1.40
  },
  {
    name: "Sleeve Hemming",
    rate: 1.60
  },
  {
    name: "Collar Making",
    rate: 6
  },
  {
    name: "Cup Making",
    rate: 3
  },
  {
    name: "Bottom",
    rate: 3
  },
  {
    name: "Sleeve Patti",
    rate: 5
  },
  {
    name: "Sleeve Attach",
    rate: 5
  },
  {
    name: "Kandhi",
    rate: 1.90
  }
];


// ======================================================
// WORK HISTORY
// ======================================================

let workHistory = [];


// ======================================================
// LOAD LOCAL DATA
// ======================================================

function loadLocalData() {

  try {

    const savedOperations =
      localStorage.getItem("workerpay_operations");

    if (savedOperations) {

      const parsed = JSON.parse(savedOperations);

      if (Array.isArray(parsed) && parsed.length > 0) {
        operations = parsed;
      }

    }

  } catch (error) {

    console.error("Operations load error:", error);

  }


  try {

    const savedHistory =
      localStorage.getItem("workerpay_history");

    if (savedHistory) {

      const parsedHistory =
        JSON.parse(savedHistory);

      if (Array.isArray(parsedHistory)) {
        workHistory = parsedHistory;
      }

    }

  } catch (error) {

    console.error("History load error:", error);

  }

}


// ======================================================
// SAVE LOCAL DATA
// ======================================================

function saveLocalData() {

  try {

    localStorage.setItem(
      "workerpay_operations",
      JSON.stringify(operations)
    );

    localStorage.setItem(
      "workerpay_history",
      JSON.stringify(workHistory)
    );

  } catch (error) {

    console.error("Local save error:", error);

  }

}


// ======================================================
// AUTH SCREEN VISIBILITY
// ======================================================

function setAppVisibility(loggedIn) {

  const authScreen = $("authScreen");
  const header = document.querySelector(".header");
  const main = document.querySelector("main");
  const bottomNav = document.querySelector(".bottom-nav");
  const trialBanner = $("trialBanner");

  if (authScreen) {
    authScreen.style.display =
      loggedIn ? "none" : "flex";
  }

  if (header) {
    header.style.display =
      loggedIn ? "" : "none";
  }

  if (main) {
    main.style.display =
      loggedIn ? "" : "none";
  }

  if (bottomNav) {
    bottomNav.style.display =
      loggedIn ? "" : "none";
  }

  if (!loggedIn && trialBanner) {
    trialBanner.style.display = "none";
  }

}


// ======================================================
// AUTH - SHOW LOGIN
// ======================================================

function showLogin() {

  const loginBox = $("loginBox");
  const signupBox = $("signupBox");
  const forgotBox = $("forgotBox");

  if (loginBox) {
    loginBox.style.display = "block";
  }

  if (signupBox) {
    signupBox.style.display = "none";
  }

  if (forgotBox) {
    forgotBox.style.display = "none";
  }

}


// ======================================================
// AUTH - SHOW SIGNUP
// ======================================================

function showSignup() {

  const loginBox = $("loginBox");
  const signupBox = $("signupBox");
  const forgotBox = $("forgotBox");

  if (loginBox) {
    loginBox.style.display = "none";
  }

  if (signupBox) {
    signupBox.style.display = "block";
  }

  if (forgotBox) {
    forgotBox.style.display = "none";
  }

}


// ======================================================
// AUTH - SHOW FORGOT PASSWORD
// ======================================================

function showForgotPassword() {

  const loginBox = $("loginBox");
  const signupBox = $("signupBox");
  const forgotBox = $("forgotBox");

  if (loginBox) {
    loginBox.style.display = "none";
  }

  if (signupBox) {
    signupBox.style.display = "none";
  }

  if (forgotBox) {
    forgotBox.style.display = "block";
  }

}


// ======================================================
// LOGIN
// ======================================================

async function loginUser() {

  const emailElement = $("loginEmail");
  const passwordElement = $("loginPassword");
  const messageElement = $("loginMessage");

  const email = emailElement?.value.trim();
  const password = passwordElement?.value;

  if (!email || !password) {

    if (messageElement) {
      messageElement.textContent =
        "Please enter email and password.";
    }

    return;
  }


  try {

    if (messageElement) {
      messageElement.textContent = "Logging in...";
    }

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (messageElement) {
      messageElement.textContent = "";
    }

  } catch (error) {

    console.error("Login error:", error);

    if (messageElement) {

      if (error.code === "auth/invalid-credential") {

        messageElement.textContent =
          "Invalid email or password.";

      } else if (error.code === "auth/user-not-found") {

        messageElement.textContent =
          "Account not found.";

      } else if (error.code === "auth/wrong-password") {

        messageElement.textContent =
          "Wrong password.";

      } else {

        messageElement.textContent =
          error.message;

      }

    }

  }

}


// ======================================================
// SIGNUP
// ======================================================

async function signupUser() {

  const usernameElement = $("signupUsername");
  const emailElement = $("signupEmail");
  const passwordElement = $("signupPassword");
  const confirmPasswordElement =
    $("signupConfirmPassword");

  const messageElement = $("signupMessage");

  const username = usernameElement?.value.trim();
  const email = emailElement?.value.trim();
  const password = passwordElement?.value;
  const confirmPassword =
    confirmPasswordElement?.value;


  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword
  ) {

    if (messageElement) {
      messageElement.textContent =
        "Please fill all fields.";
    }

    return;
  }


  if (password.length < 6) {

    if (messageElement) {
      messageElement.textContent =
        "Password must be at least 6 characters.";
    }

    return;
  }


  if (password !== confirmPassword) {

    if (messageElement) {
      messageElement.textContent =
        "Passwords do not match.";
    }

    return;
  }


  try {

    if (messageElement) {
      messageElement.textContent =
        "Creating account...";
    }


    // Create Firebase Auth account

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user = userCredential.user;


    // Save username in Firebase Authentication

    await updateProfile(user, {
      displayName: username
    });


    // Create 3-day trial

    const trialStart = new Date();

    const trialEnd =
      new Date(trialStart);

    trialEnd.setDate(
      trialEnd.getDate() + 3
    );


    // Save user information in Firestore

    try {

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          username: username,
          email: email,
          createdAt: serverTimestamp(),

          trialStart: trialStart,
          trialEnd: trialEnd,

          subscriptionStatus: "trial"
        }
      );

    } catch (firestoreError) {

      console.error(
        "Firestore user save error:",
        firestoreError
      );

    }


    if (messageElement) {

      messageElement.textContent =
        `Welcome, ${username}!`;

    }

  } catch (error) {

    console.error("Signup error:", error);

    if (messageElement) {

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        messageElement.textContent =
          "This email is already registered.";

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {

        messageElement.textContent =
          "Please enter a valid email.";

      } else if (
        error.code ===
        "auth/weak-password"
      ) {

        messageElement.textContent =
          "Password is too weak.";

      } else {

        messageElement.textContent =
          error.message;

      }

    }

  }

}


// ======================================================
// FORGOT PASSWORD
// ======================================================

async function resetPassword() {

  const emailElement = $("forgotEmail");
  const messageElement = $("forgotMessage");

  const email =
    emailElement?.value.trim();


  if (!email) {

    if (messageElement) {
      messageElement.textContent =
        "Please enter your email.";
    }

    return;
  }


  try {

    await sendPasswordResetEmail(
      auth,
      email
    );

    if (messageElement) {

      messageElement.textContent =
        "Password reset email sent. Check your inbox.";

    }

  } catch (error) {

    console.error(
      "Password reset error:",
      error
    );

    if (messageElement) {

      if (
        error.code ===
        "auth/user-not-found"
      ) {

        messageElement.textContent =
          "No account found with this email.";

      } else {

        messageElement.textContent =
          error.message;

      }

    }

  }

}


// ======================================================
// LOGOUT
// ======================================================

async function logout() {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

}


// ======================================================
// UPDATE LOGGED-IN USERNAME
// ======================================================

async function updateLoggedInUsername(user) {

  const usernameElement =
    $("loggedInUsername");

  if (!usernameElement) return;

  let username =
    user.displayName || "";


  try {

    const userDoc =
      await getDoc(
        doc(db, "users", user.uid)
      );


    if (userDoc.exists()) {

      const data =
        userDoc.data();

      username =
        data.username ||
        username;

    }

  } catch (error) {

    console.error(
      "Username fetch error:",
      error
    );

  }


  usernameElement.textContent =
    username || "User";

}


// ======================================================
// GET USER DATA
// ======================================================

async function getCurrentUserData(user) {

  if (!user) return null;


  try {

    const userDoc =
      await getDoc(
        doc(db, "users", user.uid)
      );


    if (userDoc.exists()) {

      return userDoc.data();

    }


    return null;

  } catch (error) {

    console.error(
      "User data fetch error:",
      error
    );

    return null;

  }

}


// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (user) {

      setAppVisibility(true);

      await updateLoggedInUsername(user);


      loadLocalData();

      loadOperations();

      loadHistory();

      updateDashboard();

      updateEarnings();

      loadAdminOperations();

      showSection("dashboard");


      // Load trial/subscription data

      const userData =
        await getCurrentUserData(user);


      if (userData) {

        updateTrialBanner(userData);

        updateTrialCard(userData);

      } else {

        hideTrialUI();

      }

    } else {

      setAppVisibility(false);

      hideTrialUI();

    }

  }
);


// ======================================================
// SECTION NAVIGATION
// ======================================================

function showSection(sectionId) {

  const sections =
    document.querySelectorAll(".section");


  sections.forEach(
    (section) => {

      section.style.display = "none";

    }
  );


  const selected =
    $(sectionId);


  if (selected) {

    selected.style.display =
      "block";

  }


  // Bottom navigation active state

  const navItems =
    document.querySelectorAll(
      ".bottom-nav button"
    );


  navItems.forEach(
    (button) => {

      button.classList.remove(
        "active"
      );

    }
  );


  navItems.forEach(
    (button) => {

      const onclickValue =
        button.getAttribute(
          "onclick"
        ) || "";


      if (
        onclickValue.includes(
          `showSection('${sectionId}')`
        ) ||
        onclickValue.includes(
          `showSection("${sectionId}")`
        )
      ) {

        button.classList.add(
          "active"
        );

      }

    }
  );


  // Update section data

  if (sectionId === "dashboard") {
    updateDashboard();
  }


  if (sectionId === "history") {
    loadHistory();
  }


  if (sectionId === "earnings") {
    updateEarnings();
  }


  if (sectionId === "admin") {
    loadAdminOperations();
  }

}


// ======================================================
// LOAD OPERATIONS INTO DROPDOWN
// ======================================================

function loadOperations() {

  const operationSelect =
    $("operationSelect");


  if (!operationSelect) {

    console.warn(
      "operationSelect not found in HTML."
    );

    return;

  }


  operationSelect.innerHTML =
    `<option value="">Select Operation</option>`;


  operations.forEach(
    (operation, index) => {

      const option =
        document.createElement(
          "option"
        );


      option.value = index;


      option.textContent =
        `${operation.name} - ₹${Number(
          operation.rate
        ).toFixed(2)}`;


      operationSelect.appendChild(
        option
      );

    }
  );


  updateRateDisplay();

}


// ======================================================
// UPDATE RATE DISPLAY
// ======================================================

function updateRateDisplay() {

  const operationSelect =
    $("operationSelect");

  const rateDisplay =
    $("rateDisplay");


  if (
    !operationSelect ||
    !rateDisplay
  ) {
    return;
  }


  const selectedIndex =
    operationSelect.value;


  if (
    selectedIndex === "" ||
    !operations[selectedIndex]
  ) {

    rateDisplay.textContent =
      "₹0.00";

    return;

  }


  const rate =
    Number(
      operations[selectedIndex].rate
    );


  rateDisplay.textContent =
    `₹${rate.toFixed(2)}`;

}


// ======================================================
// CALCULATE PREVIEW
// ======================================================

function calculatePreview() {

  updateRateDisplay();


  const operationSelect =
    $("operationSelect");

  const quantityInput =
    $("quantity");

  const preview =
    $("previewEarning");


  if (
    !operationSelect ||
    !quantityInput ||
    !preview
  ) {
    return;
  }


  const selectedIndex =
    operationSelect.value;


  const quantity =
    Number(quantityInput.value);


  if (
    selectedIndex === "" ||
    !operations[selectedIndex] ||
    !quantity ||
    quantity < 0
  ) {

    preview.textContent =
      "₹0.00";

    return;

  }


  const rate =
    Number(
      operations[selectedIndex].rate
    );


  const earning =
    rate * quantity;


  preview.textContent =
    `₹${earning.toFixed(2)}`;

}


// ======================================================
// PHOTO PREVIEW
// ======================================================

const piecePhoto =
  $("piecePhoto");

const photoPreview =
  $("photoPreview");


if (
  piecePhoto &&
  photoPreview
) {

  piecePhoto.addEventListener(
    "change",
    function () {

      const file =
        this.files?.[0];


      if (!file) {

        photoPreview.innerHTML =
          "";

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          photoPreview.innerHTML = `
            <img
              src="${event.target.result}"
              alt="Piece Photo"
              style="
                max-width:180px;
                max-height:180px;
                border-radius:10px;
                object-fit:cover;
              "
            >
          `;

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


// ======================================================
// SAVE WORK
// ======================================================

function saveWork() {

  const workDate =
    $("workDate");

  const operationSelect =
    $("operationSelect");

  const sizeSelect =
    $("sizeSelect");

  const cutSelect =
    $("cutSelect");

  const quantityInput =
    $("quantity");

  const piecePhoto =
    $("piecePhoto");


  if (
    !workDate ||
    !operationSelect ||
    !sizeSelect ||
    !cutSelect ||
    !quantityInput
  ) {

    alert(
      "Work form fields not found."
    );

    return;

  }


  const date =
    workDate.value;

  const operationIndex =
    operationSelect.value;

  const size =
    sizeSelect.value;

  const cut =
    cutSelect.value;

  const quantity =
    Number(quantityInput.value);


  if (!date) {

    alert(
      "Please select date."
    );

    return;

  }


  if (
    operationIndex === "" ||
    !operations[operationIndex]
  ) {

    alert(
      "Please select operation."
    );

    return;

  }


  if (!size) {

    alert(
      "Please select size."
    );

    return;

  }


  if (!cut) {

    alert(
      "Please select CUT."
    );

    return;

  }


  if (
    !quantity ||
    quantity <= 0
  ) {

    alert(
      "Please enter valid quantity."
    );

    return;

  }


  const operation =
    operations[operationIndex];


  const rate =
    Number(operation.rate);


  const earning =
    rate * quantity;


  let photoData = "";


  if (
    piecePhoto &&
    piecePhoto.files &&
    piecePhoto.files[0]
  ) {

    const file =
      piecePhoto.files[0];


    const reader =
      new FileReader();


    reader.onload =
      function (event) {

        addWorkEntry(
          date,
          operation,
          size,
          cut,
          quantity,
          earning,
          event.target.result
        );

      };


    reader.readAsDataURL(
      file
    );

    return;

  }


  addWorkEntry(
    date,
    operation,
    size,
    cut,
    quantity,
    earning,
    photoData
  );

}


// ======================================================
// ADD WORK ENTRY
// ======================================================

function addWorkEntry(
  date,
  operation,
  size,
  cut,
  quantity,
  earning,
  photo
) {

  const entry = {

    id:
      Date.now().toString(),

    date:
      date,

    operation:
      operation.name,

    rate:
      Number(operation.rate),

    size:
      size,

    cut:
      cut,

    quantity:
      Number(quantity),

    earning:
      Number(earning),

    photo:
      photo || "",

    createdAt:
      new Date().toISOString()

  };


  workHistory.push(
    entry
  );


  saveLocalData();


  alert(
    `Work saved successfully!\nEarning: ₹${earning.toFixed(2)}`
  );


  resetWorkForm();

  updateDashboard();

  updateEarnings();

  loadHistory();

  showSection(
    "dashboard"
  );

}


// ======================================================
// RESET WORK FORM
// ======================================================

function resetWorkForm() {

  const workDate =
    $("workDate");

  const operationSelect =
    $("operationSelect");

  const sizeSelect =
    $("sizeSelect");

  const cutSelect =
    $("cutSelect");

  const quantity =
    $("quantity");

  const piecePhoto =
    $("piecePhoto");

  const photoPreview =
    $("photoPreview");

  const previewEarning =
    $("previewEarning");

  const rateDisplay =
    $("rateDisplay");


  if (workDate) {

    workDate.value =
      getTodayDate();

  }


  if (operationSelect) {
    operationSelect.value = "";
  }


  if (sizeSelect) {
    sizeSelect.value = "";
  }


  if (cutSelect) {
    cutSelect.value = "";
  }


  if (quantity) {
    quantity.value = "";
  }


  if (piecePhoto) {
    piecePhoto.value = "";
  }


  if (photoPreview) {
    photoPreview.innerHTML = "";
  }


  if (previewEarning) {
    previewEarning.textContent =
      "₹0.00";
  }


  if (rateDisplay) {
    rateDisplay.textContent =
      "₹0.00";
  }

}


// ======================================================
// LOAD HISTORY
// ======================================================

function loadHistory() {

  const historyList =
    $("historyList");


  if (!historyList) return;


  historyList.innerHTML =
    "";


  if (
    workHistory.length === 0
  ) {

    historyList.innerHTML = `
      <div class="empty-state">
        No work history found.
      </div>
    `;

    return;

  }


  const sortedHistory =
    [...workHistory]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );


  sortedHistory.forEach(
    (entry) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "history-item";


      row.innerHTML = `
        <div>
          <strong>
            ${escapeHTML(entry.operation)}
          </strong>

          <div>
            Date: ${escapeHTML(entry.date)}
          </div>

          <div>
            Size: ${escapeHTML(entry.size)}
            |
            ${escapeHTML(entry.cut)}
          </div>

          <div>
            Quantity: ${entry.quantity}
          </div>

          <div>
            Rate: ₹${Number(
              entry.rate
            ).toFixed(2)}
          </div>
        </div>

        <div>
          <strong>
            ₹${Number(
              entry.earning
            ).toFixed(2)}
          </strong>

          ${
            entry.photo
              ? `
                <br>
                <button
                  onclick="viewPhoto('${entry.id}')"
                >
                  View Photo
                </button>
              `
              : ""
          }

          <br>

          <button
            onclick="deleteWork('${entry.id}')"
          >
            Delete
          </button>
        </div>
      `;


      historyList.appendChild(
        row
      );

    }
  );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value ?? "";


  return div.innerHTML;

}


// ======================================================
// VIEW PHOTO
// ======================================================

function viewPhoto(id) {

  const entry =
    workHistory.find(
      item =>
        item.id === id
    );


  if (
    !entry ||
    !entry.photo
  ) {

    alert(
      "Photo not found."
    );

    return;

  }


  const photoWindow =
    window.open(
      "",
      "_blank"
    );


  if (!photoWindow) {

    alert(
      "Please allow popups to view photo."
    );

    return;

  }


  photoWindow.document.write(`
    <!DOCTYPE html>

    <html>

    <head>

      <title>
        Piece Photo
      </title>

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1"
      >

    </head>

    <body
      style="
        margin:0;
        padding:20px;
        background:#111;
        display:flex;
        justify-content:center;
        align-items:center;
        min-height:100vh;
      "
    >

      <img
        src="${entry.photo}"
        style="
          max-width:95%;
          max-height:95vh;
          object-fit:contain;
          border-radius:10px;
        "
      >

    </body>

    </html>
  `);


  photoWindow.document.close();

}


// ======================================================
// DELETE WORK
// ======================================================

function deleteWork(id) {

  const confirmDelete =
    confirm(
      "Delete this work entry?"
    );


  if (!confirmDelete) return;


  workHistory =
    workHistory.filter(
      entry =>
        entry.id !== id
    );


  saveLocalData();


  loadHistory();

  updateDashboard();

  updateEarnings();

}


// ======================================================
// TODAY DATE
// ======================================================

function getTodayDate() {

  return new Date()
    .toISOString()
    .split("T")[0];

}


// ======================================================
// TODAY ENTRIES
// ======================================================

function getTodayEntries() {

  const today =
    getTodayDate();


  return workHistory.filter(
    entry =>
      entry.date === today
  );

}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

  const todayEarning =
    $("todayEarning");

  const todayPieces =
    $("todayPieces");

  const totalEntries =
    $("totalEntries");

  const todayWork =
    $("todayWork");


  const todayEntries =
    getTodayEntries();


  const earning =
    todayEntries.reduce(
      (total, entry) => {

        return (
          total +
          Number(
            entry.earning || 0
          )
        );

      },
      0
    );


  const pieces =
    todayEntries.reduce(
      (total, entry) => {

        return (
          total +
          Number(
            entry.quantity || 0
          )
        );

      },
      0
    );


  const entriesCount =
    todayEntries.length;


  if (todayEarning) {

    todayEarning.textContent =
      `₹${earning.toFixed(2)}`;

  }


  if (todayPieces) {

    todayPieces.textContent =
      pieces;

  }


  if (totalEntries) {

    totalEntries.textContent =
      entriesCount;

  }


  if (todayWork) {

    todayWork.innerHTML =
      "";


    if (
      todayEntries.length === 0
    ) {

      todayWork.innerHTML = `
        <div class="empty-state">
          No work added today.
        </div>
      `;

    } else {

      todayEntries
        .slice()
        .reverse()
        .forEach(
          (entry) => {

            const div =
              document.createElement(
                "div"
              );


            div.className =
              "today-work-item";


            div.innerHTML = `
              <div>

                <strong>
                  ${escapeHTML(
                    entry.operation
                  )}
                </strong>

                <div>
                  ${escapeHTML(
                    entry.size
                  )}

                  •

                  ${escapeHTML(
                    entry.cut
                  )}
                </div>

                <div>
                  Qty:
                  ${Number(
                    entry.quantity
                  )}
                </div>

              </div>

              <strong>
                ₹${Number(
                  entry.earning || 0
                ).toFixed(2)}
              </strong>
            `;


            todayWork.appendChild(
              div
            );

          }
        );

    }

  }

}


// ======================================================
// EARNINGS
// ======================================================

function updateEarnings() {

  const lifetimeEarning =
    $("lifetimeEarning");

  const lifetimePieces =
    $("lifetimePieces");

  const lifetimeEntries =
    $("lifetimeEntries");

  const dateWiseEarnings =
    $("dateWiseEarnings");


  const totalEarning =
    workHistory.reduce(
      (total, entry) =>
        total +
        Number(
          entry.earning || 0
        ),
      0
    );


  const totalPieces =
    workHistory.reduce(
      (total, entry) =>
        total +
        Number(
          entry.quantity || 0
        ),
      0
    );


  if (lifetimeEarning) {

    lifetimeEarning.textContent =
      `₹${totalEarning.toFixed(2)}`;

  }


  if (lifetimePieces) {

    lifetimePieces.textContent =
      totalPieces;

  }


  if (lifetimeEntries) {

    lifetimeEntries.textContent =
      workHistory.length;

  }


  if (!dateWiseEarnings) return;


  dateWiseEarnings.innerHTML =
    "";


  if (
    workHistory.length === 0
  ) {

    dateWiseEarnings.innerHTML = `
      <div class="empty-state">
        No earnings yet.
      </div>
    `;

    return;

  }


  const dateTotals = {};


  workHistory.forEach(
    (entry) => {

      if (!dateTotals[entry.date]) {

        dateTotals[entry.date] = {
          earning: 0,
          pieces: 0,
          entries: 0
        };

      }


      dateTotals[entry.date].earning +=
        Number(
          entry.earning || 0
        );


      dateTotals[entry.date].pieces +=
        Number(
          entry.quantity || 0
        );


      dateTotals[entry.date].entries +=
        1;

    }
  );


  Object.keys(dateTotals)
    .sort()
    .reverse()
    .forEach(
      (date) => {

        const data =
          dateTotals[date];


        const row =
          document.createElement(
            "div"
          );


        row.className =
          "date-earning-card";


        row.innerHTML = `
          <div class="date-earning-info">

            <h4>
              ${escapeHTML(date)}
            </h4>

            <p>
              ${data.pieces}
              pieces •
              ${data.entries}
              entries
            </p>

          </div>

          <div class="date-earning-amount">
            ₹${data.earning.toFixed(2)}
          </div>
        `;


        dateWiseEarnings.appendChild(
          row
        );

      }
    );

}


// ======================================================
// ADMIN - LOAD OPERATIONS
// ======================================================

function loadAdminOperations() {

  const operationList =
    $("operationList");


  if (!operationList) return;


  operationList.innerHTML =
    "";


  operations.forEach(
    (operation, index) => {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "operation-admin-row";


      row.innerHTML = `
        <div>

          <strong>
            ${escapeHTML(
              operation.name
            )}
          </strong>

          <span>
            ₹${Number(
              operation.rate
            ).toFixed(2)}
          </span>

        </div>

        <div>

          <button
            onclick="editOperation(${index})"
          >
            Edit
          </button>

          <button
            onclick="deleteOperation(${index})"
          >
            Delete
          </button>

        </div>
      `;


      operationList.appendChild(
        row
      );

    }
  );

}


// ======================================================
// ADMIN - ADD OPERATION
// ======================================================

function addOperation() {

  const nameInput =
    $("newOperation");

  const rateInput =
    $("newRate");


  if (
    !nameInput ||
    !rateInput
  ) {

    alert(
      "Admin fields not found."
    );

    return;

  }


  const name =
    nameInput.value.trim();


  const rate =
    Number(
      rateInput.value
    );


  if (!name) {

    alert(
      "Please enter operation name."
    );

    return;

  }


  if (
    Number.isNaN(rate) ||
    rate < 0
  ) {

    alert(
      "Please enter valid rate."
    );

    return;

  }


  operations.push({
    name: name,
    rate: rate
  });


  saveLocalData();


  loadOperations();

  loadAdminOperations();


  nameInput.value =
    "";

  rateInput.value =
    "";


  alert(
    "Operation added successfully."
  );

}


// ======================================================
// ADMIN - EDIT OPERATION
// ======================================================

function editOperation(index) {

  if (!operations[index]) return;


  const current =
    operations[index];


  const newName =
    prompt(
      "Enter operation name:",
      current.name
    );


  if (newName === null) return;


  const newRate =
    prompt(
      "Enter rate:",
      current.rate
    );


  if (newRate === null) return;


  const rate =
    Number(
      newRate
    );


  if (
    !newName.trim() ||
    Number.isNaN(rate) ||
    rate < 0
  ) {

    alert(
      "Invalid operation details."
    );

    return;

  }


  operations[index] = {

    name:
      newName.trim(),

    rate:
      rate

  };


  saveLocalData();


  loadOperations();

  loadAdminOperations();


  alert(
    "Operation updated successfully."
  );

}


// ======================================================
// ADMIN - DELETE OPERATION
// ======================================================

function deleteOperation(index) {

  if (!operations[index]) return;


  const confirmDelete =
    confirm(
      `Delete "${operations[index].name}"?`
    );


  if (!confirmDelete) return;


  operations.splice(
    index,
    1
  );


  saveLocalData();


  loadOperations();

  loadAdminOperations();

}


// ======================================================
// SET DEFAULT DATE
// ======================================================

function setDefaultDate() {

  const workDate =
    $("workDate");


  if (!workDate) return;


  if (!workDate.value) {

    workDate.value =
      getTodayDate();

  }

}


// ======================================================
// RAZORPAY PREMIUM SUBSCRIPTION
// ======================================================

async function continuePremium() {

  const user =
    auth.currentUser;


  if (!user) {

    alert(
      "Please login first."
    );

    return;

  }


  try {

    // Call Vercel backend

    const response =
      await fetch(
        "/api/create-subscription",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            userId:
              user.uid,

            email:
              user.email,

            name:
              user.displayName ||
              "WorkerPay User"

          })
        }
      );


    const data =
      await response.json();


    if (
      !response.ok ||
      !data.subscriptionId
    ) {

      console.error(
        "Subscription error:",
        data
      );


      alert(
        "Unable to start Premium. Please try again."
      );

      return;

    }


    // Razorpay Checkout

    const options = {

      key:
        "rzp_live_TYkJpDlsipwl5D",

      subscription_id:
        data.subscriptionId,

      name:
        "WorkerPay",

      description:
        "WorkerPay Premium - ₹20/month",

      prefill: {

        name:
          user.displayName || "",

        email:
          user.email || ""

      },

      theme: {

        color:
          "#111827"

      },


      handler:
        async function (
          response
        ) {

          console.log(
            "Razorpay payment response:",
            response
          );


          alert(
            "Payment successful! Premium activation will be completed."
          );


          // Local UI update after successful payment
          // Actual payment verification should happen on backend.

          await refreshTrialUI();

        },


      modal: {

        ondismiss:
          function () {

            console.log(
              "Razorpay checkout closed."
            );

          }

      }

    };


    if (
      typeof Razorpay ===
      "undefined"
    ) {

      alert(
        "Razorpay Checkout could not load. Please refresh the page."
      );

      return;

    }


    const rzp =
      new Razorpay(
        options
      );


    rzp.open();


  } catch (error) {

    console.error(
      "Premium error:",
      error
    );


    alert(
      "Something went wrong. Please try again."
    );

  }

}


// ======================================================
// UPDATE TRIAL BANNER
// ======================================================

function updateTrialBanner(
  userData
) {

  const banner =
    $("trialBanner");

  const title =
    $("trialTitle");

  const message =
    $("trialMessage");

  const dayText =
    $("trialDay");


  if (
    !banner ||
    !userData
  ) {
    return;
  }


  // Premium user

  if (
    userData.subscriptionStatus ===
    "premium"
  ) {

    banner.style.display =
      "none";

    return;

  }


  // Missing trial dates

  if (
    !userData.trialStart ||
    !userData.trialEnd
  ) {

    banner.style.display =
      "none";

    return;

  }


  const trialStart =
    convertFirestoreDate(
      userData.trialStart
    );


  const trialEnd =
    convertFirestoreDate(
      userData.trialEnd
    );


  if (
    !trialStart ||
    !trialEnd
  ) {

    banner.style.display =
      "none";

    return;

  }


  const now =
    new Date();


  // Trial expired

  if (
    now >= trialEnd
  ) {

    if (title) {

      title.textContent =
        "⏰ Free Trial Ended";

    }


    if (message) {

      message.textContent =
        "Tumhara 3-day Free Trial khatam ho gaya hai.";

    }


    if (dayText) {

      dayText.textContent =
        "Premium ₹20/month se continue karo";

    }


    banner.style.display =
      "block";


    return;

  }


  // Calculate current day

  const difference =
    now.getTime() -
    trialStart.getTime();


  let currentDay =
    Math.floor(
      difference /
      (1000 * 60 * 60 * 24)
    ) + 1;


  currentDay =
    Math.max(
      1,
      Math.min(
        currentDay,
        3
      )
    );


  let ordinal;


  if (
    currentDay === 1
  ) {

    ordinal = "1st";

  } else if (
    currentDay === 2
  ) {

    ordinal = "2nd";

  } else {

    ordinal = "3rd";

  }


  if (title) {

    title.textContent =
      "🎉 Your Free Trial Started";

  }


  if (message) {

    message.textContent =
      `Aaj tumhara Free Trial ka ${ordinal} day hai`;

  }


  if (dayText) {

    dayText.textContent =
      `Free Trial: Day ${currentDay} / 3`;

  }


  banner.style.display =
    "block";

}


// ======================================================
// UPDATE TRIAL CARD
// ======================================================

function updateTrialCard(
  userData
) {

  const card =
    $("trialCard");

  const icon =
    $("trialIcon");

  const title =
    $("trialCardTitle");

  const message =
    $("trialCardMessage");

  const progress =
    $("trialProgress");

  const next =
    $("trialNext");

  const premiumButton =
    $("premiumButton");


  if (
    !card ||
    !userData
  ) {
    return;
  }


  // Premium user

  if (
    userData.subscriptionStatus ===
    "premium"
  ) {

    card.style.display =
      "none";

    return;

  }


  // Missing trial dates

  if (
    !userData.trialStart ||
    !userData.trialEnd
  ) {

    card.style.display =
      "none";

    return;

  }


  const trialStart =
    convertFirestoreDate(
      userData.trialStart
    );


  const trialEnd =
    convertFirestoreDate(
      userData.trialEnd
    );


  if (
    !trialStart ||
    !trialEnd
  ) {

    card.style.display =
      "none";

    return;

  }


  const now =
    new Date();


  // ================= EXPIRED =================

  if (
    now >= trialEnd
  ) {

    if (icon) {
      icon.textContent = "⏰";
    }


    if (title) {

      title.textContent =
        "Free Trial Ended";

    }


    if (message) {

      message.textContent =
        "Tumhara 3-day Free Trial khatam ho gaya hai.";

    }


    if (progress) {

      progress.textContent =
        "Free Trial: Expired";

    }


    if (next) {

      next.textContent =
        "Premium ₹20/month se continue karo";

    }


    if (premiumButton) {

      premiumButton.textContent =
        "Premium ₹20/month";

    }


    card.style.display =
      "flex";


    return;

  }


  // ================= ACTIVE TRIAL =================

  const difference =
    now.getTime() -
    trialStart.getTime();


  let currentDay =
    Math.floor(
      difference /
      (1000 * 60 * 60 * 24)
    ) + 1;


  currentDay =
    Math.max(
      1,
      Math.min(
        currentDay,
        3
      )
    );


  let ordinal;


  if (
    currentDay === 1
  ) {

    ordinal = "1st";

  } else if (
    currentDay === 2
  ) {

    ordinal = "2nd";

  } else {

    ordinal = "3rd";

  }


  if (icon) {

    icon.textContent =
      currentDay === 3
        ? "🔥"
        : "🎉";

  }


  if (title) {

    title.textContent =
      "Your Free Trial Started";

  }


  if (message) {

    message.textContent =
      `Aaj tumhara Free Trial ka ${ordinal} day hai.`;

  }


  if (progress) {

    progress.textContent =
      `Free Trial: Day ${currentDay} / 3`;

  }


  if (next) {

    next.textContent =
      "Next: Premium ₹20/month";

  }


  if (premiumButton) {

    premiumButton.textContent =
      "₹20 / month";

  }


  card.style.display =
    "flex";

}


// ======================================================
// CONVERT FIRESTORE DATE
// ======================================================

function convertFirestoreDate(
  value
) {

  if (!value) {
    return null;
  }


  try {

    // Firestore Timestamp

    if (
      typeof value.toDate ===
      "function"
    ) {

      return value.toDate();

    }


    // JavaScript Date

    if (
      value instanceof Date
    ) {

      return value;

    }


    // Firestore timestamp-like object

    if (
      value.seconds !==
      undefined
    ) {

      return new Date(
        Number(value.seconds) *
        1000
      );

    }


    // String / number

    const date =
      new Date(value);


    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return date;

    }


    return null;

  } catch (error) {

    console.error(
      "Date conversion error:",
      error
    );

    return null;

  }

}


// ======================================================
// HIDE TRIAL UI
// ======================================================

function hideTrialUI() {

  const banner =
    $("trialBanner");

  const card =
    $("trialCard");


  if (banner) {

    banner.style.display =
      "none";

  }


  if (card) {

    card.style.display =
      "none";

  }

}


// ======================================================
// REFRESH TRIAL UI
// ======================================================

async function refreshTrialUI() {

  const user =
    auth.currentUser;


  if (!user) {

    hideTrialUI();

    return;

  }


  const userData =
    await getCurrentUserData(
      user
    );


  if (userData) {

    updateTrialBanner(
      userData
    );

    updateTrialCard(
      userData
    );

  }

}


// ======================================================
// INITIAL SETUP
// ======================================================

loadLocalData();

setDefaultDate();


// ======================================================
// WINDOW FUNCTIONS
// Required because index.html uses onclick="..."
// ======================================================

window.loginUser =
  loginUser;

window.signupUser =
  signupUser;

window.showLogin =
  showLogin;

window.showSignup =
  showSignup;

window.showForgotPassword =
  showForgotPassword;

window.resetPassword =
  resetPassword;

window.logout =
  logout;

window.showSection =
  showSection;

window.calculatePreview =
  calculatePreview;

window.saveWork =
  saveWork;

window.deleteWork =
  deleteWork;

window.viewPhoto =
  viewPhoto;

window.addOperation =
  addOperation;

window.editOperation =
  editOperation;

window.deleteOperation =
  deleteOperation;

window.continuePremium =
  continuePremium;


// ======================================================
// EVENT LISTENERS
// ======================================================

const operationSelectElement =
  $("operationSelect");


if (operationSelectElement) {

  operationSelectElement.addEventListener(
    "change",
    calculatePreview
  );

}


const quantityElement =
  $("quantity");


if (quantityElement) {

  quantityElement.addEventListener(
    "input",
    calculatePreview
  );

}


// ======================================================
// START
// ======================================================

console.log(
  "WorkerPay script.js loaded successfully."
);

console.log(
  "Operations loaded:",
  operations
);