 firebase.initializeApp({
    apiKey: "AIzaSyCwkffwdd20bxKNFmlIRY6TCohl1-VqdBg",
    authDomain: "communitycash-6d2ed.firebaseapp.com",
    databaseURL: "https://communitycash-6d2ed.firebaseio.com",
    storageBucket: "communitycash-6d2ed.appspot.com",
    messagingSenderId: "736235734105"
  });
var database = firebase.database();
var user = JSON.parse(window.localStorage.getItem('user'));
var userData = JSON.parse(window.localStorage.getItem('userData'));

/*/
/* Helper Functions
/*/

String.prototype.toTitleCase = function()
{
    return this.toLowerCase().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash;
	}
	return hash;
}
function hasClass(el, className) {
  if (el.classList)
	return el.classList.contains(className)
  else
	return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
function addClass(el, className) {
  if (el.classList)
	el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}
function removeClass(el, className) {
  if (el.classList)
	el.classList.remove(className)
  else if (hasClass(el, className)) {
	var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
	el.className=el.className.replace(reg, ' ')
  }
}
function isReal(el) {
	if (el != null && el != undefined && el != "") {
		return true;
	} else {
		return false;
	}
}
function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function firebaseLogin() {
	var email = document.querySelector('#email').value;
	database.ref('emails/' + email.replace(/[@.]/g, "")).once('value').then(function(snapshot){
		userData = snapshot.val();
		if (userData === null) {
			document.querySelector('.error-message').innerHTML = 'That account does not exist.';
			removeClass(document.querySelector('.error-message'), 'hidden');
		} else {
			var password = document.querySelector('#password').value;
			if (email === userData.email && password.hashCode() == userData.password) {
				addClass(document.querySelector('.error-message'), 'hidden');
				firebase.auth().signInWithEmailAndPassword(userData.email, password).then(function(){
					database.ref('users/' + userData.ID).once('value').then(function(snapshot){
						userData = snapshot.val();
						if (userData === null) {
							alert("oh crap");
						}  else {
							landing.style.margin = "-100vh";
							setTimeout(function(){
								addClass(landing, 'hidden');
							}, 500);
							var snackbarData = {
								message: 'Login Successful',
								timeout: 2000
							};
							document.querySelector('#snackbar').MaterialSnackbar.showSnackbar(snackbarData);
							document.querySelector('#email').value ='';
							document.querySelector('#password').value ='';
							document.querySelector('.error-message').innerHTML = '';
							addClass(document.querySelector('.error-message'), 'hidden');
							addClass(document.querySelector('#nav-login'), 'hidden');
							removeClass(document.querySelector('#nav-logout'), 'hidden');
							user = firebase.auth().currentUser;
							console.log(userData);
							if (isReal(userData.userName)) {
								document.querySelector('#user-name').innerHTML = userData.userName;
							} else if (isReal(user.Email)) {
								document.querySelector('#user-name').innerHTML = user.Email;
							}
							if (isReal(userData.photoURL)) {
								document.querySelector('#propic').src = userData.photoURL;
							} else {
								document.querySelector('#propic').src = 'images/user.jpg'
							}
							document.querySelector('#profile-name').innerHTML = userData.userName.toTitleCase();
							document.querySelector('#profile-email').innerHTML = userData.Email;
							document.querySelector('#profile-zip').innerHTML = userData.Zip;
							document.querySelector('#profile-id').innerHTML = userData.ID;
							document.querySelector('#profile-groupid').innerHTML = userData.Group_ID;
							drawProfileGraphs();
							fillGroupInfo(userData);
							window.localStorage.setItem("user", JSON.stringify(user));
							window.localStorage.setItem("userData", JSON.stringify(userData));
						}
					}).catch(function(error){
						console.error(error);
					});
				}).catch(function(error) {
					if (error) {
						if (error.code === 'auth/user-not-found') {
							
						} else {
							console.error(error)
							document.querySelector('.error-message').innerHTML = error.message;
							removeClass(document.querySelector('.error-message'), 'hidden');
						}
					}
				});
			} else {
				document.querySelector('.error-message').innerHTML = 'That email and password combo is invalid.';
				removeClass(document.querySelector('.error-message'), 'hidden');
			}
		}
	}).catch(function(error){
		console.error(error);
	});
}

function firebaseLogout() {
	firebase.auth().signOut().then(function() {
		document.querySelector('#user-name').innerHTML = "Log In";
		document.querySelector('#propic').src = "images/user.jpg";
		removeClass(document.querySelector('#nav-login'), 'hidden');
		addClass(document.querySelector('#nav-logout'), 'hidden');
		document.querySelector('#profile-name').innerHTML = "";
		document.querySelector('#profile-email').innerHTML = "";
		document.querySelector('#profile-zip').innerHTML = "";
		document.querySelector('#profile-id').innerHTML = "";
		document.querySelector('#profile-groupid').innerHTML = "";
		document.querySelector('#profile-chart').innerHTML = '<h4>Financial History:</h4>';
		document.querySelector('#group-chart').innerHTML = '<h4>Communal Financial History:</h4>';
		document.querySelector("#group-members").innerHTML ='';
		var snackbarData = {
			message: 'Logout Successful',
			timeout: 2000
		  };
		document.querySelector('#snackbar').MaterialSnackbar.showSnackbar(snackbarData);
		window.localStorage.setItem("user", null);
		window.localStorage.setItem("userData", null);
	}, function(error) {
		var snackbarData = {
			message: 'Logout Unsuccessful',
			timeout: 2000
		  };
		document.querySelector('#snackbar').MaterialSnackbar.showSnackbar(snackbarData);
		console.error(error);
	});
}

window.onload = function() {
	document.querySelector("#login-btn").addEventListener('click', function(){
		if (validateEmail(document.querySelector("#email").value)) {
			document.querySelector('.error-message').innerHTML = '';
			addClass(document.querySelector('.error-message'), 'hidden');
			firebaseLogin();
		} else {
			document.querySelector('.error-message').innerHTML = 'That email is not valid!';
			removeClass(document.querySelector('.error-message'), 'hidden');
		}
	});
	document.querySelector("#nav-login").addEventListener('click', function(){
		removeClass(landing, 'hidden');
		landing.style.margin = "0";
	});
	document.querySelector("#nav-logout").addEventListener('click', function(){
		firebaseLogout();
	});


	var tabs = document.querySelectorAll('.tab');
	var navLinks = document.querySelectorAll('.tab-link');
	for (var i = 0; i < navLinks.length; i++) {
		navLinks[i].addEventListener('click', function(){
			for (var i = 0; i < tabs.length; i++) {
				addClass(tabs[i], "hidden");
			}
			for (var i = 0; i < navLinks.length; i++) {
				removeClass(navLinks[i], 'active');
			}
			var query = this.href.substring(this.href.indexOf("#"));
			currentTab = query;
			window.localStorage.setItem('currentTab', currentTab);
			removeClass(document.querySelector(query), "hidden");
			addClass(this, 'active');
			var num = parseInt(query.substring(query.length - 1));
			if (num === 1) {
				
			} else if (num === 2) {

			}
		});
	}

	if (user != null) {
		document.querySelector('#profile-name').innerHTML = userData.userName.toTitleCase();
		document.querySelector('#profile-email').innerHTML = userData.Email;
		document.querySelector('#profile-zip').innerHTML = userData.Zip;
		document.querySelector('#profile-id').innerHTML = userData.ID;
		document.querySelector('#profile-groupid').innerHTML = userData.Group_ID;
		document.querySelector('#group-id').innerHTML = userData.Group_ID;
		drawProfileGraphs();
		fillGroupInfo(userData);
		if (isReal(userData.userName)) {
			document.querySelector('#user-name').innerHTML = userData.userName;
		} else if (isReal(user.Email)) {
			document.querySelector('#user-name').innerHTML = user.Email;
		}
		if (isReal(userData.photoURL)) {
			document.querySelector('#propic').src = userData.photoURL;
		} else {
			document.querySelector('#propic').src = 'images/user.jpg'
		}
		landing.style.margin = "-100vh";
		setTimeout(function(){
			addClass(landing, 'hidden');
		}, 500);
		firebase.auth().currentUser = user;
		addClass(document.querySelector('#nav-login'), 'hidden');
		removeClass(document.querySelector('#nav-logout'), 'hidden');
	}
}

var months = ["Oct-14", "Nov-14", "Dec-14", "Jan-15", "Feb-15", "Mar-15", "Apr-15", "May-15", "Jun-15", "Jul-15", "Aug-15", "Sep-15", "Oct-15", "Nov-15", "Dec-15", "Jan-16", "Feb-16", "Mar-16", "Apr-16", "May-16", "Jun-16", "Jul-16", "Aug-16", "Sep-16"];

function drawProfileGraphs() {
	var svg = dimple.newSvg("#profile-chart", 590, 400);
	var data = [];
	for (var i = 0; i < userData.Earnings.length; i++) {
		var monthData = {
			"Month": months[i],
			"Dollars": userData.Earnings[i],
			"Type": "Earnings"
		};
		data.push(monthData);
	}
	for (var i = 0; i < userData.Earnings.length; i++) {
		var monthData2 = {
			"Month": months[i],
			"Dollars": userData.Expenses[i],
			"Type": "Expenses"
		};
		data.push(monthData2);
	}
	for (var i = 0; i < userData.Earnings.length; i++) {
		var monthData3 = {
			"Month": months[i],
			"Dollars": userData.Earnings[i] - userData.Expenses[i],
			"Type": "Net"
		};
		data.push(monthData3);
	}
	var chart = new dimple.chart(svg, data);
	chart.setBounds(60, 30, 505, 305);
	var x = chart.addCategoryAxis("x", "Month");
	x.addOrderRule(months);
	var y = chart.addMeasureAxis("y", "Dollars");
	//y.overrideMax = 1.5;
	chart.addSeries("Type", dimple.plot.line);
	chart.addLegend(60, 10, 500, 20, "right");
	chart.draw();
}

var groupMembers = [];

function fillGroupInfo(userData) {
	database.ref('groups/' + userData.Group_ID).once('value').then(function(snapshot){
		group = snapshot.val();
		if (group === null) {
			alert("oh shit");
		} else {
			for (var user in group) {
			    if (group.hasOwnProperty(user)) {
			        database.ref('users/' + group[user]).once('value').then(function(snapshot){
						memberData = snapshot.val();
						if (memberData === null) {
							alert("oh shit");
						} else {
							var ul = document.querySelector("#group-members");
							var li = document.createElement("li");
							li.appendChild(document.createTextNode(memberData.Email));
							ul.appendChild(li);
							groupMembers.push(memberData);
						}
					}).catch(function(error){
						console.error(error);
					});
			    }
			}
			var groupData = {
				"Earnings": Array(24).fill(0),
				"Expenses": Array(24).fill(0)
			};
			setTimeout(function(){
				for (var i = 0; i < groupMembers.length; i++) {
					for (var j = 0; j < 24; j++) {
						groupData.Earnings[j] += groupMembers[i].Earnings[j];
						groupData.Expenses[j] += groupMembers[i].Expenses[j];
					}
				}
				var svg = dimple.newSvg("#group-chart", 590, 400);
				var data = [];
				for (var i = 0; i < groupData.Earnings.length; i++) {
					var monthData = {
						"Month": months[i],
						"Dollars": groupData.Earnings[i],
						"Type": "Earnings"
					};
					data.push(monthData);
				}
				for (var i = 0; i < groupData.Earnings.length; i++) {
					var monthData2 = {
						"Month": months[i],
						"Dollars": groupData.Expenses[i],
						"Type": "Expenses"
					};
					data.push(monthData2);
				}
				for (var i = 0; i < groupData.Earnings.length; i++) {
					var monthData3 = {
						"Month": months[i],
						"Dollars": groupData.Earnings[i] - groupData.Expenses[i],
						"Type": "Net"
					};
					data.push(monthData3);
				}
				//console.log(data)
				var chart = new dimple.chart(svg, data);
				chart.setBounds(60, 30, 505, 305);
				var x = chart.addCategoryAxis("x", "Month");
				x.addOrderRule(months);
				var y = chart.addMeasureAxis("y", "Dollars");
				//y.overrideMax = 1.5;
				chart.addSeries("Type", dimple.plot.line);
				chart.addLegend(60, 10, 500, 20, "right");
				chart.draw();
			}, 2500);
		}
	}).catch(function(error){
		console.error(error);
	});
}