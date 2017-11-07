function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
}

var date = new Date();
var dateString = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();

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
var groupsRef;
var companyRef;
var groupNames = [];

var companyKeyBeingEdited = null;
var groupBeingEdited = null;
var collapseNum = 1;

function addGroup() {
  var groupName = document.getElementById("groupNameInput").value;
	if (groupNames.includes(groupName)){
		alert("The group " + groupName + " already exists!");
		return;
	}
  groupsRef.push({
      groupName: groupName
  });

  location.reload();
}

function editGroup(element) {
  groupBeingEdited = element.parentNode.parentNode.querySelector('.groupKey').textContent;
  groupNameBeingEdited = element.parentNode.parentNode.querySelector('.groupName').textContent;
}

function updateGroup(element) {
  var checkedKeys = document.querySelectorAll('input:checked + .checkbox-key');
  var checkedCompanyNames = document.querySelectorAll('input:checked ~ .checkbox-companyName');
  groupsRef.child(groupBeingEdited + "/companyKeys").set(null);
  var i;
  for (i = 0; i < checkedKeys.length; i++) {
    groupsRef.child(groupBeingEdited + "/companyKeys").push({
      companyKey: checkedKeys[i].textContent,
      companyName: checkedCompanyNames[i].textContent
    });
  }
  location.reload();
}

function deleteGroup(element) {
  var groupKey = element.parentNode.parentNode.querySelector('.groupKey').textContent;
  console.log(groupKey);
  groupsRef.child(groupKey).remove(function(error) {
    if (error) {
      console.log('Deleting group failed');
    } else {
      console.log('Deleting group succeeded');
      location.reload();
    }
  });
}

function initGroups () {

  //companyRef.orderByChild("companyName").once('value', function(snapshot) {
  groupsRef.orderByKey().once('value', function(snapshot) {
		var m = [];
    snapshot.forEach(function(data) { // each group
      var template = document.querySelector('#template-group');
      var key = data.key;
      console.log("\n-----------------");
      var groupName = data.child("groupName").val();
      console.log("\n" + groupName);
			groupNames.push(groupName);

      var clone = template.content.cloneNode(true); //clone of group
      clone.querySelector('.groupKey').textContent = key;
      clone.querySelector('.groupName').textContent = groupName;
      clone.querySelector('.collapse').id = "collapse" + collapseNum;
      clone.querySelector('.collapseLink').href = "#collapse" + collapseNum;
			console.log(collapseNum);
			m[groupName] = collapseNum;
      collapseNum = collapseNum+1;

      if (groupName == "Favorites") {
        clone.querySelector('.trash-button').style.display = "none";
        clone.querySelector('.wrench-button').style.display = "none";
      }

			if (collapseNum == 2) {
				clone.querySelector('.collapse').className += " in";
			}

      data.forEach(function(cks){ // each companyKey

        if (cks.key != "groupName") {
          console.log("reading " + cks.key);
          cks.forEach(function(d){
            var companyKey = d.child("companyKey").val();
            companyRef.child(companyKey).once('value',function(companyData) {
              var status = companyData.child("status").val();
              var companyName = companyData.child("companyName").val();
							console.log(groupName + " companyName " + companyName);
              var jobTitle = companyData.child("jobTitle").val();
              var starred = companyData.child("starred").val();

							var nodes = document.querySelectorAll('#template-company');
							//var template2 = nodes[collapseNum-2];
							var template2 = nodes[m[groupName]-1];

              var clone2 = template2.content.cloneNode(true);
              var cells = clone2.querySelectorAll('h4');
              cells[0].textContent = status;
              cells[1].textContent = companyName;
              cells[2].textContent = jobTitle;

              var starcell = clone2.querySelector('.star');
              starcell.classList.add(starred);

              var row = clone2.querySelector('li');
              if (status == "Accepted")
                row.classList.add("accepted");
              else if (status == "Waiting")
                row.classList.add("waiting");
              else if (status == "Rejected")
                row.classList.add("rejected");
              else
                row.classList.add("grey");
							// Put company clone in group
              template2.parentNode.appendChild(clone2);
            });
          });
        }
        else {
          console.log("reading groupName " + cks.val());
        }
      });
      template.parentNode.appendChild(clone); // Put group clone in accordian
    });
  });

  companyRef.once('value',function(snapshot) {
    snapshot.forEach(function(data) { // each company
      var key = data.key;
      var companyName = data.child("companyName").val();
      var jobTitle = data.child("jobTitle").val();
      
      var template2 = document.querySelector('#template-checkbox');
      var clone2 = template2.content.cloneNode(true);
      clone2.querySelector(".checkbox-key").textContent = key;
      clone2.querySelector(".checkbox-companyName").textContent = companyName;
      clone2.querySelector(".checkbox-jobTitle").textContent = jobTitle;
      template2.parentNode.appendChild(clone2);
    })
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
		initGroups();
		document.getElementById("welcome_text").innerHTML = "Welcome, " + user.email;
	}
});
