/**
 * File
 * Created    4/9/14 2:36 PM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 */

(function ($) {
	$(document).on('click', '.load', function (event) {
		// Create new bounds object when loading new markers
		bounds = new google.maps.LatLngBounds();
		var request = {
			'option'    : 'com_mapnavigator',
			'categories': '[' + $(this).data("category") + ']',
			'format'    : 'json'
		};
		$.ajax({
			type   : 'POST',
			data   : request,
			format : 'json',
			success: function (response) {
				deleteMarkers();
				removeSidebarElements();
				var markers = eval("(" + response + ")");
				console.log(markers);
				for (var key in markers) {
					if (markers.hasOwnProperty(key)) {
						var Latlng = new google.maps.LatLng(markers[key].lat, markers[key].lng);
						var info = markers[key].info;
						addMarker(Latlng, key, info);
					}
				}
			}
		});
		return false;
	});
})(jQuery)

// Load API Asynchronously
function loadScript() {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' +
		'callback=initialize';
	document.body.appendChild(script);
}

window.onload = loadScript;

// Global vars
var bounds, infoWnd, map;
var markers = [];
function initialize() {
	infoWnd = new google.maps.InfoWindow();
	var mapOptions = {
		zoom     : 2,
		center   : new google.maps.LatLng(0, 0),
		mapTypeId: 'roadmap'
	};
	map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);

	var styles = [
		{
			featureType: 'all',
			stylers    : [
				{ visibility: 'off' }

			]
		},
		{
			featureType: 'landscape',
			stylers    : [
				{ visibility: 'on' },
				{ color: '#999' }

			]
		},
		{
			featureType: 'water',
			stylers    : [
				{ visibility: 'on' },
				{ color: '#ffffff' }
			]
		}
	];

	map.setOptions({styles: styles});
}

// Add a marker to the map and push to the array.
function addMarker(location, title, info) {
	var marker = new google.maps.Marker({
		position: location,
		map     : map,
		title   : title,
		icon    : {
			path        : google.maps.SymbolPath.CIRCLE,
			scale       : 2,
			fillColor   : '#8a2b87',
			fillOpacity : 1,
			strokeColor : '#8a2b87',
			strokeWeight: 2
		}
	});

	// Extend boundaries to fit new markers
	bounds.extend(location);

	google.maps.event.addListener(marker, 'mouseover', function () {
		marker.setIcon({
			path        : google.maps.SymbolPath.CIRCLE,
			scale       : 10,
			fillColor   : 'red',
			fillOpacity : 1,
			strokeColor : 'green',
			strokeWeight: 2
		});
	});

	google.maps.event.addListener(marker, 'mouseout', function () {
		marker.setIcon({
			path        : google.maps.SymbolPath.CIRCLE,
			scale       : 2,
			fillColor   : '#8a2b87',
			fillOpacity : 1,
			strokeColor : '#8a2b87',
			strokeWeight: 2
		});
	});

	google.maps.event.addListener(marker, "click", function () {
		infoWnd.setContent(info);
		infoWnd.open(map, marker);
	});

	createSidebarElement(marker);

	// Push new marker
	markers.push(marker);
	// Push new boundaries
	map.fitBounds(bounds);
}

function createSidebarElement(marker) {
	//Creates a sidebar button
	var ul = document.getElementById("sidebar");
	var li = document.createElement("li");
	var title = marker.getTitle();
	li.innerHTML = title;
	ul.appendChild(li);

	//Trigger a click event to marker when the button is clicked.
	google.maps.event.addDomListener(li, "click", function () {
		google.maps.event.trigger(marker, "click");
	});
}

function removeSidebarElements() {
	var myNode = document.getElementById("sidebar");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
}

// Sets the map on all markers in the array.
function setAllMap(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
	setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
	setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
	setAllMap(null);
	markers = [];
}

google.maps.event.addDomListener(window, 'load', initialize);
