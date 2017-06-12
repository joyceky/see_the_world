"use strict";

const FLICKR_API_KEY = "97690e43438d1a5f0402a1ffa7c557fd";
const FLICKR_SECRET = "b644c1c1861cb8f7";
const GMAPS_API_KEY = "AIzaSyA6t4HGkRl-ZJxvpSHleNmFDlQyem-Eh5I";

const tags = ["nature", "travel", "trees", "island", "life", "explore", "adventure", "water", "fashion", "style", "beautiful", "photography", "fish", "light", "sports", "inspiring", "food", "sunset", "sky", "wildlife", "snow", "fashion", "fields", "hike", "happiness", "animals", "kittens", "city", "forest", "beach", "mountain", "sunshine", "rain", "puppy", "puppies"];

var lat = 39.9526;
var long = -75.1652;
var map;

initMap();

function initMap() {
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

    var philly = new google.maps.LatLng(lat, long);

    var marker = new google.maps.Marker({
        position: philly,
        map: map
    });

    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow;
    
    // geocodeLatLng(geocoder, map, infowindow, lat, long);
    getImages(lat, long)

    map.addListener('click', function(event) {
        $('#map').animate({
            height: '35vh'
            }, 500, function () {
                initMap();
                map.setCenter(event.latLng);
                var coordinates = event.latLng;
                lat = coordinates.lat();
                long = coordinates.lng();

                console.log(lat, long);

                var marker = new google.maps.Marker({
                    position: coordinates,
                    map: map
                });

                geocodeLatLng(geocoder, map, infowindow, lat, long);
                getImages(lat, long);
        });
    });
}

function getImages(lat, long) {
    $("#noPhotos").fadeOut();
    $("#noPhotos").empty();

    $.ajax({
        url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + FLICKR_API_KEY + "&lat=" + lat + "&lon=" + long + "&per_page=150&format=json&jsoncallback=?",
        type: "GET",
        dataType: 'jsonp',
        success: function (data) {
            console.log("Images successfully retrieved", data);

            if (data.photos.photo.length == 0) {
                // If there are no photos, display stock photos from a variety of tags and alert user
                $.ajax({
                    url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + FLICKR_API_KEY + "&tags=" + tags[Math.floor(Math.random() * tags.length+1) + 1]+ "&per_page=50&format=json&jsoncallback=?",
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        console.log("Images successfully retrieved: ", data);
                        
                        var htmlString = '<p>No photos in this location. Keep clicking to see the world!</p>';					
                        $(htmlString).appendTo("#noPhotos");
                        $("#noPhotos").fadeIn();

                        displayImages(data);
                    },
                    fail: function (err) {
                        console.log("Error retrieving images: " + err.status);
                    }
                });
            }
            else {
                displayImages(data);
            }
        },
        fail: function (err) {
            console.log('Error: ' + err.status);
        }
    });
}

function geocodeLatLng(geocoder, map, infowindow, lat, long) {
    var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === 'OK') {
        if (results[1]) {
            map.setZoom(6);
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
        // console.log(photoURL, "PHOTO URL");

        // Create the resulting img tag for each photo 
        var htmlString = '<img class="image" id="' + photoURL + '" src="' + photoURL + '">';					
        // console.log(htmlString, "HTML STRING");

        $(htmlString).appendTo("#photos");
    })	
    
    $('#photos').fadeIn(1000);			
  } 