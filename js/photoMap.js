"use strict";

/* 
    Global variables for accessing Flickr API, lat, long, map, and UI elements
    Lat and long initially hardcoded to Philly
*/
const FLICKR_API_KEY = "97690e43438d1a5f0402a1ffa7c557fd";

var lat = 39.9526; 
var long = -75.1652;
var map;

var imageDetail = $("#imageDetail");
var noPhotosAlert = $("#noPhotosAlert");

$(function() {
    // When the document is ready, call the initMap() function
    initMap();
});

function initMap() {
    // initMap() creates a new Google map with all user controls 
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: lat,
            lng: long
        },
        zoom: 5,
        scrollwheel: true,        
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true
    });

    // Then the center of the map is set with a marker on Philadelphia
    var philly = new google.maps.LatLng(lat, long);

    new google.maps.Marker({
        position: philly,
        map: map
    });

    // The reverse-geocoder and infowindow that displays geocode results are initialized
    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow;
    
    // The getImages() function is then called with the initial lat, long (Philadelphia)
    getImages(lat, long);

    /* 
        A click event listener is applied to the map
        When the map is clicked, the lat, long is grabbed from the click event
        The center of the map is set the the lat, long 
        A marker is placed at the lat, long 
    */
    map.addListener('click', function(event) {
        $('#map').animate({
            height: '50vh'
            }, 500, function () {
                initMap();
                map.setCenter(event.latLng);
                var coordinates = event.latLng;
                lat = (coordinates.lat()).toFixed(6);
                long = (coordinates.lng()).toFixed(6);

                new google.maps.Marker({
                    position: coordinates,
                    map: map
                });

                // Attempt to get reverse-geocode information for current lat, long
                geocodeLatLng(geocoder, map, infowindow, lat, long);
                // Retrieve images for current location
                getImages(lat, long);
        });
    });
}

function getImages(lat, long) {
    // In case the noPhotosAlert div is shown, fade it out and empty the content
    noPhotosAlert.fadeOut();
    noPhotosAlert.empty();

    /* 
        A call is made to the Flickr API with the lat, long to request photos tagged in that location
        Note: API call fails initially based on latitude but does return correct photo set
    */
    $.ajax({
        url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + FLICKR_API_KEY + "&lat=" + lat + "&lon=" + long + "&per_page=100&format=json&jsoncallback=?",
        type: "GET",
        dataType: 'jsonp',
        success: function (data) {
            console.log("DATA: ", data);
            if ( data.stat == "fail" ) {
                console.log("Flickr latitude issue");
            }
            else if (data.photos.total < 1) {
                console.log("Location images not retrieved: ", data)
                // If there are no photos, display stock photos from the array of tags below and alert the user
                const tags = ["nature", "joy", "world", "landscape", "wander", "beautiful", "outdoor", "green", "view", "light", "lines", "nature", "rural", "vacation", "love", "pride", "travel", "trees", "island", "life", "explore", "adventure", "water", "fashion", "style", "beautiful", "photography", "fish", "light", "inspiring", "food", "sunset", "sky", "wildlife", "snow", "fashion", "fields", "hike", "happiness", "animals", "kittens", "city", "forest", "beach", "mountain", "sunshine", "rain", "puppy", "puppies"];

                // A backup Flickr API call to provide photos with one of the tags above
                $.ajax({
                    url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + FLICKR_API_KEY + "&tags=" + tags[Math.floor(Math.random() * tags.length+1) + 1]+ "&per_page=100&format=json&jsoncallback=?",
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        console.log("Images successfully retrieved: ", data);
                        
                        // Show the user a div to let them know that there are no photos in their selected area
                        showNoPhotosAlert();

                        // Display the retrieved images
                        displayImages(data);
                    },
                    fail: function (err) {
                        console.log("Error retrieving images: " + err.status);
                    }
                });
              }
            else {
                console.log("Images successfully retrieved", data);
                
                // Display the retrieved images
                displayImages(data);
            }
        },
        fail: function (err) {
            console.log('Error: ' + err.status);
        }
    });
}

/*
    geocodeLatLng() takes the initialized geocoder, map, and infowindow plus the lat, long
    An attempt is made to gather the location information from the lat, long 
    If location results are found, the location is zoomed in on and a marker is placed
    The infowindow will display and show the location place name
    If no results are found,a console error will display
*/
function geocodeLatLng(geocoder, map, infowindow, lat, long) {
    var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
        if (results[1]) {
            map.setZoom(8);
            var marker = new google.maps.Marker({
            position: latlng,
            map: map
            });
            infowindow.setContent(results[1].formatted_address);
            infowindow.open(map, marker);
        } else {
            console.log('No results found');
        }
        } else {
            console.log('Geocoder failed due to: ' + status);
        }
    });
}

function displayImages(data){
    // Clear the images from the previous photo array
    $('#photos').empty();
    $('#photos').hide();

	// Loop through each photo in the resulting photo array
    $.each(data.photos.photo, function(i, photo){

        // Store the latitude and longitude of the current photo
        lat = photo.latitude;
        long = photo.longitude;
        
        // Create the url for the current photo 
        var photoURL = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + '_' + photo.secret + '_m.jpg';		

        // Create the resulting img tag for each photo 
        var title = photo.title || "Description not provided";
        var htmlString = '<img class="image" title="' + title + '" alt="' + title + '" id="' + photoURL + '" src="' + photoURL + '">';					

        // Append the img tag to the photos div and then fade it in
        $(htmlString).appendTo("#photos");
    });	
    
    $('#photos').fadeIn(1000);	
  } 

// Shows the user a div to let them know that there are no photos in their selected area
function showNoPhotosAlert() {
    var htmlString = '<p>No photos tagged in this location. Keep clicking to see the world!</p>';					
    $(htmlString).appendTo(noPhotosAlert);
    noPhotosAlert.fadeIn();
}  

// Dims the screen background and pops up the image clicked by the user with the title provided by Flickr users
function showDetail(URL, title) {
    imageDetail.empty();
    var titleString = '<p>' + title + '</p>';
    var imageString = '<img class="image" src="' + URL + '">';	

    $(titleString).appendTo("#imageDetail");
    $(imageString).appendTo("#imageDetail");

    imageDetail.show();
}

// If the imageDetail div is visible, it is emptied and hidden on click
function toggleDetail() {
    if (imageDetail.is(":visible")) {
        imageDetail.empty();
        imageDetail.hide();
    }
}