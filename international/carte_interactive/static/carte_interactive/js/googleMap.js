/**
 * Global variables
 */
var map; 			// the actual google map
var infowindow; 	// the window that appears on marker hover
var geocoder; 		// the API object that allows to finc latLng from address
var json_db_data;	// the Ecole json data retrieved from Django DB
var markers = [];	// the google maps markers
var iconBase = '../../static/carte_interactive/img/marker_'; // relative url to marker icons
var icons = { 		//icon urls depending on Ecole type
  U:    { icon: iconBase + 'U.png' },
  IUT:  { icon: iconBase + 'IUT.png' },
  EI:   { icon: iconBase + 'EI.png' },
  EC:   { icon: iconBase + 'EC.png' }
};

/**
 * Callback to initialize the Google Maps map, 
 * called in body onload in layout.html
 */
function initMap() {
	geocoder = new google.maps.Geocoder();
	var mapDiv = document.getElementById('map');
	// set map variable and attributes
	map = new google.maps.Map(mapDiv, {
	  center: {lat: 47.081012, lng: 2.3522219},
	  zoom: 6
	});
	// create empty infoWindow variable, fill it later
	infowindow = new google.maps.InfoWindow({
		content: ""
	 });
	// hide the infowindow div element
	$(".info-div").hide();
	// Google Map styling, 
	// found at https://snazzymaps.com/style/25/blue-water
	map.set('styles',
	[
		{
			"featureType": "administrative",
			"elementType": "labels.text.fill",
			"stylers": [ { "color": "#444444" } ]
		},
		{
			"featureType": "landscape",
			"elementType": "all",
			"stylers": [{"color": "#f2f2f2"}]
		},
		{
			"featureType": "poi",
			"elementType": "all",
			"stylers": [{"visibility": "off"}]
		},
		{
			"featureType": "road",
			"elementType": "all",
			"stylers": [{"saturation": -100},
						{"lightness": 45} ]
		},
		{
			"featureType": "road.highway",
			"elementType": "all",
			"stylers": [{"visibility": "simplified"}]
		},
		{
			"featureType": "road.arterial",
			"elementType": "labels.icon",
			"stylers": [{"visibility": "off"}]
		},
		{
			"featureType": "transit",
			"elementType": "all",
			"stylers": [{"visibility": "off"}]
		},
		{
			"featureType": "water",
			"elementType": "all",
			"stylers": [{"color": "#46bcec"},
						{"visibility": "on"} ]
			}
		]);

	// fetch json data from url and create marker for each object found
	$.ajax({
		url: "../../static/carte_interactive/json/data.json",
		success: function (data) {
			json_db_data = JSON.parse(data);
			json_db_data.forEach(function(ecole) {
				createMarker(ecole.fields, ecole.pk);
			});
		}
	});

	// create legend for each icon types used (see icons object above)
	var legend = $("#legend");
	for (var type in icons) {
		var type = type;
		var icon = icons[type].icon;
		var div = document.createElement('div');
		div.innerHTML = '<img src="' + icon + '" style="width: 24px; height: 24px;"> ' + type;
		legend.append(div);
	}
}


/**
 * Used to create a marker with ecole_data and pk,
 * show it on the map and add listeners to it
 * @param  {Object} ecole_data object with key value pairs containing Ecole data
 * @param  {int} 	pk         primary key of created Ecole data
 */
function createMarker(ecole_data, pk) {
	// used to get the abbreviation type (eg. U, IUT, EC or EI),
	// instead of Universite, Ecole de commerce etc.
	// The format is either, for instance, 'U', or 'University (U)', and we only want 'U'
    if(ecole_data.type.indexOf('(') == -1)
        var marker_icon = icons[ecole_data.type].icon;
    else
        var marker_icon = icons[get_substring(ecole_data.type, '(', ')')].icon;

    // get latitude and longitude from address of newly created Ecole
    // if it succeeds, create a marker with the data sent in parameters
    var adresse = ecole_data.adresse;
    geocoder.geocode({'address': adresse}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var latLng = results[0].geometry.location;
            var marker = new google.maps.Marker({
                position: latLng,
                animation: google.maps.Animation.DROP,
                icon: marker_icon,
                nom: ecole_data.nom,
                ville: ecole_data.ville,
                adresse: ecole_data.adresse,
                type: ecole_data.type,
                programmes: ecole_data.programmes,
                particularites: ecole_data.particularites,
                pk: pk
            });
            marker.setMap(map);
            markers.push(marker);
            var wasClicked = false;

            google.maps.event.addListener(marker, 'mouseover', function(e) {
                var div = createInfoDiv(marker);
                infowindow.setContent(div.html());
                infowindow.open(map,marker);
            });

            google.maps.event.addListener(marker, 'click', function(e) {
                wasClicked = true;
            });
            google.maps.event.addListener(marker, 'mouseout', function(e) {
                if(!wasClicked)
                    infowindow.close();
            });
        }
        else alert("Impossible de trouver la position de l'école " + ecole_data.nom);
    });
}

/**
 * Creates the div DOM element from which the html will be appended to the infowindow
 * @param  {google.maps.Marker} marker The marker corresponding to the infowindow we want to show
 */
function createInfoDiv(marker) {
    var div = $(".info-div");
    div.empty();
    div.append("<h4 id=\"info-title\">" + marker.nom + " (" + marker.ville + ")</h4>");
    div.append('<button id="edit-btn" onclick="javascript:openEditTab()" type="button" class="info-btn btn btn-xs btn-warning">&#9998;</button>');
    div.append("<p id=\"info_programmes\">Programmes: " + marker.programmes + "</p>");
    div.append("<span id=\"pk-data\" data-pk=\"" + marker.pk + "\"></span>");
    if(marker.particularites) {
        div.append("<p id=\"info_particularites\"><span id=\"star-icon\" style=\"color: #0BE613\" class=\"glyphicon glyphicon-star-empty\"></span>" +
                    marker.particularites + "</p>");
    }
    return div;
}

/**
 * small utility function to retrieve substring inbetween two characters or strings
 * @param  {string} str   the string we want to get the substring from
 * @param  {string} start the first character or string that delimitates the wanted substring
 * @param  {string} end   the last character or string that delimitates the wanted substring
 * @return {string}       The substring
 */
function get_substring(str, start, end) {
    return str.substring(str.lastIndexOf(start)+1,str.lastIndexOf(end));
}