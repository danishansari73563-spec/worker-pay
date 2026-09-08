// ======================================================
// WORKERPAY - COMPLETE script.js
// Firebase Auth + Firestore
// Add Work + History + Delete Work
// 3-Day Free Trial
// Premium ₹20/month - Razorpay
// Trial/Premium UI ONLY ON DASHBOARD
// ======================================================


// ======================================================
// FIREBASE IMPORTS
// ======================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    deleteDoc,
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ======================================================
// FIREBASE CONFIG
// ======================================================

const firebaseConfig = {
    apiKey: "AIzaSyDT5PdWyAyqrfGtEh9kYyeHvFA3DQ7QDsA",
    authDomain: "worker-pay.firebaseapp.com",
    projectId: "worker-pay",
    storageBucket: "worker-pay.firebasestorage.app",
    messagingSenderId: "145618936395",
    appId: "1:145618936395:web:310a3e79e52b9b733763ce"
};


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

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
        rate: 6.00
    },
    {
        name: "Cup Making",
        rate: 3.00
    },
    {
        name: "Bottom",
        rate: 3.00
    },
    {
        name: "Sleeve Patti",
        rate: 5.00
    },
    {
        name: "Sleeve Attach",
        rate: 5.00
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
// LOCAL DATA LOAD
// ======================================================

function loadLocalData() {

    try {

        const savedOperations =
            localStorage.getItem("workerpay_operations");

        if (savedOperations) {

            const parsed =
                JSON.parse(savedOperations);

            if (
                Array.isArray(parsed) &&
                parsed.length > 0
            ) {

                operations = parsed;

            }

        }

    } catch (error) {

        console.error(
            "Operations load error:",
            error
        );

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

        console.error(
            "History load error:",
            error
        );

    }

}


// ======================================================
// LOCAL DATA SAVE
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

        console.error(
            "Local save error:",
            error
        );

    }

}


// ======================================================
// APP VISIBILITY
// ======================================================

function setAppVisibility(loggedIn) {

    const authScreen = $("authScreen");

    const header =
        document.querySelector(".header");

    const main =
        document.querySelector("main");

    const bottomNav =
        document.querySelector(".bottom-nav");


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


    if (!loggedIn) {

        hideTrialUI();

    }

}


// ======================================================
// LOGIN SCREEN
// ======================================================

function showLogin() {

    const loginBox = $("loginBox");

    const signupBox = $("signupBox");

    const forgotBox = $("forgotBox");


    if (loginBox)
        loginBox.style.display = "block";


    if (signupBox)
        signupBox.style.display = "none";


    if (forgotBox)
        forgotBox.style.display = "none";

}


// ======================================================
// SIGNUP SCREEN
// ======================================================

function showSignup() {

    const loginBox = $("loginBox");

    const signupBox = $("signupBox");

    const forgotBox = $("forgotBox");


    if (loginBox)
        loginBox.style.display = "none";


    if (signupBox)
        signupBox.style.display = "block";


    if (forgotBox)
        forgotBox.style.display = "none";

}


// ======================================================
// FORGOT PASSWORD SCREEN
// ======================================================

function showForgotPassword() {

    const loginBox = $("loginBox");

    const signupBox = $("signupBox");

    const forgotBox = $("forgotBox");


    if (loginBox)
        loginBox.style.display = "none";


    if (signupBox)
        signupBox.style.display = "none";


    if (forgotBox)
        forgotBox.style.display = "block";

}


// ======================================================
// LOGIN
// ======================================================

async function loginUser() {

    const email =
        $("loginEmail")?.value.trim();

    const password =
        $("loginPassword")?.value;

    const message =
        $("loginMessage");


    if (!email || !password) {

        if (message) {

            message.textContent =
                "Please enter email and password.";

        }

        return;

    }


    try {

        if (message) {

            message.textContent =
                "Logging in...";

        }


        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        if (message) {

            message.textContent = "";

        }

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        if (message) {

            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message.textContent =
                    "Invalid email or password.";

            } else if (
                error.code ===
                "auth/user-not-found"
            ) {

                message.textContent =
                    "Account not found.";

            } else if (
                error.code ===
                "auth/wrong-password"
            ) {

                message.textContent =
                    "Wrong password.";

            } else {

                message.textContent =
                    error.message;

            }

        }

    }

}


// ======================================================
// SIGNUP
// ======================================================

async function signupUser() {

    const username =
        $("signupUsername")?.value.trim();

    const email =
        $("signupEmail")?.value.trim();

    const password =
        $("signupPassword")?.value;

    const confirmPassword =
        $("signupConfirmPassword")?.value;

    const message =
        $("signupMessage");


    if (
        !username ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        if (message) {

            message.textContent =
                "Please fill all fields.";

        }

        return;

    }


    if (password.length < 6) {

        if (message) {

            message.textContent =
                "Password must be at least 6 characters.";

        }

        return;

    }


    if (password !== confirmPassword) {

        if (message) {

            message.textContent =
                "Passwords do not match.";

        }

        return;

    }


    try {

        if (message) {

            message.textContent =
                "Creating account...";

        }


        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        await updateProfile(
            user,
            {
                displayName: username
            }
        );


        // ==================================================
        // 3 DAY FREE TRIAL
        // ==================================================

        const trialStart =
            new Date();


        const trialEnd =
            new Date(trialStart);


        trialEnd.setDate(
            trialEnd.getDate() + 3
        );


        // ==================================================
        // CREATE USER DOCUMENT
        // ==================================================

        await setDoc(
            doc(
                db,
                "users",
                user.uid
            ),
            {

                uid:
                    user.uid,

                username:
                    username,

                email:
                    email,

                createdAt:
                    serverTimestamp(),

                trialStart:
                    trialStart,

                trialEnd:
                    trialEnd,

                subscriptionStatus:
                    "trial"

            }
        );


        if (message) {

            message.textContent =
                `Welcome, ${username}!`;

        }

    } catch (error) {

        console.error(
            "Signup error:",
            error
        );


        if (message) {

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                message.textContent =
                    "This email is already registered.";

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message.textContent =
                    "Please enter a valid email.";

            } else if (
                error.code ===
                "auth/weak-password"
            ) {

                message.textContent =
                    "Password is too weak.";

            } else {

                message.textContent =
                    error.message;

            }

        }

    }

}


// ======================================================
// FORGOT PASSWORD
// ======================================================

async function resetPassword() {

    const email =
        $("forgotEmail")?.value.trim();

    const message =
        $("forgotMessage");


    if (!email) {

        if (message) {

            message.textContent =
                "Please enter your email.";

        }

        return;

    }


    try {

        await sendPasswordResetEmail(
            auth,
            email
        );


        if (message) {

            message.textContent =
                "Password reset email sent. Check your inbox.";

        }

    } catch (error) {

        console.error(
            "Password reset error:",
            error
        );


        if (message) {

            message.textContent =
                error.message;

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
// GET USER DATA
// ======================================================

async function getCurrentUserData(user) {

    if (!user)
        return null;


    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const snapshot =
            await getDoc(userRef);


        if (snapshot.exists()) {

            return snapshot.data();

        }


        return null;

    } catch (error) {

        console.error(
            "User data error:",
            error
        );

        return null;

    }

}


// ======================================================
// USERNAME
// ======================================================

async function updateLoggedInUsername(user) {

    const usernameElement =
        $("loggedInUsername");


    if (!usernameElement)
        return;


    let username =
        user.displayName || "User";


    try {

        const userData =
            await getCurrentUserData(user);


        if (
            userData &&
            userData.username
        ) {

            username =
                userData.username;

        }

    } catch (error) {

        console.error(error);

    }


    usernameElement.textContent =
        username;

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


            // FIRESTORE HISTORY
            await loadHistoryFromFirestore();


            loadOperations();

            setDefaultDate();

            updateDashboard();

            updateEarnings();

            loadAdminOperations();


            // IMPORTANT:
            // Dashboard is the only page
            // where Trial/Premium UI is shown.

            showSection("dashboard");


            const userData =
                await getCurrentUserData(user);


            if (userData) {

                updateTrialUIForSection(
                    "dashboard",
                    userData
                );

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
// NAVIGATION
// ======================================================

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".section"
        );


    sections.forEach(
        section => {

            section.style.display =
                "none";

        }
    );


    const selected =
        $(sectionId);


    if (selected) {

        selected.style.display =
            "block";

    }


    // ==================================================
    // NAV ACTIVE BUTTON
    // ==================================================

    const navItems =
        document.querySelectorAll(
            ".bottom-nav button"
        );


    navItems.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    navItems.forEach(
        button => {

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


    // ==================================================
    // TRIAL / PREMIUM UI
    // ONLY DASHBOARD
    // ==================================================

    if (sectionId === "dashboard") {

        refreshTrialUI();

    } else {

        // Hide Trial/Premium immediately
        // on every other page.

        hideTrialUI();

    }


    // ==================================================
    // SECTION ACTIONS
    // ==================================================

    if (
        sectionId === "addWork" ||
        sectionId === "add-work"
    ) {

        setDefaultDate();

    }


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
// LOAD OPERATIONS
// ======================================================

function loadOperations() {

    const select =
        $("operationSelect");


    if (!select)
        return;


    select.innerHTML =
        `<option value="">Select Operation</option>`;


    operations.forEach(
        (operation, index) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                index;


            option.textContent =
                `${operation.name} - ₹${Number(
                    operation.rate
                ).toFixed(2)}`;


            select.appendChild(
                option
            );

        }
    );


    updateRateDisplay();

}


// ======================================================
// RATE DISPLAY
// ======================================================

function updateRateDisplay() {

    const select =
        $("operationSelect");

    const display =
        $("rateDisplay");


    if (!select || !display)
        return;


    const index =
        select.value;


    if (
        index === "" ||
        !operations[index]
    ) {

        display.textContent =
            "₹0.00";

        return;

    }


    display.textContent =
        `₹${Number(
            operations[index].rate
        ).toFixed(2)}`;

}


// ======================================================
// CALCULATE PREVIEW
// ======================================================

function calculatePreview() {

    updateRateDisplay();


    const select =
        $("operationSelect");

    const quantityInput =
        $("quantity");

    const preview =
        $("previewEarning");


    if (
        !select ||
        !quantityInput ||
        !preview
    )
        return;


    const index =
        select.value;


    const quantity =
        Number(
            quantityInput.value
        );


    if (
        index === "" ||
        !operations[index] ||
        quantity <= 0
    ) {

        preview.textContent =
            "₹0.00";

        return;

    }


    const rate =
        Number(
            operations[index].rate
        );


    const earning =
        rate * quantity;


    preview.textContent =
        `₹${earning.toFixed(2)}`;

}


// ======================================================
// PHOTO PREVIEW
// ======================================================

function setupPhotoPreview() {

    const piecePhoto =
        $("piecePhoto");

    const photoPreview =
        $("photoPreview");


    if (
        !piecePhoto ||
        !photoPreview
    )
        return;


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

                    photoPreview.innerHTML =
                        `
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


            reader.readAsDataURL(file);

        }
    );

}


// ======================================================
// SAVE WORK
// ======================================================

async function saveWork() {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Please login first."
        );

        return;

    }


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
        Number(
            quantityInput.value
        );


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
        Number(
            operation.rate
        );


    const earning =
        rate * quantity;


    // ==================================================
    // PHOTO HANDLING
    // ==================================================

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
            async function (event) {

                await addWorkEntry(
                    date,
                    operation,
                    size,
                    cut,
                    quantity,
                    earning,
                    event.target.result
                );

            };


        reader.readAsDataURL(file);

    } else {

        await addWorkEntry(
            date,
            operation,
            size,
            cut,
            quantity,
            earning,
            ""
        );

    }

}


// ======================================================
// ADD WORK ENTRY - FIRESTORE
// ======================================================

async function addWorkEntry(
    date,
    operation,
    size,
    cut,
    quantity,
    earning,
    photo
) {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Please login first."
        );

        return;

    }


    try {

        console.log(
            "Saving work to Firestore..."
        );

        console.log(
            "User UID:",
            user.uid
        );


        // ==================================================
        // WORK DATA
        // ==================================================

        const workData = {

            date:
                date,

            operation:
                operation.name,

            rate:
                Number(
                    operation.rate
                ),

            size:
                size,

            cut:
                cut,

            quantity:
                Number(
                    quantity
                ),

            earning:
                Number(
                    earning
                ),

            photo:
                photo || "",

            createdAt:
                serverTimestamp()

        };


        // ==================================================
        // FIRESTORE PATH
        // users
        //   └── USER UID
        //       └── workHistory
        // ==================================================

        const workCollection =
            collection(
                db,
                "users",
                user.uid,
                "workHistory"
            );


        // ==================================================
        // SAVE
        // ==================================================

        const workRef =
            await addDoc(
                workCollection,
                workData
            );


        console.log(
            "WORK SAVED SUCCESSFULLY:",
            workRef.id
        );


        // ==================================================
        // LOCAL COPY
        // ==================================================

        workHistory.push({

            id:
                workRef.id,

            date:
                date,

            operation:
                operation.name,

            rate:
                Number(
                    operation.rate
                ),

            size:
                size,

            cut:
                cut,

            quantity:
                Number(
                    quantity
                ),

            earning:
                Number(
                    earning
                ),

            photo:
                photo || "",

            createdAt:
                new Date().toISOString()

        });


        saveLocalData();


        alert(
            `Work saved successfully!\nEarning: ₹${Number(
                earning
            ).toFixed(2)}`
        );


        resetWorkForm();


        await loadHistoryFromFirestore();


        updateDashboard();

        updateEarnings();


        showSection(
            "dashboard"
        );


    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "FIRESTORE SAVE ERROR"
        );

        console.error(
            "Error code:",
            error.code
        );

        console.error(
            "Error message:",
            error.message
        );

        console.error(
            "Full error:",
            error
        );

        console.error(
            "================================"
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            alert(
                "Firestore permission denied.\n\nFirestore Rules me users/{userId}/workHistory ka write allow karo."
            );

        } else if (
            error.code ===
            "unavailable"
        ) {

            alert(
                "Firestore unavailable.\nInternet connection check karo."
            );

        } else {

            alert(
                "Work save nahi hua.\n\nError: " +
                error.message
            );

        }

    }

}


// ======================================================
// LOAD HISTORY FROM FIRESTORE
// ======================================================

async function loadHistoryFromFirestore() {

    const user =
        auth.currentUser;


    if (!user)
        return;


    try {

        const historyRef =
            collection(
                db,
                "users",
                user.uid,
                "workHistory"
            );


        let snapshot;


        try {

            const historyQuery =
                query(
                    historyRef,
                    orderBy(
                        "createdAt",
                        "desc"
                    )
                );


            snapshot =
                await getDocs(
                    historyQuery
                );

        } catch (queryError) {

            console.warn(
                "Ordered query failed. Loading without order.",
                queryError
            );


            snapshot =
                await getDocs(
                    historyRef
                );

        }


        workHistory = [];


        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                let createdAt =
                    new Date().toISOString();


                if (
                    data.createdAt &&
                    typeof data.createdAt.toDate ===
                    "function"
                ) {

                    createdAt =
                        data.createdAt
                            .toDate()
                            .toISOString();

                }


                workHistory.push({

                    id:
                        documentSnapshot.id,

                    date:
                        data.date || "",

                    operation:
                        data.operation || "",

                    rate:
                        Number(
                            data.rate || 0
                        ),

                    size:
                        data.size || "",

                    cut:
                        data.cut || "",

                    quantity:
                        Number(
                            data.quantity || 0
                        ),

                    earning:
                        Number(
                            data.earning || 0
                        ),

                    photo:
                        data.photo || "",

                    createdAt:
                        createdAt

                });

            }
        );


        saveLocalData();


        loadHistory();

        updateDashboard();

        updateEarnings();


        console.log(
            "Firestore history loaded:",
            workHistory.length
        );


    } catch (error) {

        console.error(
            "Load Firestore history error:",
            error
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            console.error(
                "Firestore READ permission denied."
            );

        }

    }

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


    if (workDate)

        workDate.value =
            getTodayDate();


    if (operationSelect)

        operationSelect.value =
            "";


    if (sizeSelect)

        sizeSelect.value =
            "";


    if (cutSelect)

        cutSelect.value =
            "";


    if (quantity)

        quantity.value =
            "";


    if (piecePhoto)

        piecePhoto.value =
            "";


    if (photoPreview)

        photoPreview.innerHTML =
            "";


    if (previewEarning)

        previewEarning.textContent =
            "₹0.00";


    if (rateDisplay)

        rateDisplay.textContent =
            "₹0.00";

}


// ======================================================
// LOAD HISTORY UI
// ======================================================

function loadHistory() {

    const historyList =
        $("historyList");


    if (!historyList)
        return;


    historyList.innerHTML =
        "";


    if (
        workHistory.length === 0
    ) {

        historyList.innerHTML =
            `
            <div class="empty-state">
                No work history found.
            </div>
            `;

        return;

    }


    const sortedHistory =
        [...workHistory].sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt || 0
                    ).getTime();


                const dateB =
                    new Date(
                        b.createdAt || 0
                    ).getTime();


                return dateB - dateA;

            }
        );


    sortedHistory.forEach(
        entry => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-item";


            const safeId =
                encodeURIComponent(
                    entry.id
                );


            row.innerHTML =
                `
                <div>

                    <strong>
                        ${escapeHTML(
                            entry.operation
                        )}
                    </strong>

                    <div>
                        Date:
                        ${escapeHTML(
                            formatDisplayDate(
                                entry.date
                            )
                        )}
                    </div>

                    <div>
                        Size:
                        ${escapeHTML(
                            entry.size
                        )}
                        |
                        ${escapeHTML(
                            entry.cut
                        )}
                    </div>

                    <div>
                        Quantity:
                        ${Number(
                            entry.quantity
                        )}
                    </div>

                    <div>
                        Rate:
                        ₹${Number(
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
                            ?
                            `
                            <br>

                            <button
                                onclick="viewPhoto(decodeURIComponent('${safeId}'))"
                            >
                                View Photo
                            </button>
                            `
                            :
                            ""
                    }

                    <br>

                    <button
                        onclick="deleteWork(decodeURIComponent('${safeId}'))"
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


    photoWindow.document.write(
        `
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
        `
    );


    photoWindow.document.close();

}


// ======================================================
// DELETE WORK - FIRESTORE
// ======================================================

async function deleteWork(id) {

    const user =
        auth.currentUser;


    if (!user) {

        alert(
            "Please login first."
        );

        return;

    }


    const confirmDelete =
        confirm(
            "Delete this work entry?"
        );


    if (!confirmDelete)
        return;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                user.uid,
                "workHistory",
                id
            )
        );


        workHistory =
            workHistory.filter(
                entry =>
                    entry.id !== id
            );


        saveLocalData();


        loadHistory();

        updateDashboard();

        updateEarnings();


        alert(
            "Work deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete work error:",
            error
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            alert(
                "Delete permission denied.\nFirestore Rules check karo."
            );

        } else {

            alert(
                "Work delete nahi hua.\n" +
                error.message
            );

        }

    }

}


// ======================================================
// TODAY DATE
// ======================================================

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


// ======================================================
// DISPLAY DATE
// DD/MM/YYYY
// ======================================================

function formatDisplayDate(
    dateString
) {

    if (!dateString)
        return "";


    const parts =
        dateString.split("-");


    if (parts.length !== 3)
        return dateString;


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

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
            (total, entry) =>
                total +
                Number(
                    entry.earning || 0
                ),
            0
        );


    const pieces =
        todayEntries.reduce(
            (total, entry) =>
                total +
                Number(
                    entry.quantity || 0
                ),
            0
        );


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
            todayEntries.length;

    }


    if (!todayWork)
        return;


    todayWork.innerHTML =
        "";


    if (
        todayEntries.length === 0
    ) {

        todayWork.innerHTML =
            `
            <div class="empty-state">
                No work added today.
            </div>
            `;

        return;

    }


    [...todayEntries]
        .reverse()
        .forEach(
            entry => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "today-work-item";


                div.innerHTML =
                    `
                    <div>

                        <strong>
                            ${escapeHTML(
                                entry.operation
                            )}
                        </strong>

                        <div>
                            Date:
                            ${escapeHTML(
                                formatDisplayDate(
                                    entry.date
                                )
                            )}
                        </div>

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


    if (!dateWiseEarnings)
        return;


    dateWiseEarnings.innerHTML =
        "";


    if (
        workHistory.length === 0
    ) {

        dateWiseEarnings.innerHTML =
            `
            <div class="empty-state">
                No earnings yet.
            </div>
            `;

        return;

    }


    const dateTotals = {};


    workHistory.forEach(
        entry => {

            if (
                !dateTotals[
                    entry.date
                ]
            ) {

                dateTotals[
                    entry.date
                ] = {

                    earning: 0,

                    pieces: 0,

                    entries: 0

                };

            }


            dateTotals[
                entry.date
            ].earning +=
                Number(
                    entry.earning || 0
                );


            dateTotals[
                entry.date
            ].pieces +=
                Number(
                    entry.quantity || 0
                );


            dateTotals[
                entry.date
            ].entries += 1;

        }
    );


    Object.keys(dateTotals)
        .sort()
        .reverse()
        .forEach(
            date => {

                const data =
                    dateTotals[date];


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "date-earning-card";


                row.innerHTML =
                    `
                    <div class="date-earning-info">

                        <h4>
                            ${escapeHTML(
                                formatDisplayDate(
                                    date
                                )
                            )}
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
// ADMIN OPERATIONS
// ======================================================

function loadAdminOperations() {

    const operationList =
        $("operationList");


    if (!operationList)
        return;


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


            row.innerHTML =
                `
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
// ADD OPERATION
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

        name:
            name,

        rate:
            rate

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
// EDIT OPERATION
// ======================================================

function editOperation(index) {

    if (!operations[index])
        return;


    const current =
        operations[index];


    const newName =
        prompt(
            "Enter operation name:",
            current.name
        );


    if (newName === null)
        return;


    const newRate =
        prompt(
            "Enter rate:",
            current.rate
        );


    if (newRate === null)
        return;


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
// DELETE OPERATION
// ======================================================

function deleteOperation(index) {

    if (!operations[index])
        return;


    const confirmDelete =
        confirm(
            `Delete "${operations[index].name}"?`
        );


    if (!confirmDelete)
        return;


    operations.splice(
        index,
        1
    );


    saveLocalData();


    loadOperations();

    loadAdminOperations();

}


// ======================================================
// DEFAULT DATE
// ======================================================

function setDefaultDate() {

    const workDate =
        $("workDate");


    if (!workDate)
        return;


    workDate.value =
        getTodayDate();

}


// ======================================================
// RAZORPAY PREMIUM
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

        const response =
            await fetch(
                "/api/create-subscription",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

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


        if (
            typeof Razorpay ===
            "undefined"
        ) {

            alert(
                "Razorpay Checkout could not load. Please refresh."
            );

            return;

        }


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
                async function (response) {

                    console.log(
                        "Razorpay response:",
                        response
                    );


                    alert(
                        "Payment successful! Premium activation is being processed..."
                    );


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


        const razorpay =
            new Razorpay(
                options
            );


        razorpay.open();


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
// TRIAL BANNER
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
    )
        return;


    if (
        userData.subscriptionStatus ===
        "premium"
    ) {

        banner.style.display =
            "none";

        return;

    }


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


    // ==================================================
    // EXPIRED
    // ==================================================

    if (
        now >= trialEnd
    ) {

        if (title)

            title.textContent =
                "⏰ Free Trial Ended";


        if (message)

            message.textContent =
                "Tumhara 3-day Free Trial khatam ho gaya hai.";


        if (dayText)

            dayText.textContent =
                "Premium ₹20/month se continue karo";


        banner.style.display =
            "block";


        return;

    }


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


    if (currentDay === 1) {

        ordinal =
            "1st";

    } else if (currentDay === 2) {

        ordinal =
            "2nd";

    } else {

        ordinal =
            "3rd";

    }


    if (title)

        title.textContent =
            "🎉 Your Free Trial Started";


    if (message)

        message.textContent =
            `Aaj tumhara Free Trial ka ${ordinal} day hai`;


    if (dayText)

        dayText.textContent =
            `Free Trial: Day ${currentDay} / 3`;


    banner.style.display =
        "block";

}


// ======================================================
// TRIAL CARD
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
    )
        return;


    // ==================================================
    // PREMIUM
    // ==================================================

    if (
        userData.subscriptionStatus ===
        "premium"
    ) {

        card.style.display =
            "none";

        return;

    }


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


    // ==================================================
    // EXPIRED
    // ==================================================

    if (
        now >= trialEnd
    ) {

        if (icon)

            icon.textContent =
                "⏰";


        if (title)

            title.textContent =
                "Free Trial Ended";


        if (message)

            message.textContent =
                "Tumhara 3-day Free Trial khatam ho gaya hai.";


        if (progress)

            progress.textContent =
                "Free Trial: Expired";


        if (next)

            next.textContent =
                "Premium ₹20/month se continue karo";


        if (premiumButton)

            premiumButton.textContent =
                "Premium ₹20/month";


        card.style.display =
            "flex";


        return;

    }


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


    if (currentDay === 1) {

        ordinal =
            "1st";

    } else if (currentDay === 2) {

        ordinal =
            "2nd";

    } else {

        ordinal =
            "3rd";

    }


    if (icon)

        icon.textContent =
            currentDay === 3
                ? "🔥"
                : "🎉";


    if (title)

        title.textContent =
            "Your Free Trial Started";


    if (message)

        message.textContent =
            `Aaj tumhara Free Trial ka ${ordinal} day hai.`;


    if (progress)

        progress.textContent =
            `Free Trial: Day ${currentDay} / 3`;


    if (next)

        next.textContent =
            "Next: Premium ₹20/month";


    if (premiumButton)

        premiumButton.textContent =
            "₹20 / month";


    card.style.display =
        "flex";

}


// ======================================================
// CONVERT FIRESTORE DATE
// ======================================================

function convertFirestoreDate(
    value
) {

    if (!value)
        return null;


    try {

        if (
            typeof value.toDate ===
            "function"
        ) {

            return value.toDate();

        }


        if (
            value instanceof Date
        ) {

            return value;

        }


        if (
            value.seconds !==
            undefined
        ) {

            return new Date(
                Number(
                    value.seconds
                ) * 1000
            );

        }


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
// UPDATE TRIAL UI BASED ON CURRENT SECTION
// ======================================================

async function updateTrialUIForSection(
    sectionId,
    userData = null
) {

    // ==================================================
    // VERY IMPORTANT
    // Trial/Premium UI only Dashboard
    // ==================================================

    if (
        sectionId !==
        "dashboard"
    ) {

        hideTrialUI();

        return;

    }


    const user =
        auth.currentUser;


    if (!user) {

        hideTrialUI();

        return;

    }


    if (!userData) {

        userData =
            await getCurrentUserData(
                user
            );

    }


    if (!userData) {

        hideTrialUI();

        return;

    }


    updateTrialBanner(
        userData
    );


    updateTrialCard(
        userData
    );

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


    // Only show if Dashboard is active.

    const dashboard =
        $("dashboard");


    if (
        !dashboard ||
        dashboard.style.display === "none"
    ) {

        hideTrialUI();

        return;

    }


    const userData =
        await getCurrentUserData(
            user
        );


    if (userData) {

        updateTrialUIForSection(
            "dashboard",
            userData
        );

    } else {

        hideTrialUI();

    }

}


// ======================================================
// GLOBAL WINDOW FUNCTIONS
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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const operationSelect =
            $("operationSelect");


        if (operationSelect) {

            operationSelect.addEventListener(
                "change",
                calculatePreview
            );

        }


        const quantity =
            $("quantity");


        if (quantity) {

            quantity.addEventListener(
                "input",
                calculatePreview
            );

        }


        setupPhotoPreview();


        loadLocalData();


        setDefaultDate();


        loadOperations();


        updateDashboard();


        updateEarnings();

    }
);


// ======================================================
// START
// ======================================================

console.log(
    "WorkerPay script.js loaded successfully."
);

console.log(
    "Today's local date:",
    getTodayDate()
);

console.log(
    "Operations:",
    operations
);