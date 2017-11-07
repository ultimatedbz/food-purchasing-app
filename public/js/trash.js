function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

// Initialize Firebase
var config = {
	apiKey: "AIzaSyCvpcrFfmF__RlMux8OBBe0a45-o1SZd84",
	authDomain: "cse134bhw5.firebaseapp.com",
	databaseURL: "https://cse134bhw5.firebaseio.com",
	storageBucket: "cse134bhw5.appspot.com",
	messagingSenderId: "692811302309"
};

firebase.initializeApp(config);

var database = firebase.database();
var userId;
var trashRef;

var storage = firebase.storage();
var imagesRef;

function restoreCompany(element) {
  var companyKey = element.parentNode.parentNode.querySelector('.key').textContent;

  trashRef.child(companyKey).once('value', function(companyToDel) {

    var companyName = companyToDel.child("companyName").val();
    var status = companyToDel.child("status").val();
    var website = companyToDel.child("website").val();
    var loc = companyToDel.child("loc").val();
    var fields = companyToDel.child("fields").val();
    var companyDescription = companyToDel.child("companyDescription").val();
    var jobTitle = companyToDel.child("jobTitle").val();
    var salary = companyToDel.child("salary").val();
    var jobDescription = companyToDel.child("jobDescription").val();
    var notesDescription = companyToDel.child("notesDescription").val();
    var starred = companyToDel.child("starred").val();
    var imageURL = companyToDel.child("imageURL").val();

    database.ref('users/' + userId + '/companies').push({

        companyName: companyName,
        website: website,
        location: loc,
        fields: fields,
        companyDescription: companyDescription,
        jobTitle: jobTitle,
        salary: salary,
        jobDescription: jobDescription,
        notesDescription: notesDescription,
        starred: starred,
        status: status,
        imageURL: imageURL

    }, 
    function(error) {
      if (error) {
        console.log('Moving to companies failed');
      } else {
        console.log('Moving to companies succeeded');
        trashRef.child(companyKey).remove(function(error) {
          if (error) {
            console.log('Deleting from trash failed');
          } else {
            console.log('Deleting from trash succeeded');
            location.reload();
          }
        });
      }
    });
  });
}

function deleteForever(element) {
  var companyKey = element.parentNode.parentNode.querySelector('.key').textContent;
  console.log(companyKey);

  trashRef.child(companyKey).once('value', function(companyToDel) {

    var companyName = companyToDel.child("companyName").val();
    var imageURL = companyToDel.child("imageURL").val();
    var oldKey = companyToDel.child("oldKey").val();

    if (imageURL != "") {
      imagesRef.child(companyName+"/"+imageURL).delete().then(function() {
        // File deleted successfully
        console.log("Trashed image deleted successfully");
        trashRef.child(companyKey).remove(function(error) {
          if (error) {
            console.log('Deleting forever from trash failed');
          } else {
            console.log('Deleting forever from trash succeeded');
            location.reload();
          }
        });
      }).catch(function(error) {
        console.log("Trashed image delete error: " + error);
      });  
    }
    else {
      trashRef.child(companyKey).remove(function(error) {
        if (error) {
          console.log('Deleting forever from trash failed');
        } else {
          console.log('Deleting forever from trash succeeded');
          location.reload();
        }
      });
    }



  });



}

function initTrash () {

  var template = document.querySelector('#template-row');

  //companyRef.orderByChild("companyName").once('value', function(snapshot) {
  trashRef.orderByKey().once('value', function(snapshot) {
    snapshot.forEach(function(data) { // each company
      var key = data.key;
      console.log("\n" + key);
      var status = data.child("status").val();
      var companyName = data.child("companyName").val();
      var jobTitle = data.child("jobTitle").val();
      var starred = data.child("starred").val();
      var dateDeleted = data.child("dateDeleted").val();

      var clone = template.content.cloneNode(true);
      var cells = clone.querySelectorAll('h4');
      cells[0].textContent = status;
      cells[1].textContent = companyName;
      cells[2].textContent = jobTitle;
      cells[3].textContent = dateDeleted;

      var keycell = clone.querySelector('.key');
      keycell.textContent = key;

      var starcell = clone.querySelector('.star');
      starcell.classList.add(starred);

      var row = clone.querySelector('tr');
      if (status == "Accepted")
        row.classList.add("success");
      else if (status == "Waiting")
        row.classList.add("warning");
      else if (status == "Rejected")
        row.classList.add("danger");
      else
        row.classList.add("grey");
      template.parentNode.appendChild(clone);
    });
  });
}

function signOut() {
	// Sign out user
	firebase.auth().signOut()
	 .catch(function (error) {
		 // Handle errors
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorCode + "\n" + errorMessage);
	 });
}

//Handle Account Status
firebase.auth().onAuthStateChanged(user => {
  if(user == null) {
    window.location = 'index.html'; // If User isn't logged in, go to login page.
  } else {
		userId = firebase.auth().currentUser.uid;
 		trashRef= database.ref('users/' + userId + '/trash');
    imagesRef = storage.ref('users/' + userId);
		initTrash();
		document.getElementById("welcome_text").innerHTML = "Welcome, " + user.email;
	}
});
