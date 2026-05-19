import app from "./firebase.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);

// Protected route checker
onAuthStateChanged(auth, (user) => {

  if (!user) {
    // NOT LOGGED IN → FORCE LOGIN
    window.location.replace("login.html");
  }

});