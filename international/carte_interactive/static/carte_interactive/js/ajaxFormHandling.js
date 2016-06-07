/**
 * function called when submitting the form to add an Ecole
 * @param  {DOM form} form: the form used to add an Ecole
 * @jQuery form: $("#ajouter_form")
 */
function ajouter_ecole(form) {
	var form_data = getFormInputsAsObject(form);
    // add pk by hand, it is calculated
    form_data["pk"] = json_db_data.length + 1;
    // check if address is valid. If so, send AJAX request to ajout/
    var adresse = form_data["adresse"];
    geocoder.geocode(	{'address': adresse}, function(results, status) {
    	if (status == google.maps.GeocoderStatus.OK) {
	        sendAddAJAXRequest(form_data);
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
	form_data = getFormInputsAsObject(form);
    // send ajax request to views.py at url edit/,
    // send form data to views.py to update the DB data
    $.ajax({
        url : "edit/", // the endpoint
        type : "POST", // http method
        data : {content: JSON.stringify(form_data)},
        //received json is updated data from database
        success : function(json) {
        	var updated_data = json[0].fields;
        	console.log(updated_data.url);
        	updated_data["pk"] = json[0].pk;
        	updateDataWithNewInfo(updated_data)
        }
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
function sendAddAJAXRequest(form_data) {
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

// Update Json_db_data content
function setJsonDBData() {
	$.ajax({
		url: "../../static/carte_interactive/json/data.json",
		success: function (data) {
			try {
				$.parseJSON(data); //if this fails, data is already in json format
				json_db_data = JSON.parse(data);
			}
			catch(e) {
				json_db_data = data;
			}
		}
	});
}

// Update marker info, infowindow and json_db_data
function updateDataWithNewInfo(data) {
    // disable and hide edit tab and content
    $('#nav-pill-filtrer').addClass("active");
    $('#nav-pill-editer').removeClass("active").addClass("hidden");
    $('#sidebar-content-editer').hide().addClass("hidden");
    $('#sidebar-content-filtrer').show();

    var marker = getMarkerFromId(data["pk"]);
    updateMarker(marker, data);
    updateInfoWindow(marker);
    setJsonDBData();   
}


