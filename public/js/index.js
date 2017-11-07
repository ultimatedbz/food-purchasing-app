// Initialize Firebase
var config = {
	apiKey: "AIzaSyAwTa_qEqxmRyepOjGnHGBzqiQVfrCh3N8",
	authDomain: "food-purchasing-app.firebaseapp.com",
	databaseURL: "https://food-purchasing-app.firebaseio.com",
	projectId: "food-purchasing-app",
	storageBucket: "food-purchasing-app.appspot.com",
	messagingSenderId: "722992799348"
};
firebase.initializeApp(config);

var database = firebase.database();
var userId;

function createUser () {
  
  var email = document.getElementById("userName").value;
  var password = document.getElementById("userPassword").value;
	

  /* this will work after firebase email authntication is setup */
  firebase.auth().createUserWithEmailAndPassword(email, password)
		.then(function(result) {
		userId = firebase.auth().currentUser.uid;
		database.ref('users/' + userId + '/groups').push({groupName: "Favorites"});
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorCode + "\n" + errorMessage);
  });

}

function loginUser () {
  
  var email = document.getElementById("userName").value;
  var password = document.getElementById("userPassword").value;
  /* alert(email + " " + password); */

  /* this will work after firebase email authntication is setup */
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorCode + "\n" + errorMessage);
  });

}

function googleLogin () {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
		userId = firebase.auth().currentUser.uid;
		database.ref('users/' + userId + '/groups').push({groupName: "Favorites"});
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorCode + "\n" + errorMessage);
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
  /*
  firebase.auth().signInWithRedirect(provider);
  firebase.auth().getRedirectResult().then(function(result) {
    if (result.credential) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // ...
    }
    // The signed-in user info.
    var user = result.user;
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
    alert(errorCode + "\n" + errorMessage + "\n" + email);
  });
  */
}

//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
  if(user) {
    window.location = 'home.html'; //After successful login, user will be redirected to home.html
  }
});
