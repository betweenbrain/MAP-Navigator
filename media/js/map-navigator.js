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
var bounds, infoWnd, map, markerCluster, mapZoom, purpleDot, redDot;
var markers = [];

//set style options for marker clusters (ordered according to increasing cluster size, smallest first)
var mcOptions = { styles: [
	{
		height   : 28,
		width    : 28,
		textColor: '#8a2b87',
		textSize : 12,
		url      : "http://media.guggenheim.org/map-navigator/cluster.png"
	},
	{
		height   : 28,
		width    : 28,
		textColor: '#ff0000',
		textSize : 24,
		url      : "http://media.guggenheim.org/map-navigator/cluster.png"
	}
]};


function initialize() {
	infoWnd = new google.maps.InfoWindow();

	var mapOptions = {
		zoom     : 2,
		center   : new google.maps.LatLng(0, 0),
		mapTypeId: 'roadmap',
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	markerCluster = new MarkerClusterer(map, markers, mcOptions);

	purpleDot = {
		path        : google.maps.SymbolPath.CIRCLE,
		scale       : 2,
		fillColor   : '#8a2b87',
		fillOpacity : 1,
		strokeColor : '#8a2b87',
		strokeWeight: 2
	};

	redDot = {
		path        : google.maps.SymbolPath.CIRCLE,
		scale       : 2,
		fillColor   : '#ff0000',
		fillOpacity : 1,
		strokeColor : '#ff0000',
		strokeWeight: 2
	};

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

	// Adds My Location button is geolocation is supported by the browser
	if (navigator.geolocation) {

		var toolbar = document.getElementById('toolbar');
		var button = document.createElement('button');
		button.innerHTML = 'My Location';
		toolbar.appendChild(button);

		button.addEventListener("click", function (event) {
			navigator.geolocation.getCurrentPosition(function (position) {
				initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				map.setCenter(initialLocation);

				// Conditionally zoom in
				if (map.getZoom() < 5) {
					map.setZoom(map.getZoom() + 1);
				}
			});

			event.preventDefault();
		});

		// Adds custom zoom buttons
		var button = document.createElement('button');
		button.className = 'zoom in';
		button.innerHTML = 'Zoom In';
		toolbar.appendChild(button);

		button.addEventListener("click", function (event) {
			map.setZoom(map.getZoom() + 1);
			event.preventDefault();
		});

		var button = document.createElement('button');
		button.className = 'zoom out';
		button.innerHTML = 'Zoom Out';
		toolbar.appendChild(button);

		button.addEventListener("click", function (event) {
			map.setZoom(map.getZoom() - 1);
			event.preventDefault();
		});
	}

	// Event driven zoom based marker icons
	google.maps.event.addListener(map, 'zoom_changed', function () {
		for (var i = 0; i < markers.length; i++) {
			if (map.getZoom() < 5) {
				markers[i].setIcon(purpleDot);
			} else {
				markers[i].setIcon('http://media.guggenheim.org/map-navigator/' + markers[i].type + '.png');
			}
		}


	});
}

// Add a marker to the map and push to the array.
function addMarker(location, title, info, type) {
	var marker = new google.maps.Marker({
		position: location,
		map     : map,
		title   : title,
		icon    : 'http://media.guggenheim.org/map-navigator/' + type + '.png'
	});

	// Add type to marker object for later reuse
	marker.type = type;

	// Extend boundaries to fit new markers
	// var location = new google.maps.LatLng(markers[key].lat, markers[key].lng);
	bounds.extend(location);

	google.maps.event.addListener(marker, 'mouseover', function () {

		// Zoom based marker icons
		if (map.getZoom() < 5) {
			marker.setIcon(redDot);
		} else {
			marker.setIcon('http://media.guggenheim.org/map-navigator/' + type + '-hover.png');
		}
	});

	google.maps.event.addListener(marker, 'mouseout', function () {

		// Zoom based marker icons
		if (map.getZoom() < 5) {
			marker.setIcon(purpleDot);
		} else {
			marker.setIcon('http://media.guggenheim.org/map-navigator/' + type + '.png');
		}
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

	/*
	var c = map.getCenter();
	map_recenter(c, 150, 0);

	// Forces MAP to zoom out one level to accommodate bounds offset - http://stackoverflow.com/a/12531813/901680
	google.maps.event.addListenerOnce(map, 'bounds_changed', function () {
		if (mapZoom != map.getZoom()) {
			mapZoom = (map.getZoom() - 1);
			map.setZoom(mapZoom);
		}
	});
	*/
}

// Offsets the MAP - http://stackoverflow.com/a/10722973/901680
/*
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
*/

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
		}, 1500);
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

				// Clear existing clusters
				markerCluster.clearMarkers();

				// Clear existing markers array
				for (var i = 0; i < markers.length; i++) {
					markers[i].setMap(null);
				}

				// Initialize new, empty markers array
				markers = [];

				// Clear sidebar elements
				var sidebar = document.getElementById('sidebar');
				while (sidebar.firstChild) {
					sidebar.removeChild(sidebar.firstChild);
				}

				var locations = eval('(' + response + ')');

				// Create markers array
				for (var key in locations) {
					if (locations.hasOwnProperty(key)) {

						// Append image to introtext if item has an image defined
						if (locations[key].hasOwnProperty("image")) {
							locations[key].info = '<img src="' + locations[key].image + '"/>' + locations[key].info;
						}

						// Calculate Google Maps latitude and longitude
						var location = new google.maps.LatLng(locations[key].lat, locations[key].lng);
						addMarker(location, locations[key].title, locations[key].info, locations[key].type);
					}
				}

				// Add new marker clusters now that we've created the markers array
				markerCluster.addMarkers(markers);
			}
		});
	};

})(jQuery)
