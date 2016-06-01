/**
 * function called when submitting the form to add an Ecole
 * @param  {DOM form} form: the form used to add an Ecole
 * @jQuery form: $("#ajouter_form")
 */
function ajouter_ecole(form) {
	var form_data = getFormInputsAsObject(form);
    // add pk by hand, it is calculated
    form_data["pk"] = json_db_data.length + 1;

    //get latitude and longitude of Ecole by address
    var adresse = form_data["adresse"];
    geocoder.geocode(	{'address': adresse}, 
    					sendAddAJAXRequest(results, status));
};

/**
 * function called when submitting the form to edit an Ecole
 * @param  {DOM form} form: the form used to edit an Ecole
 * @jQuery form: $("#editer_form")
 */
function editer_ecole(form) {
	form_data = getFormInputsAsObject(form);
    // send ajax request to views.py at url edit/,
    // send form data to views.py to update the DB data
    console.log("envoi d'une requête AJAX vers edit");
    $.ajax({
        url : "edit/", // the endpoint
        type : "POST", // http method
        data : {content: JSON.stringify(form_data)},

        success : updateDataWithNewInfo(json);
    });
};

// create a JS object with sent form data
function getFormInputsAsObject(form) {
    var data = {};
    $.each(form.elements, function(index, el){
        var input = $(el);
        if (input.attr("name") === "type")
            data["type"] = input.find(":selected").text();
        else if (input.attr("name") == "visite")
        	data[input.attr("name")] = input.is(":checked");  
        else
            data[input.attr("name")] = input.val();

        delete data["undefined"];
    });
    return data;
}

// send ajax request to ajout/ (AjouterEcole view) if latlng found from address
function sendAddAJAXRequest(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        var latLng = results[0].geometry.location;

        // if could retrieve lat and lng, send post request to views.py at url ajout/
        // send form data in order to create a DB object with them
        $.ajax({
            url : "ajout/", // the endpoint
            type : "POST", // http method
            data : { content: JSON.stringify(form_data) },

            // if object was successfully created by Django, 
            // create a marker and show it on the map
            // @param json: the data returned in response from views.py 
            success : function(json) {
                ecole_data = JSON.parse(json);
                if(ecole_data[0] !== "already created" || ecole_data[0] != "incomplete data") {
                    createMarker(ecole_data[0].fields, form_data["pk"]);
                    setJsonDBData();
                }
            }
        });

    }
    else alert("Impossible de trouver les coordonnées! L'adresse doit être invalide.");  
}

// Update Json_db_data content
function setJsonDBData() {
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

// Update marker info, infowindow and json_db_data
function updateDataWithNewInfo(json) {
    // disable and hide edit tab and content
    $('#nav-pill-filtrer').addClass("active");
    $('#nav-pill-editer').removeClass("active").addClass("disabled");
    $('#sidebar-content-editer').hide();
    $('#sidebar-content-filtrer').show();

    var marker = getMarkerFromId(data["pk"]);

    updateMarker(marker, data);
    updateInfoWindow(marker);
    setJsonDBData();    
}


