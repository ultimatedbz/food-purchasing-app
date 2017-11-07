function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
}

var date = new Date();
var dateString = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();

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
var companyRef;
var groupsRef;
var companyKeyBeingEdited = null;

var storage = firebase.storage();
var imagesRef;
var allowedFileTypes = ["image/png", "image/jpeg", "image/gif"];

function addCompany() {
  var companyName = document.getElementById("companyNameInput").value;

  /* storage */
  var fileList = document.getElementById("imageInput").files;

  var imageURL = "";
  if (fileList.length > 0) {
    imageURL = document.getElementById("imageInput").files[0].name;
    var image = document.getElementById("imageInput").files[0];
    var imageArray = [image];
    if (allowedFileTypes.indexOf(image.type) > -1) {
      // file type matched is one of allowed file types. Do something here.
      var newPostKey = pushCompany(companyName, imageURL);
      console.log(newPostKey+"/"+imageURL);

      var blob = new Blob(imageArray, {type : image.type});
      var uploadTask = imagesRef.child(newPostKey+"/"+imageURL).put(image);
      uploadTask.then(function(snapshot) {
        console.log('Uploaded IMAGE!');
        location.reload();
      });

      uploadTask.on('state_changed', function(snapshot){
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.getElementById('uploadProgress').innerHTML = 'Uploading image: ' + progress*100/100 + '% complete!';
      }, function(error) {
        // Handle unsuccessful uploads
      }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        var downloadURL = uploadTask.snapshot.downloadURL;
      });

    }
    else {
      pushCompany(companyName, "");
      location.reload();
    }
  }
  else {
    pushCompany(companyName, imageURL);
    location.reload();
  }
}

function pushCompany(companyName, imageURL) {

  var status = document.getElementById("statusInput").value;
  var website = document.getElementById("websiteInput").value;
  var loc = document.getElementById("locationInput").value;
  var fields = document.getElementById("fieldsInput").value;
  var companyDescription = document.getElementById("companyDescriptionInput").value;
  var jobTitle = document.getElementById("jobTitleInput").value;
  var salary = document.getElementById("salaryInput").value;
  var jobDescription = document.getElementById("jobDescriptionInput").value;
  var notesDescription = document.getElementById("notesDescriptionInput").value;

  var newPost = companyRef.push({

      companyName: companyName,
      website: website,
      location: loc,
      fields: fields,
      companyDescription: companyDescription,
      jobTitle: jobTitle,
      salary: salary,
      jobDescription: jobDescription,
      notesDescription: notesDescription,
      starred: "unstarred",
      status: status,
      imageURL: imageURL

  });

  console.log(newPost.key);
  return newPost.key;


}

function deleteImage(element) {
  document.getElementById("companyImage2").src = "";
  document.getElementById("deleteImageButton").style.display = "none";

  var imageURL;
  var companyName;

  console.log("editing " + companyKeyBeingEdited);
  companyRef.child(companyKeyBeingEdited).once('value',function(data) {
    imageURL = data.child("imageURL").val();
    companyName = data.child("companyName").val();

    companyRef.child(companyKeyBeingEdited).update({
      imageURL: ""
    });

    imagesRef.child(companyKeyBeingEdited+"/"+imageURL).delete().then(function() {
      // File deleted successfully
      console.log("Image deleted successfully");
    }).catch(function(error) {
      // Uh-oh, an error occurred!
      console.log("error: " + error);
    });
  });
}


function editCompany(element) {
  document.getElementById("companyImage2").src = "";
  companyKeyBeingEdited = element.parentNode.parentNode.querySelector('.key').textContent;
  //console.log("editing company " + companyKeyBeingEdited);
  companyRef.child(companyKeyBeingEdited).once('value',function(data) {

    //document.getElementById("companyImage2").src = data.child("imageURL").val();
    var imageURL = data.child("imageURL").val();
    var companyName = data.child("companyName").val();

    console.log("imageURL: " + imageURL);
    if (imageURL != "") {
      imagesRef.child(companyKeyBeingEdited+"/"+imageURL).getDownloadURL().then(function(url) {
        // `url` is the download URL for 'images/stars.jpg'

        // Or inserted into an <img> element:
        console.log("inserted img");
        document.getElementById("companyImage2").src = url;
      }).catch(function(error) {
        // Handle any errors
        console.log("ERROR HERE");
      });
    }


    document.getElementById("companyNameInput2").value = companyName;
    document.getElementById("statusInput2").value = data.child("status").val();
    document.getElementById("websiteInput2").value = data.child("website").val();
    document.getElementById("locationInput2").value = data.child("location").val();
    document.getElementById("fieldsInput2").value = data.child("fields").val();
    document.getElementById("companyDescriptionInput2").value = data.child("companyDescription").val();
    document.getElementById("jobTitleInput2").value = data.child("jobTitle").val();
    document.getElementById("salaryInput2").value = data.child("salary").val();
    document.getElementById("jobDescriptionInput2").value = data.child("jobDescription").val();
    document.getElementById("notesDescriptionInput2").value = data.child("notesDescription").val();

    if (data.child("imageURL").val() == "") {
      document.getElementById("deleteImageButton").style.display = "none";
    }
    else {
      document.getElementById("deleteImageButton").style.display = "inline";
    }
  });

}

function updateCompany(element) {
  //console.log("about to update " + companyKeyBeingEdited)

  var fileList = document.getElementById("imageInput2").files;
  var imageURL = "";
  if (fileList.length > 0)
    imageURL = document.getElementById("imageInput2").files[0].name;

  var companyName = document.getElementById("companyNameInput2").value;
  var status = document.getElementById("statusInput2").value;
  var website = document.getElementById("websiteInput2").value;
  var loc = document.getElementById("locationInput2").value;
  var fields = document.getElementById("fieldsInput2").value;
  var companyDescription = document.getElementById("companyDescriptionInput2").value;
  var jobTitle = document.getElementById("jobTitleInput2").value;
  var salary = document.getElementById("salaryInput2").value;
  var jobDescription = document.getElementById("jobDescriptionInput2").value;
  var notesDescription = document.getElementById("notesDescriptionInput2").value;

  var oldImageURL;
  companyRef.child(companyKeyBeingEdited).once('value',function(data){
    oldImageURL = data.child("imageURL").val();
    if (imageURL == "")
      imageURL = oldImageURL;

    companyRef.child(companyKeyBeingEdited).update({

      companyName: companyName,
      website: website,
      location: loc,
      fields: fields,
      companyDescription: companyDescription,
      jobTitle: jobTitle,
      salary: salary,
      jobDescription: jobDescription,
      notesDescription: notesDescription,
      status: status,
      imageURL: imageURL

    });

    if (fileList.length > 0) {
      var image = document.getElementById("imageInput2").files[0];
      var imageArray = [image];
      if (allowedFileTypes.indexOf(image.type) > -1) {
        // file type matched is one of allowed file types. Do something here.
        var blob = new Blob(imageArray, {type : image.type});

        /* delete original image */
        if (oldImageURL != "") {
          imagesRef.child(companyKeyBeingEdited+"/"+oldImageURL).delete().then(function() {
            // File deleted successfully
            console.log("Old image deleted successfully");
          }).catch(function(error) {
            console.log("Old image delete error: " + error);
          });
        }


        var uploadTask = imagesRef.child(companyKeyBeingEdited+"/"+imageURL).put(image);
        uploadTask.then(function(snapshot) {
          console.log('Uploaded IMAGE!');
          location.reload();
        });

        uploadTask.on('state_changed', function(snapshot){
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          document.getElementById('uploadProgress2').innerHTML = 'Uploading image: ' + progress*100/100 + '% complete!';
        }, function(error) {
          // Handle unsuccessful uploads
        }, function() {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          var downloadURL = uploadTask.snapshot.downloadURL;
        });
      }
      else
        location.reload();
    }
    else
      location.reload();
  })
}


function deleteCompany(element) {
  var companyKey = element.parentNode.parentNode.querySelector('.key').textContent;
  console.log(companyKey);

  companyRef.child(companyKey).once('value', function(companyToDel) {

    var imageURL = companyToDel.child("imageURL").val();
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

    database.ref('users/' + userId + '/trash').push({
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
        dateDeleted: dateString,
        imageURL: "",
        oldKey: companyKey
    }, 
    function(error) {
      if (error) {
        console.log('Moving to trash failed');
      } else {
        console.log('Moving to trash succeeded');
				
        companyRef.child(companyKey).remove(function(error) {
          if (error) {
            console.log('Deleting from companies failed');
            location.reload();
          } 
          else {
            console.log('Deleting from companies succeeded');
						groupsRef.orderByKey().once('value', function(snapshot) {
							snapshot.forEach(function(data) { // each group
								var key = data.key;
								var groupName = data.child("groupName").val();
								var groupKey = data.key;
								data.forEach(function(cks){ // companyKeys / groupName
									if (cks.key != "groupName") {
										cks.forEach(function(d){ // each companyKey
											var cKey = d.child("companyKey").val();
											console.log("cKey: " + cKey);
											console.log("companyKey: " + companyKey);
											if (cKey == companyKey){
												database.ref('users/' + userId + '/groups/' + groupKey
												+ '/companyKeys/' + d.key).remove().then(function(f){
                          console.log("company removed from a group");
                        });
											}
										});
									}
								});
							});
						}).then(function(f){
              /* delete image because we don't know how to restore with key */
              if (imageURL != "") {
                imagesRef.child(companyKey+"/"+imageURL).delete().then(function() {
                  // File deleted successfully
                  console.log("Trashed image deleted successfully");
                  location.reload();
                }).catch(function(error) {
                  console.log("Trashed image delete error: " + error);
                });  
              }
              else
                location.reload();
            });

            
          }
        });
      }
    });
  });
}



function copyCompany(element) {
  var companyKey = element.parentNode.parentNode.querySelector('.key').textContent;
  console.log(companyKey);

  companyRef.child(companyKey).once('value', function(companyToCopy) {

    var imageURL = companyToCopy.child("imageURL").val();
    var companyName = companyToCopy.child("companyName").val();
    var status = companyToCopy.child("status").val();
    var website = companyToCopy.child("website").val();
    var loc = companyToCopy.child("loc").val();
    var fields = companyToCopy.child("fields").val();
    var companyDescription = companyToCopy.child("companyDescription").val();
    var jobTitle = companyToCopy.child("jobTitle").val();
    var salary = companyToCopy.child("salary").val();
    var jobDescription = companyToCopy.child("jobDescription").val();
    var notesDescription = companyToCopy.child("notesDescription").val();
    var starred = companyToCopy.child("starred").val();

    /* copy image with new key */
    /*
    if (imageURL != "") {
      imagesRef.child(companyKey+"/"+imageURL).getDownloadURL().then(function(url) {
        // `url` is the download URL for 'images/stars.jpg'

      }).catch(function(error) {
        // Handle any errors
        console.log("ERROR HERE");
      });
    }
    */
    imageURL = "";

    companyRef.push({

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
        console.log('Moving to trash failed');
      } else {
        location.reload();
      }
    });
  });
}

function toggleStar (starcell) {
  var companyKey = starcell.parentNode.parentNode.parentNode.parentNode.querySelector('.key').textContent;
  var companyName = starcell.parentNode.parentNode.parentNode.parentNode.querySelectorAll('h4')[1].textContent;
  var starred;

	groupsRef.once('value', function(snapshot) { // get all groups
		snapshot.forEach(function(data) { // each group
			var groupName = data.child("groupName").val();
			var groupKey = data.key;
			if (groupName == "Favorites") {
				if (starcell.classList.contains("starred")) {
          
					starcell.classList.remove("starred");
					starcell.classList.add("unstarred");
					starred = "unstarred";
          

					data.forEach(function(snap) { // go through companyKeys/groupName
						if (snap.key != 'groupName') {
							snap.forEach(function(company) {
								var key = company.child("companyKey").val();
								if (key == companyKey) {
									database.ref('users/' + userId + '/groups/' + groupKey + '/companyKeys/' + company.key).remove();
								}
							});
						}
					});
				} else if (starcell.classList.contains("unstarred")) {
          
					starcell.classList.remove("unstarred");
					starcell.classList.add("starred");
					starred = "starred";
          

					database.ref('users/' + userId + '/groups/' + groupKey +'/companyKeys/').push({
						companyKey: companyKey,
						companyName: companyName
					});

				} else {
					console.log("ERROR");
				}
				companyRef.child(companyKey).update({
					starred: starred
				});
			}
		});
	});




}


function initCompanies () {

  var template = document.querySelector('#template-row');

  /*
  firebase.database().ref('users/' + userId).once('value').then(function(snapshot) {
    var companies = snapshot.val().companies.toJSON();
    alert(companies);
  });
  */

  //companyRef.orderByChild("companyName").once('value', function(snapshot) {
  companyRef.orderByKey().once('value', function(snapshot) {
    snapshot.forEach(function(data) { // each company
      var key = data.key;
      console.log("\n" + key);
      var status = data.child("status").val();
      var companyName = data.child("companyName").val();
      var jobTitle = data.child("jobTitle").val();
      var starred = data.child("starred").val();

      var clone = template.content.cloneNode(true);
      var cells = clone.querySelectorAll('h4');
      cells[0].textContent = status;
      cells[1].textContent = companyName;
      cells[2].textContent = jobTitle;

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
		companyRef = database.ref('users/' + userId + '/companies');
		groupsRef = database.ref('users/' + userId + '/groups');
    imagesRef = storage.ref('users/' + userId);
		initCompanies();
		document.getElementById("welcome_text").innerHTML = "Welcome, " + user.email;
	}
});
