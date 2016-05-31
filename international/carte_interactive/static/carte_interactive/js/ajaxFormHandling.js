
/**
 * function called when submitting the form to add an Ecole
 * @param  {DOM form} form: the form used to add an Ecole
 * @jQuery form: $("#ajouter_form")
 */
function ajouter_ecole(form) {
	// create a JS object with sent form data
    var data = {};
    $.each(form.elements, function(index, el){
        var input = $(el);
        if (input.attr("name") === "type")
            data["type"] = input.find(":selected").text();
        else
            data[input.attr("name")] = input.val();
        delete data["undefined"];
    });
    // add pk by hand, it is calculated
    data["pk"] = json_db_data.length + 1;

    //get latitude and longitude of Ecole by address
    var adresse = data["adresse"];
    geocoder.geocode({'address': adresse}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var latLng = results[0].geometry.location;

            // if could retrieve lat and lng, send post request to views.py at url ajout/
            // send form data in order to create a DB object with them
            $.ajax({
                url : "ajout/", // the endpoint
                type : "POST", // http method
                data : { content: JSON.stringify(data) },

                // handle a successful response
                // if object was successfully created by Django, 
                // create a marker and show it on the map
                // @param json: the data returned in response from views.py 
                success : function(json) {
                    ecole_data = JSON.parse(json);
                    if(ecole_data[0] !== "already created" || ecole_data[0] != "incomplete data") {
                        createMarker(ecole_data[0].fields, data["pk"]);
                    }
                }
            });
            // Update Json_db_data content
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
				}
			});
        }
        else alert("Impossible de trouver les coordonnées! L'adresse doit être invalide.");
    });
};


/**
 * function called when submitting the form to edit an Ecole
 * @param  {DOM form} form: the form used to edit an Ecole
 * @jQuery form: $("#editer_form")
 */
function editer_ecole(form) {
	// create a JS object with sent form data
    var data = {};
    $.each(form.elements, function(index, el){
        var input = $(el);
        data[input.attr("name")] = input.val();
        // if Ecole was not visited, write nonVisite instead of visite
        if(input.attr("name") == "visite") {
        	data[input.attr("name")] = input.is(":checked");  
        }

        delete data["undefined"];
    });

    // send ajax request to views.py at url edit/,
    // send form data to views.py to update the DB data
    console.log("envoi d'une requête AJAX vers edit");
    $.ajax({
        url : "edit/", // the endpoint
        type : "POST", // http method
        data : {content: JSON.stringify(data)},

        // handle a successful response
        success : function(json) {
            // disable and hide edit tab and content
            $('#nav-pill-filtrer').addClass("active");
            $('#nav-pill-editer').removeClass("active").addClass("disabled");
            $('#sidebar-content-editer').hide();
            $('#sidebar-content-filtrer').show();

            // update marker information with form data
            var marker;
            markers.forEach(function(m) {
            	if(m.pk == data["pk"])
            		marker = m;
            });

            // get latitude and longitude from Ecole address,
            // update marker position accordingly. Might change or not.
            var adresse = data["adresse"];
            geocoder.geocode({'address': adresse}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var latLng = results[0].geometry.location;
                    marker.position = latLng;
                }
                else alert("Impossible de trouver les coordonnées! L'adresse doit être invalide.");
            });

            marker.nom = data["nom"];
            marker.ville = data["ville"];
            marker.adresse = data["adresse"];
            marker.type = data["type"];
            marker.programmes = data["programmes"];
            marker.particularites = data["particularites"];
            marker.visite = data["visite"];

           	if(marker.visite)
           		marker.setIcon('../../static/carte_interactive/img/marker_V.png');
           	else
           		marker.setIcon('../../static/carte_interactive/img/marker_' + get_substring(marker.type, '(', ')') + '.png');

            //create new updated info-div with the updated marker
            infowindow.close();
            var div = createInfoDiv(marker);
            infowindow.setContent(div.html());
            infowindow.open(map,marker);

            // Update Json_db_data content
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
				}
			});
        }
    });
};


