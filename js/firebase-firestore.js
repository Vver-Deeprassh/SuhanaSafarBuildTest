// Firebase Firestore bridge to Unity
window.FirestoreAddDocument = function(collectionPath, documentId, jsonData, gameObject, successCallback, errorCallback) {
    const collection = collectionPath;
    const data = jsonData;
    const docId = documentId;
    
    firebase.firestore().collection(collection).doc(docId).set(JSON.parse(data))
      .then(function(docRef) {
        // Send success callback to Unity
        console.log(data);
        unityInstance.SendMessage(gameObject, successCallback, docRef.id);
      })
      .catch(function(error) {
        // Send error callback to Unity
        console.log("fail");
        unityInstance.SendMessage(gameObject, errorCallback, "Error adding document: " + error);
      });
  };

  window.FirestoreGetDocument = function(collectionPath, documentId, gameObject, successCallback, errorCallback) {
    const collection = collectionPath;
    const docId = documentId;
    
    firebase.firestore().collection(collection).doc(docId).get()
      .then(function(doc) {
        if (doc.exists) {
          const jsonData = JSON.stringify(doc.data());
          unityInstance.SendMessage(gameObject, successCallback, jsonData);
        } else {
          unityInstance.SendMessage(gameObject, successCallback, "Document not found");
        }
      })
      .catch(function(error) {
        unityInstance.SendMessage(gameObject, errorCallback, "Error getting document: " + error);
      });
  };

  window.FirestoreUpdateDocument = function(collectionPath, documentId, jsonData, gameObject, successCallback, errorCallback) {
    const collection = collectionPath;
    const docId = documentId;
    const data = JSON.parse(jsonData);
    
    firebase.firestore().collection(collection).doc(docId).update(data)
      .then(function() {
        unityInstance.SendMessage(gameObject, successCallback, "Document updated successfully");
      })
      .catch(function(error) {
        unityInstance.SendMessage(gameObject, errorCallback, "Error updating document: " + error);
      });
  };

  window.FirestoreDeleteDocument = function(collectionPath, documentId, gameObject, successCallback, errorCallback) {
    const collection = collectionPath;
    const docId = documentId;
    
    firebase.firestore().collection(collection).doc(docId).delete()
      .then(function() {
        unityInstance.SendMessage(gameObject, successCallback, "Document deleted successfully");
      })
      .catch(function(error) {
        unityInstance.SendMessage(gameObject, errorCallback, "Error deleting document: " + error);
      });
  };