$(function () {
    $.ajaxSetup({
        headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
});

$("#menu-toggler").click(function(e) {
    e.preventDefault();
    $("#sidebar-wrapper").addClass("toggled");
    $("#sidebar-content-ajouter").hide();
    $("#sidebar-content-editer").hide();
});

$("#close-menu-btn").click(function(e) {
    e.preventDefault();
    if($('#nav-pill-editer').hasClass("active")) {
        $('#nav-pill-filtrer').addClass("active");
        $('#nav-pill-editer').removeClass("active").addClass("disabled");
        $('#sidebar-content-editer').hide();
        $('#sidebar-content-filtrer').show();
    }
    $("#sidebar-wrapper").removeClass("toggled");
});

$(document).click(function (e){
    if(!($(e.target).is(':button') || $(e.target).is(".glyphicon-menu-hamburger"))) {
        if($("#sidebar-wrapper.toggled").length > 0 & !$(e.target).is('#sidebar-wrapper *')) {
            if($('#nav-pill-editer').hasClass("active")) {
                $('#nav-pill-filtrer').addClass("active");
                $('#nav-pill-editer').removeClass("active").addClass("disabled");
                $('#sidebar-content-editer').hide();
                $('#sidebar-content-filtrer').show();
            }
            $('#sidebar-wrapper').removeClass("toggled");
        }
    }
});

$("#sidebar-nav-pills li").click(function(e) {
    if(!$(this).hasClass("disabled")) {
    	e.preventDefault();
    	$("#sidebar-nav-pills li").removeClass("active");
    	$(".sidebar-content").hide();

    	$(this).addClass("active");
    	var pillTitle = $(this).attr('id').split('-')[2];
    	var selector = "#sidebar-content-" + pillTitle;
    	$(selector).show();
    }
});

// Callback for click on edit button of info div
function openEditTab() {
    // open tab, enable nav-pill...
    $('#sidebar-wrapper').addClass("toggled");
    $('#sidebar-wrapper').show("slide", { direction: "right" }, 500);
    $('.sidebar-tab').removeClass("active");
    $('#nav-pill-editer').addClass("active").removeClass("disabled");
    $('.sidebar-content').hide();
    $('#sidebar-content-editer').show();

    // put pk value in disabled text input (debug)
    var pk = $('#pk-data').attr("data-pk");
    $('#c_pk').val(pk).prop('disabled', true);

    // Prefill form with Ecole info
    var ecole_to_edit = json_db_data[pk - 1].fields;
    $('#editer_form #c_nom').val(ecole_to_edit.nom);
    $('#editer_form #c_ville').val(ecole_to_edit.ville); 
    $('#editer_form #c_adresse').val(ecole_to_edit.adresse); 
    $('#editer_form #c_type option[value=\"' + ecole_to_edit.type + '\"]').attr('selected','selected');
    $('#editer_form #c_programmes').val(ecole_to_edit.programmes);  
    $('#editer_form #c_particularites').val(ecole_to_edit.particularites);      
}

// Submit ajouter_form
$('#ajouter_form').on('submit', function(event){
    event.preventDefault();
    ajouter_ecole(this);
    this.reset();
});

// Submit editer_form
$('#editer_form').on('submit', function(event){
    event.preventDefault();
    editer_ecole(this);
    this.reset();
});

// AJAX for adding an Ecole
function ajouter_ecole(form) {
    var data = {};
    $.each(form.elements, function(index, el){
        var input = $(el);
        if (input.attr("name") === "type") {
            data["type"] = input.find(":selected").text();
        }
        else
            data[input.attr("name")] = input.val();
        delete data["undefined"];
    });

    data["pk"] = json_db_data.length + 1;

    //get latitude and longitude of Ecole
    var adresse = data["adresse"];
    geocoder.geocode({'address': adresse}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var latLng = results[0].geometry.location;

            $.ajax({
                url : "ajout/", // the endpoint
                type : "POST", // http method
                data : {content: JSON.stringify(data) },

                // handle a successful response
                success : function(json) {
                    ecole_data = JSON.parse(json);
                    if(ecole_data[0] !== "already created" || ecole_data[0] != "incomplete data") {
                        createMarker(ecole_data[0].fields, data["pk"]);
                    }
                },

                // handle a non-successful response
                error : function(xhr, errmsg, err) {
                    $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                        " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
                    console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
                }
            });
        }
        else alert("Impossible de trouver les coordonnées! L'adresse doit être invalide.");
    });
};

// AJAX for editing an Ecole
function editer_ecole(form) {
    var data = {};
    $.each(form.elements, function(index, el){
        var input = $(el);
        data[input.attr("name")] = input.val();
        delete data["undefined"];
    });

    $.ajax({
        url : "edit/", // the endpoint
        type : "POST", // http method
        data : {content: JSON.stringify(data)},

        // handle a successful response
        success : function(json) {
            // disable edit tab
            $('#nav-pill-filtrer').addClass("active");
            $('#nav-pill-editer').removeClass("active").addClass("disabled");
            $('#sidebar-content-editer').hide();
            $('#sidebar-content-filtrer').show();

            var adresse = data["adresse"];
            geocoder.geocode({'address': adresse}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var latLng = results[0].geometry.location;
                    marker.position = latLng;
                }
            });

            // update marker infowindow
            var marker = markers[data["pk"] - 1];
            marker.nom = data["nom"];
            marker.ville = data["ville"];
            marker.adresse = data["adresse"];
            marker.type = data["type"];
            marker.programmes = data["programmes"];
            marker.particularites = data["particularites"];

            //create new updated info-div
            infowindow.close();
            var div = createInfoDiv(marker);
            infowindow.setContent(div.html());
            infowindow.open(map,marker);
        },

        // handle a non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
};


