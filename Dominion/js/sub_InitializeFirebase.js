// Initialize Firebase
let config = {
	apiKey: "AIzaSyDWW2ktQrzDX1H3CzDcgUGwIv-JAnrLa5k",
	authDomain: "dominiononline-3e224.firebaseapp.com",
	databaseURL: "https://dominiononline-3e224.firebaseio.com",
	storageBucket: "",
	messagingSenderId: "417434662660"
};
firebase.initializeApp(config);

const FBdatabase  = firebase.database();
const FBref_Rooms = FBdatabase.ref('/Rooms');
