/**
 * File
 * Created    4/9/14 2:36 PM
 * Author     Matt Thomas | matt@betweenbrain.com | http://betweenbrain.com
 * Support    https://github.com/betweenbrain/
 * Copyright  Copyright (C) 2014 betweenbrain llc. All Rights Reserved.
 * License    GNU GPL v2 or later
 */

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
var bounds, infoWnd, map, mapZoom;
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
function addMarker(location, title, info, type) {
	var marker = new google.maps.Marker({
		position: location,
		map     : map,
		title   : title,
		icon    : 'http://media.guggenheim.org/map-navigator/' + type + '.png'
	});

	// Extend boundaries to fit new markers
	bounds.extend(location);

	google.maps.event.addListener(marker, 'mouseover', function () {
		marker.setIcon('http://media.guggenheim.org/map-navigator/' + type + '-hover.png');
	});

	google.maps.event.addListener(marker, 'mouseout', function () {
		marker.setIcon('http://media.guggenheim.org/map-navigator/' + type + '.png');
	});

	google.maps.event.addListener(marker, 'click', function () {
		// Expand sidebar text when clicking marker
		(function ($) {
			$('#' + marker.__gm_id).next('.hidden').toggle(function () {
				$('.hidden:visible').not(this).hide();
			});
		})(jQuery)

		// Set and display infowindow
		infoWnd.setContent(title + '<img src="http://media.guggenheim.org/map-navigator/' + type + '.png"/>');
		infoWnd.open(map, marker);
	});

	// Check if marker has already been pushed to the markers title array
	if (markers[title] !== title) {
		createSidebarElement(marker, info);
	}

	// Push to the markers title array
	markers[title] = title;

	// Push new marker
	markers.push(marker);
	// Push new boundaries
	map.fitBounds(bounds);

	// Offsets the MAP based on center
	var c = map.getCenter();
	map_recenter(c, 150, 0);

	// Forces MAP to zoom out one level to accommodate bounds offset - http://stackoverflow.com/a/12531813/901680
	google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
		if (mapZoom != map.getZoom()) {
			mapZoom = (map.getZoom() - 1);
			map.setZoom(mapZoom);
		}
	});
}

// Offsets the MAP - http://stackoverflow.com/a/10722973/901680
function map_recenter(latlng, offsetx, offsety) {
	var point1 = map.getProjection().fromLatLngToPoint(
		(latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
	);
	var point2 = new google.maps.Point(
		( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
		( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
	);
	map.setCenter(map.getProjection().fromPointToLatLng(new google.maps.Point(
		point1.x - point2.x,
		point1.y + point2.y
	)));
}

function createSidebarElement(marker, info) {
	//Creates a sidebar button
	var ul = document.getElementById('sidebar');
	var li = document.createElement('li');
	var title = marker.getTitle();
	li.innerHTML = '<a id="' + marker.__gm_id + '" class="toggle">' + title + '</a><div class="hidden" style="display: none">' + info + '</div>';
	ul.appendChild(li);

	//Trigger a marker event when a sidebar item is acted on
	google.maps.event.addDomListener(li, 'click', function () {
		google.maps.event.trigger(marker, 'click');
	});

	google.maps.event.addDomListener(li, 'mouseover', function () {
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].title === title) {
				google.maps.event.trigger(markers[i], 'mouseover');
			}
		}
	});

	google.maps.event.addDomListener(li, 'mouseout', function () {
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].title === title) {
				google.maps.event.trigger(markers[i], 'mouseout');
			}
		}
	});
}

function removeSidebarElements() {
	var myNode = document.getElementById('sidebar');
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

// Load markers via Ajax
(function ($) {

	// Simulate clicking first element 1 second after loading page
	$(window).bind("load", function () {
		setTimeout(function () {
			$("input:checkbox:first").trigger('click');
			var request = {
				'option'      : 'com_mapnavigator',
				'format'      : 'json',
				'categories[]': $("input:checkbox:first").val(),
				'location'    : $('input:radio:checked').val()
			};
			loadMarkers(request);
		}, 1000);
	});

	$(document).on('click', 'form input', function () {
		// Instantiate request object
		var request = {
			'option'  : 'com_mapnavigator',
			'format'  : 'json',
			'location': $('input[name=location]:checked').val(),
			'region'  : $('input[name=region]:checked').val()
		};

		// Append categories of checked boxed to request object
		request.categories = [];
		$('input.filters:checked').each(function (i) {
			request.categories[i] = $(this).val();
		});

		loadMarkers(request);
	});

	function loadMarkers(request) {
		// Create new bounds object when loading new markers
		bounds = new google.maps.LatLngBounds();
		$.ajax({
			type   : 'POST',
			data   : request,
			format : 'json',
			success: function (response) {
				deleteMarkers();
				removeSidebarElements();
				var markers = eval('(' + response + ')');
				for (var key in markers) {
					if (markers.hasOwnProperty(key)) {

						// Append image to introtext if item has an image defined
						if (markers[key].hasOwnProperty("image")) {
							markers[key].info = '<img src="' + markers[key].image + '"/>' + markers[key].info;
						}

						// Calculate Google Maps latitude and longitude
						var location = new google.maps.LatLng(markers[key].lat, markers[key].lng);
						addMarker(location, markers[key].title, markers[key].info, markers[key].type);
					}
				}
			}
		});
	};

})(jQuery)
