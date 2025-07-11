
window.InitializeFirebaseApp = function(_apiKey, _authDomain, _projectID, _storageBucket, _messagingSenderID, _appID, _measurementID){
  const firebaseConfig = {
    apiKey: _apiKey,
    authDomain: _authDomain,
    projectId: _projectID,
    storageBucket: _storageBucket,
    messagingSenderId: _measurementID,
    appId: _appID,
    measurementId: _measurementID
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
};
const db = firebase.firestore();
const auth = firebase.auth();

// Create a global utility to access Unity Instance
//let unityInstance = null;

function setUnityInstance(instance) {
  unityInstance = instance;
}