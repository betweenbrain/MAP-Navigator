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
var bounds, infoWnd, map, markerCluster, mapZoom, dot, dotHover;
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
		zoom            : 2,
		maxZoom         : 8,
		minZoom         : 2,
		center          : new google.maps.LatLng(0, 0),
		mapTypeId       : 'roadmap',
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	markerCluster = new MarkerClusterer(map, markers, mcOptions);

	dot = {
		path        : google.maps.SymbolPath.CIRCLE,
		scale       : 2,
		fillColor   : '#8a2b87',
		fillOpacity : 1,
		strokeColor : '#8a2b87',
		strokeWeight: 2
	};

	dotHover = {
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
		button.innerHTML = '<img src="http://media.guggenheim.org/map-navigator/home.png" />';
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
		button.innerHTML = '<img src="http://media.guggenheim.org/map-navigator/plus.png" />';
		toolbar.appendChild(button);

		button.addEventListener("click", function (event) {
			map.setZoom(map.getZoom() + 1);
			event.preventDefault();
		});

		var button = document.createElement('button');
		button.className = 'zoom out';
		button.innerHTML = '<img src="http://media.guggenheim.org/map-navigator/minus.png" />';
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
				markers[i].setIcon(dot);
			} else {
				var markerIcon = {
					url   : 'http://media.guggenheim.org/map-navigator/' + markers[i].type + '.png',
					size  : new google.maps.Size(24, 24),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(12, 12)
				};
				markers[i].setIcon(markerIcon);
			}
		}
	});
}


// Add a marker to the map and push to the array.
function addMarker(location, title, info, type) {
	var markerIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/' + type + '.png',
		size  : new google.maps.Size(24, 24),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(12, 12)
	};
	var marker = new google.maps.Marker({
		position: location,
		map     : map,
		title   : title,
		icon    : markerIcon
	});

	// Add type to marker object for later reuse
	marker.type = type;

	// Extend boundaries to fit new markers
	// var location = new google.maps.LatLng(markers[key].lat, markers[key].lng);
	bounds.extend(location);

	google.maps.event.addListener(marker, 'mouseover', function () {
		var markerIcon = {
			url   : 'http://media.guggenheim.org/map-navigator/' + type + '-hover.png',
			size  : new google.maps.Size(24, 24),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(12, 12)
		};
		marker.setIcon(markerIcon);
	});

	google.maps.event.addListener(marker, 'mouseout', function () {

		// Zoom based marker icons
		if (map.getZoom() < 5) {
			marker.setIcon(dot);
		} else {
			marker.setIcon(markerIcon);
		}
	});

	google.maps.event.addListener(marker, 'click', function () {
		// Elegantly recenter MAP when clicking marker
		map.panTo(marker.getPosition());

		// Move to first of list and expand sidebar text when clicking marker
		(function ($) {
			$('#' + marker.__gm_id).parent().prependTo('#sidebar');
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

				if (response.length > 4) {

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
			}
		});
	};

})(jQuery)
