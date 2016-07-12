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
            console.log("edit success!");
        	var updated_data = json[0].fields;
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
        // Different ways to get input values from html elements
        // Checkbox:
        if (input.attr("name") == "visite")
            data[input.attr("name")] = input.is(":checked"); 
        else
            data[input.attr("name")] = input.val();

        delete data["undefined"];
    });
    return data;
}

// Update Json_db_data content
function setJsonDBData() {
    $.ajax({
        url: "getData/",
        type: 'GET',
        data : {content: ""},
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