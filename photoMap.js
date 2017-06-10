"use strict";

const FLICKR_API_KEY = "97690e43438d1a5f0402a1ffa7c557fd";
const FLICKR_SECRET = "b644c1c1861cb8f7";
const GMAPS_API_KEY = "AIzaSyA6t4HGkRl-ZJxvpSHleNmFDlQyem-Eh5I";

var lat = 5;
var long = 5;

$(document).ready(function(){

    $.ajax({
    url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + FLICKR_API_KEY + "&lat=" + lat + "&lon=" + long + "&per_page=50&format=json&jsoncallback=?",
    type: "GET",
    dataType: 'jsonp',
    success: function (data) {
        console.log("DATA LOGGING HERE", data);
        displayImages(data);
      }
    })
    .done(function(res) {
        console.log(res);
    })
    .fail(function(err) {
        console.log('Error: ' + err.status);
    });
    
}); 

function displayImages(data){
	// Loop through each photo in the resulting photo array
    $.each(data.photos.photo, function(i,item){
    
    // Store the latitude and longitude of the current photo
    lat = item.latitude;
    long = item.longitude;
    
    // Create the url for the current photo 
    var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';		
    console.log(photoURL, "PHOTO URL");
   
    // Create the resulting img tag for each photo 
    var htmlString = '<img src="' + photoURL + '">';					
    console.log(htmlString, "HTML STRING");
    });					
  } 

