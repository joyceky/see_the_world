"use strict";

const FLICKR_API_KEY = "97690e43438d1a5f0402a1ffa7c557fd";
const FLICKR_SECRET = "b644c1c1861cb8f7";
const GMAPS_API_KEY = "AIzaSyA6t4HGkRl-ZJxvpSHleNmFDlQyem-Eh5I";

const tags = ["nature", "water", "happiness", "animals", "kittens", "city", "forest", "beach", "mountain", "sunshine", "rain", "puppy", "puppies"];

var lat = 39.9526;
var long = -75.1652;
var map;


initMap();

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 39.9857,
            lng: -75.1652
        },
        zoom: 4,
        scrollwheel: false
    });

    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow;

    getImages(lat, long)

    map.addListener('click', function(event) {
        $('#map').animate({
            height: '300px'
            }, 500, function () {
                initMap();
                map.setCenter(event.latLng);

                let coordinates = event.latLng;
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
    $.ajax({
        url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + FLICKR_API_KEY + "&lat=" + lat + "&lon=" + long + "&per_page=50&format=json&jsoncallback=?",
        type: "GET",
        dataType: 'jsonp',
        success: function (data) {
            console.log("Images successfully retrieved", data);
            displayImages(data);
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
            map.setZoom(11);
            var marker = new google.maps.Marker({
            position: latlng,
            map: map
            });
            infowindow.setContent(results[1].formatted_address);
            infowindow.open(map, marker);
        } else {
            window.alert('No results found');
        }
        } else {
        window.alert('Geocoder failed due to: ' + status);
        }
    });
}

function displayImages(data){
    // Clear the images from the previous photo array
    $('#images').empty();

    if(data.photos.photo.length == 0) {
        // If there are no photos, display stock photos from a variety of tags for user
        console.log("NO PHOTOS HERE!");
        $.ajax({
            url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + FLICKR_API_KEY + "&tags=" + tags[Math.floor(Math.random() * tags.length+1) + 1]+ "&per_page=50&format=json&jsoncallback=?",
            type: "GET",
            dataType: 'jsonp',
            success: function (data) {
                console.log("Images successfully retrieved", data);
                displayImages(data);
            },
            fail: function (err) {
                console.log('Error: ' + err.status);
            }
        });
    }

	// Loop through each photo in the resulting photo array
    $.each(data.photos.photo, function(i,item){

        // Store the latitude and longitude of the current photo
        lat = item.latitude;
        long = item.longitude;
        
        // Create the url for the current photo 
        var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';		
        // console.log(photoURL, "PHOTO URL");

        // Create the resulting img tag for each photo 
        var htmlString = '<a href="' + photoURL + '"><img src="' + photoURL + '"></a>';					
        // console.log(htmlString, "HTML STRING");

        $(htmlString).appendTo('#images');
    });					
  } 