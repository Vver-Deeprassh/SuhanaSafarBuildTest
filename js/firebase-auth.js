// firebase-auth.js
window.FirebaseLoginWithEmailPassword = function(email, password, gameObject, successCallback, errorCallback) {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      unityInstance.SendMessage(gameObject, successCallback, JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || ""
      }));
    })
    .catch((error) => {
      unityInstance.SendMessage(gameObject, errorCallback, error.message);
    });
};

window.FirebaseRegisterWithEmailPassword = function(email, password, gameObject, successCallback, errorCallback) {
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      unityInstance.SendMessage(gameObject, successCallback, JSON.stringify({
        uid: user.uid,
        email: user.email
      }));
    })
    .catch((error) => {
      unityInstance.SendMessage(gameObject, errorCallback, error.message);
    });
};

window.FirebaseSignOut = function(gameObject, successCallback, errorCallback) {
  firebase.auth().signOut()
    .then(() => {
      unityInstance.SendMessage(gameObject, successCallback, 'User signed out');
    })
    .catch((error) => {
      unityInstance.SendMessage(gameObject, errorCallback, error.message);
    });
};

window.FirebaseGetCurrentUser = function(gameObject, callback) {
  const user = firebase.auth().currentUser;
  if (user) {
    unityInstance.SendMessage(gameObject, callback, JSON.stringify({
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || ""
    }));
  } else {
    unityInstance.SendMessage(gameObject, callback, 'null');
  }
};

window.FirebaseUpdateDisplayName = function(displayName, gameObject, successCallback, errorCallback) {
  const user = firebase.auth().currentUser;
  if (user) {
    // First check if the display name is already taken
    const usernamesRef = firebase.firestore().collection('usernames');
    
    usernamesRef.doc(displayName.toLowerCase()).get()
      .then((docSnapshot) => {
        if (docSnapshot.exists && docSnapshot.data().uid !== user.uid) {
          // Username already taken by someone else
          unityInstance.SendMessage(gameObject, errorCallback, "Username already taken");
        } else {
          // Update the profile
          user.updateProfile({
            displayName: displayName
          })
          .then(() => {
            // Update or create username document
            return usernamesRef.doc(displayName.toLowerCase()).set({
              uid: user.uid,
              displayName: displayName,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          })
          .then(() => {
            unityInstance.SendMessage(gameObject, successCallback, JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName
            }));
          })
          .catch((error) => {
            unityInstance.SendMessage(gameObject, errorCallback, error.message);
          });
        }
      })
      .catch((error) => {
        unityInstance.SendMessage(gameObject, errorCallback, error.message);
      });
  } else {
    unityInstance.SendMessage(gameObject, errorCallback, "No user is signed in");
  }
};

window.FirebaseCheckDisplayNameAvailability = function(displayName, gameObject, successCallback, errorCallback) {
  // We'll use Firestore to store and check usernames
  // Create a collection specifically for usernames
  const usernamesRef = firebase.firestore().collection('usernames');
  
  // Check if the username document exists
  usernamesRef.doc(displayName.toLowerCase()).get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        // Username already taken
        unityInstance.SendMessage(gameObject, errorCallback, "Username already taken");
      } else {
        // Username is available
        unityInstance.SendMessage(gameObject, successCallback, "Username available");
      }
    })
    .catch((error) => {
      unityInstance.SendMessage(gameObject, errorCallback, error.message);
    });
};

window.FirebaseRegisterWithEmailPasswordAndDisplayName = function(email, password, displayName, gameObject, successCallback, errorCallback) {
  console.log("Firebase available:", typeof firebase);
  console.log("Firebase auth available:", typeof firebase.auth);
  
  if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') {
    unityInstance.SendMessage(gameObject, errorCallback, "Firebase Auth not properly initialized");
    return;
  }

  // First validate password strength
  if (!isPasswordStrong(password)) {
    unityInstance.SendMessage(gameObject, errorCallback, "Password must contain at least one uppercase letter, one number, and one special character");
    return;
  }
  
  // Proceed with registration
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("signup");
      // Update the user's display name
      return user.updateProfile({
        displayName: displayName
      }).then(() => {
        // Return user data to Unity
        unityInstance.SendMessage(gameObject, successCallback, JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: displayName
        }));
      });
    })
    .catch((error) => {
      unityInstance.SendMessage(gameObject, errorCallback, error.message);
    });
};

window.FirebaseSendPasswordResetEmail = function(email, gameObject, successCallback, errorCallback) {
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      unityInstance.SendMessage(gameObject, successCallback, "Password reset email sent");
    })
    .catch((error) => {
      unityInstance.SendMessage(gameObject, errorCallback, error.message);
    });
};

// Helper function to check password strength
function isPasswordStrong(password) {
  // At least one uppercase letter
  const hasUpperCase = /[A-Z]/.test(password);
  // At least one digit
  const hasDigit = /\d/.test(password);
  // At least one special character
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return hasUpperCase && hasDigit && hasSpecial;
}

// Auth State Change Listener
firebase.auth().onAuthStateChanged((user) => {
  if (unityInstance) {
    if (user) {
      unityInstance.SendMessage("FirebaseManager", "OnAuthStateChanged", JSON.stringify({
        uid: user.uid,
        isLoggedIn: true,
        displayName: user.displayName || ""
      }));
    } else {
      unityInstance.SendMessage("FirebaseManager", "OnAuthStateChanged", JSON.stringify({
        isLoggedIn: false
      }));
    }
  }
});