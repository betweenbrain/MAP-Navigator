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
var artistIcon, artistHoverIcon, audioIcon, audioHoverIcon, blogIcon, blogHoverIcon, eventIcon, eventHoverIcon, resourceIcon, resourceHoverIcon, videoIcon, videoHoverIcon, bounds, element, i, infoWnd, map, markerCluster, dot, dotHover;
var markers = [];

//set style options for marker clusters (ordered according to increasing cluster size, smallest first)
var mcOptions = { styles: [
	{
		height            : 30,
		width             : 30,
		textColor         : '#8a2b87',
		textSize          : 12,
		url               : 'http://media.guggenheim.org/map-navigator/sprite.png',
		backgroundPosition: "0px -120px"
	}
],
	zoomOnClick         : false,
	maxZoom             : 18
};

var globalStyles = [
	{
		featureType: 'all',
		stylers    : [
			{ visibility: 'off' }

		]
	},
	{
		featureType: 'water',
		stylers    : [
			{ visibility: 'on' },
			{ color: '#ffffff' }
		]
	},
	{
		featureType: 'administrative.country',
		elementType: "labels.text.fill",
		stylers    : [
			{ visibility: 'simplifed' },
			{ color: '#888888' },
			{ weight: 1 }
		]
	},
	{
		featureType: 'administrative.locality',
		elementType: "labels.text.fill",
		stylers    : [
			{ visibility: 'simplifed' },
			{ color: '#888888' },
			{ weight: 1 }
		]
	}
];

var cityStyles = [
	{
		featureType: 'all',
		stylers    : [
			{ visibility: 'off' }

		]
	},
	{
		featureType: 'water',
		stylers    : [
			{ visibility: 'on' },
			{ color: '#ffffff' }
		]
	},
	{
		featureType: 'administrative.country',
		elementType: "labels.text.fill",
		stylers    : [
			{ visibility: 'simplifed' },
			{ color: '#888888' },
			{ weight: 1 }
		]
	},
	{
		featureType: 'administrative.locality',
		elementType: "labels.text.fill",
		stylers    : [
			{ visibility: 'simplifed' },
			{ color: '#888888' },
			{ weight: 1 }
		]
	},
	{
		featureType: 'road.arterial',
		stylers    : [
			{ visibility: 'on' }
		]
	},
	{
		featureType: 'road.local',
		stylers    : [
			{ visibility: 'on' }
		]
	},
	{
		featureType: 'poi.attraction',
		stylers    : [
			{ visibility: 'on' }
		]
	}
];

function initialize() {

	infoWnd = new google.maps.InfoWindow();

	var mapOptions = {
		zoom            : 2,
		minZoom         : 2,
		center          : new google.maps.LatLng(0, 0),
		mapTypeId       : 'roadmap',
		disableDefaultUI: true
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

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

	artistIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(33, 153),
		anchor: new google.maps.Point(13, 13)
	};

	artistHoverIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(63, 153),
		anchor: new google.maps.Point(13, 13)
	};

	audioIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(483, 153),
		anchor: new google.maps.Point(13, 13)
	};

	audioHoverIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(513, 153),
		anchor: new google.maps.Point(13, 13)
	};

	blogIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(123, 153),
		anchor: new google.maps.Point(13, 13)
	};

	blogHoverIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(153, 153),
		anchor: new google.maps.Point(13, 13)
	};

	eventIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(212, 153),
		anchor: new google.maps.Point(13, 13)
	};

	eventHoverIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(242, 153),
		anchor: new google.maps.Point(13, 13)
	};

	resourceIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(392, 153),
		anchor: new google.maps.Point(13, 13)
	};

	resourceHoverIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(422, 153),
		anchor: new google.maps.Point(13, 13)
	};

	videoIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(302, 153),
		anchor: new google.maps.Point(13, 13)
	};

	videoHoverIcon = {
		url   : 'http://media.guggenheim.org/map-navigator/sprite.png',
		size  : new google.maps.Size(26, 26),
		origin: new google.maps.Point(332, 153),
		anchor: new google.maps.Point(13, 13)
	};

	markerCluster = new MarkerClusterer(map, markers, mcOptions);

	map.setOptions({styles: globalStyles});

	// Adds My Location button is geolocation is supported by the browser
	if (navigator.geolocation) {

		var toolbar = document.getElementById('toolbar');
		element = document.createElement('label');
		element.className = 'my-location';
		element.title = "My Location";
		element.innerHTML = '<input type="button" name="my-location">My Location';
		toolbar.appendChild(element);

		element.addEventListener("click", function (event) {
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
		element = document.createElement('label');
		element.className = 'zoom-in';
		element.title = "Zoom In";
		element.innerHTML = '<input type="button" name="zoom-in">Zoom In';
		toolbar.appendChild(element);

		element.addEventListener("click", function (event) {
			map.setZoom(map.getZoom() + 1);
			event.preventDefault();
		});

		element = document.createElement('label');
		element.className = 'zoom-out';
		element.title = "Zoom Out";
		element.innerHTML = '<input type="button" name="zoom-out">Zoom Out';
		toolbar.appendChild(element);

		element.addEventListener("click", function (event) {
			map.setZoom(map.getZoom() - 1);
			event.preventDefault();
		});
	}

	// Custom marker cluster click event
	google.maps.event.addListener(markerCluster, 'clusterclick', function (cluster) {
		map.setCenter(cluster.getCenter());
		if (map.getZoom() > 12) {
			map.setZoom(map.getZoom() + 4);
		} else {
			map.setZoom(map.getZoom() + 7);
		}
	});

	// Event driven zoom based marker icons
	google.maps.event.addListener(map, 'zoom_changed', function () {
		for (i = 0; i < markers.length; i++) {
			if (map.getZoom() < 5) {
				markers[i].setIcon(dot);
			} else {
				markers[i].setIcon(window[markers[i].category + 'Icon']);
			}
		}

		if (map.getZoom() < 5) {
			map.setOptions({styles: globalStyles});
		} else {
			map.setOptions({styles: cityStyles});
		}
	});
}


// Add a marker to the map and push to the array.
function addMarker(location, object) {

	// Modified from http://stackoverflow.com/a/9143850/901680
	/*
	var lng_radius = 0.00007,         // degrees of longitude separation
		lat_to_lng = 111.23 / 71.7,  // lat to long proportion in Warsaw
		angle = 0.25,                 // starting angle, in radians
		lat_radius = lng_radius / lat_to_lng;

	for (i = 0; i < markers.length; i++) {
		var pos = markers[i].getPosition();

		if (location.equals(pos)) {

			var lat = location.A + (Math.cos(angle) * lng_radius);
			var lng = location.k + (Math.sin(angle) * lat_radius);

			angle += 2 * Math.PI / i;

			location = new google.maps.LatLng(lng, lat);

		}
	}
	*/

	var marker = new google.maps.Marker({
		position: location,
		map     : map,
		title   : object.title,
		icon    : window[object.category + 'Icon'],
		alias   : object.alias,
		category: object.category,
		type    : object.type,
		text    : object.info
	});

	// Extend boundaries to fit new markers
	// var location = new google.maps.LatLng(markers[key].lat, markers[key].lng);
	bounds.extend(location);

	google.maps.event.addListener(marker, 'mouseover', function () {
		marker.setIcon(window[marker.category + 'HoverIcon']);
	});

	google.maps.event.addListener(marker, 'mouseout', function () {
		// Zoom based marker icons
		if (map.getZoom() < 5) {
			marker.setIcon(dot);
		} else {
			marker.setIcon(window[marker.category + 'Icon']);
		}
	});

	google.maps.event.addListener(marker, 'click', function () {
		// Elegantly recenter MAP when clicking marker
		map.panTo(marker.getPosition());

		// Move to first of list and expand sidebar text when clicking marker
		(function ($) {
			$('.' + marker.alias).prependTo('#sidebar');
			$('.' + marker.alias).find('.toggle').toggle(function () {
				$('.toggle:visible').not(this).hide();
			});
		})(jQuery)

		// Set and display infowindow
		infoWnd.setContent(marker.title + '<img src="http://media.guggenheim.org/map-navigator/' + marker.type + '.png"/>');
		infoWnd.open(map, marker);
	});

	// Check if marker has already been pushed to the markers title array
	if (markers[marker.title] !== marker.title) {
		createSidebarElement(marker);
	}

	// Push to the markers title array
	markers[marker.title] = marker.title;

	// Push new marker
	markers.push(marker);

	// Push new boundaries
	map.fitBounds(bounds);
}

function createSidebarElement(marker) {
	//Creates a sidebar button
	var ul = document.getElementById('sidebar');
	var li = document.createElement('li');
	li.className = 'toggler ' + marker.category;
	var title = marker.getTitle();
	li.innerHTML = '<a>' + marker.title + '</a><div class="toggle" style="display: none">' + marker.text + '</div>';
	ul.appendChild(li);

	//Trigger a marker event when a sidebar item is acted on
	google.maps.event.addDomListener(li, 'click', function () {
		google.maps.event.trigger(marker, 'click');
		map.setZoom(19);
	});

	google.maps.event.addDomListener(li, 'mouseover', function () {
		for (i = 0; i < markers.length; i++) {
			if (markers[i].title === title) {
				google.maps.event.trigger(markers[i], 'mouseover');
			}
		}
	});

	google.maps.event.addDomListener(li, 'mouseout', function () {
		for (i = 0; i < markers.length; i++) {
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
					for (i = 0; i < markers.length; i++) {
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
							addMarker(location, locations[key]);
						}
					}

					// Add new marker clusters now that we've created the markers array
					markerCluster.addMarkers(markers);
				}
			}
		});
	}

	$(document).on('change', '.toggle-btn-group input[type=radio]', function () {
		if (this.checked) {
			$('input[name="' + this.name + '"].checked').removeClass('checked');
			$(this).addClass('checked');
		}
	});

})(jQuery);
