/**
 * Global variables
 */
  var debug_counter = 0;

var map; 			// the actual google map
var infowindow; 	// the window that appears on marker hover
var geocoder; 		// the API object that allows to finc latLng from address
var json_db_data;	// the Ecole json data retrieved from Django DB
var markers = [];	// the google maps markers
var iconBase = '../../static/carte_interactive/img/marker_'; // relative url to marker icons
var icons = { 		//icon urls depending on Ecole type
  U:    	{ icon: iconBase + 'U.png' },
  IUT:  	{ icon: iconBase + 'IUT.png' },
  EI:   	{ icon: iconBase + 'EI.png' },
  EC:   	{ icon: iconBase + 'EC.png' },
  A:        { icon: iconBase + 'A.png' },
  visité: 	{ icon: iconBase + 'V.png '}
};
// found at https://snazzymaps.com/style/25/blue-water
var styleConfig = [
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
		];

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
	map.set('styles', styleConfig);
	

	// fetch json data from url and create marker for each object found
	$.ajax({
		url: "../../static/carte_interactive/json/data.json",
		success: function (data) {
			try {
				$.parseJSON(data);
				json_db_data = JSON.parse(data);
			}
			catch(e) {
				json_db_data = data;
			}
			json_db_data.forEach(function(ecole, index) {
                //if(index == 150)
				createMarker(ecole.fields, ecole.pk);
			});
		}
	});
    

	createLegendWithIcons();
}

// create legend for each icon types used (see icons object above)
function createLegendWithIcons() {
	var legendDiv = $("#legend");
	for (var type in icons) {
		var type = type;
		var icon = icons[type].icon;
		var div = document.createElement('div');
		div.innerHTML = '<img src="' + icon + '" style="width: 24px; height: 24px;"> ' + type;
		legendDiv.append(div);
	}
}

/**
 * Used to create a marker with ecole_data and pk,
 * show it on the map and add listeners to it
 * @param  {Object} ecole_data object with key value pairs containing Ecole data
 * @param  {int} 	pk         primary key of created Ecole data
 */
function createMarker(ecole_data, pk) {
	if (ecole_data.visite) 
		var marker_icon = icons["visité"].icon;
	else
		// used to get the abbreviation type (eg. U, IUT, EC or EI),
		// instead of Universite, Ecole de commerce etc.
		// The format is either, for instance, 'U', or 'University (U)', and we only want 'U'
	    if(ecole_data.type.indexOf('(') == -1)
	        var marker_icon = icons[ecole_data.type].icon;
	    else
	        var marker_icon = icons[get_substring(ecole_data.type, '(', ')')].icon;

    // get latitude and longitude from address of newly created Ecole
    // if it succeeds, create a marker with the data sent in parameters
    var newCoordinates = false;
    var successful = false;
    var latitude = ecole_data.latitude;
    var longitude = ecole_data.longitude;
    var coordinates;
    if (!latitude || !longitude) {
        newCoordinates = true;
        var requestByName = {query: ecole_data.nom};
        serviceByName = new google.maps.places.PlacesService(map);
        serviceByName.textSearch(requestByName, callback);
    }
    else {
        coordinates = new google.maps.LatLng(latitude, longitude);
        setMarker();
    }
    
    
    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            coordinates = getCoordinatesFromQuery(results); 
            setMarker();
            successful = true;
        }
        else {
            coordinates = getCoordinatesFromGeocoder();
        }
    }

    function getCoordinatesFromGeocoder() {
        if(!latitude && !longitude && ecole_data.adresse) {
            var adresse = ecole_data.adresse;
            geocoder.geocode({'address': adresse}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var latLng = results[0].geometry.location;
                    latitude = latLng.lat();
                    longitude = latLng.lng();
                    successful = true;
                    coordinates = new google.maps.LatLng(latitude, longitude);
                    setMarker();
                }
                else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {    
                    setTimeout(function() {
                        getCoordinatesFromGeocoder();
                    }, 400);
                } else {
                    if(ecole_data.adresse) console.log(ecole_data.nom);
                    console.log("Geocoder n'a pas pu trouver l'adresse:" + ecole_data.adresse + " avec statut: " + status);
                }
            });
        }
    }
    
    function getCoordinatesFromQuery(results) {
        var place = results[0];
        var latLng = place.geometry.location;
        latitude = latLng.lat();
        longitude = latLng.lng();
        return new google.maps.LatLng(latitude, longitude);
    }

    function setMarker() {
        var marker = new google.maps.Marker({
            position: coordinates,
            animation: google.maps.Animation.DROP,
            icon: marker_icon,
            nom: ecole_data.nom,
            ville: ecole_data.ville,
            adresse: ecole_data.adresse,
            type: ecole_data.type,
            programmes_uqac: ecole_data.programmes_uqac,
            programmes_partenaires: ecole_data.programmes_partenaires,
            particularites: ecole_data.particularites,
            pk: pk,
            visite: ecole_data.visite,
            visite_date: ecole_data.visite_date
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
        if(successful && newCoordinates) {
            savePositionInEcole(marker);
        }
    }

    function savePositionInEcole(marker) {
        var position = {
            "pk": marker.pk,
            "latitude": marker.position.lat(),
            "longitude": marker.position.lng()
        };

        $.ajax({
            url : "savePosition/", // the endpoint
            type : "POST", // http method
            data : {content: JSON.stringify(position)},
            //received json as updated data from database
            success : function(response) {
                
            }
        });
    }
}

function updateMarker(marker, data) {
    marker.visite = data["visite"];
    marker.visite_date = data["visite_date"];

   	if(marker.visite)
   		marker.setIcon('../../static/carte_interactive/img/marker_V.png');
   	else {
   		if(marker.type.indexOf('(') != -1)
   			var ecole_type = get_substring(marker.type, '(', ')');
   		else
   			var ecole_type = marker.type;
   		marker.setIcon('../../static/carte_interactive/img/marker_' + ecole_type + '.png');
   	}

}

function getMarkerFromId(pk) {
	var marker;
	markers.forEach(function(m) {
    	if (m.pk === parseInt(pk))
    		marker = m;
    });
    return marker;
}

// create new updated info-div with the updated marker
function updateInfoWindow(marker) {
    infowindow.close();
    var div = createInfoDiv(marker);
    infowindow.setContent(div.html());
    infowindow.open(map,marker);
}

/**
 * Creates the div DOM element from which the html will be appended to the infowindow
 * @param  {google.maps.Marker} marker The marker corresponding to the infowindow we want to show
 */
function createInfoDiv(marker) {
    var div = $(".info-div");
    div.empty();
    // Title with city in parenthesis
    if(marker.nom_court) var nom_court = " ( " + marker.nom_court + " )";
    else nom_court = "";
    div.append("<h4 id=\"info-title\">" + marker.nom + nom_court + "</h4>");
    // Edit button at top-right corner of infowindow
    div.append('<button id="edit-btn" onclick="javascript:openEditTab()" type="button" class="info-btn btn btn-xs btn-warning">&#9998;</button>');
    // List of programs offered with this school
    if(marker.programmes_uqac) {
        div.append("<ul class=\"list-group\">");
        div.append("<li id=\"info_programmes_uqac\" class=\"list-group-item\" style=\"height: 30px; padding: 5px 15px;\"><b>Programmes UQAC:</b> " + marker.programmes_uqac + "</li>");
    }
    if(marker.programmes_partenaires)
        div.append("<li id=\"info_programmes_partenaires\" class=\"list-group-item\" style=\"height: 30px; padding: 5px 15px; margin-bottom: 5px;\"><b>Programmes partenaires:</b> " + marker.programmes_partenaires + "</li></ul>");
    else {
        $("#info_programmes_uqac").css({'margin-bottom': '5px'});
        div.append("</ul>");
    }
    // Data to be used by Javascript, not displayed onscreen
    div.append("<span id=\"pk-data\" data-pk=\"" + marker.pk + "\"></span>");
    // Particularities, if any, preceded my a green star
    if(marker.particularites) {
        div.append("<p id=\"info_particularites\"><span id=\"star-icon\" style=\"color: #0BE613\" class=\"glyphicon glyphicon-star-empty\"></span>" +
                    marker.particularites + "</p>");
    }
    // Toggle button to mark Ecole as visited or not
    // div.append("<label class=\"switch pull-right\"><input type=\"checkbox\"><div class=\"slider round\"></div></label>");
    if(marker.visite) {
    	div.append("<span class=\"label label-success pull-right\">Visitée</span>");
        if(marker.visite_date)
            div.append("<br/><small class=\"pull-right\">" + marker.visite_date + "</small>")
    }
    else {
    	div.append("<span class=\"label label-danger pull-right\">Non visitée</span>");
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