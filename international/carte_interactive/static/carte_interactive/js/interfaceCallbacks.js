/**
 * This auto-calling function allows the use of csrf tokens 
 * in forms submitted with javascript .on('submit',...)
 * Otherwise Django throws errors
 */
$(function () {
	$.ajaxSetup({
		headers: { "X-CSRFToken": getCookie("csrftoken") }
	});
    // for Bootstrap's DatePicker
    $('#datePicker')
        .datepicker({
            autoclose: true,
            format: 'dd-mm-yyyy'
        });
});

$(document).ready(function() {
    ReloadIfNeeded();
	 $("#input-4").fileinput({showCaption: false});

     if( !$("#c_visite").checked ) $("#datepickerDiv").hide();
     else $("#datepickerDiv").show();
});

/**
* display datepicker only if "visite" is true
*/
$('#c_visite').change(function(){
    this.checked ? $("#datepickerDiv").show(500) : $("#datepickerDiv").hide(500);
});

/**
 * Callback for submitting "ajouter_form", 
 * @location editer_ecole(form) => ajaxFormHandling.js
 */
$('#editer_form').on('submit', function(event){
    event.preventDefault();
    editer_ecole(this);
    this.reset();
});


/**
 * Used to rewrite data.xlsx file with Django and on success, update markers
 */
/*$("#upload_excel_btn").click(function(event) {
    console.log("submitting upload form with UpdateExcelAndMarkers");
    UpdateExcelAndMarkers();
});*/

/*$("#excel_upload_form").on('submit', function(event) {
    event.preventDefault();
    UpdateExcelAndMarkers();
    $(this).submit();
});*/

$("#reinit-btn").click(function(event) {
    if (confirm('Voulez-vous vraiment réinitialiser toutes les visites?')) {
        $.ajax({
            url : "reinit/",
            type : "POST",
            data : {content: ""},
            success : function(data) {
                data = JSON.parse(data);
                markers.forEach(function(marker, index) {
                    updateMarker(marker, data);
                });
                alert("Réinitialisation terminée!");
            }
        });
    } else {
        alert('Rien n\'a été modifié!');
    }
});


/**
 * @jQuery $("#menu-toggler"): button used to open the sidebar
 */
$("#menu-toggler").click(function(e) {
	e.preventDefault();
	$("#sidebar-wrapper").addClass("toggled");
	$("#sidebar-wrapper").show("slide", { direction: "left" }, 500);
	$("#sidebar-content-editer").hide();
});

/**
 * @jQuery $("#close-menu-btn"): button in the sidebar used to close it
 */
$("#close-menu-btn").click(function(e) {
	e.preventDefault();
    hideEditTabAndContent();
	// actually close the sidebar
	$("#sidebar-wrapper").removeClass("toggled");
	$("#sidebar-wrapper").hide("slide", { direction: "left" }, 600);
});


/**
 * document click handler allowing the sidebar to close 
 * when clicking anywhere on the page except the sidebar
 */
$(document).click(function (e){
	// when not clicking on the menu toggler
	// when the sidebar is actually open and when not clicking on the sidebar or its children
	if($("#sidebar-wrapper.toggled").length > 0 & !$(e.target).is('#sidebar-wrapper *')) {
		if(!($(e.target).is(':button') || $(e.target).is(".glyphicon-menu-hamburger") || 
            !$(e.target).is("#datepickerDiv"))) {
			hideEditTabAndContent();
			// actually close the sidebar
			$('#sidebar-wrapper').removeClass("toggled");
			$('#sidebar-wrapper').hide("slide", { direction: "left" }, 500);
		}
	}
	// when not clicking on the results sidebar nor the search bar
    if(!$(e.target).is('#results-container *') 
    	&& !$(e.target).is('#search_input *')
    	&& !$(e.target).is('.pac-container')) {
        $('#results-container').hide("slide", { direction: "right" }, 500);
    }
    
});

/**
 * @jQuery $("#close-results-btn"): button used to close the results sidebar
 */
$("#close-results-btn").click(function(e) {
    e.preventDefault();
    $("#results-container").hide("slide", { direction: "right" }, 500);
});

/**
 * @jQuery $("#sidebar-nav-pills li") nav pills in sidebar,
 * allows user to change tabs when clicking on enabled tabs
 */
$("#sidebar-nav-pills li").click(function(e) {
    e.preventDefault();
    $("#sidebar-nav-pills li").removeClass("active");
    $(".sidebar-content").hide();

    $(this).addClass("active");
    // same suffix for nav-pill title and sidebar-content title
    var pillTitle = $(this).attr('id').split('-')[2];
    var selector = "#sidebar-content-" + pillTitle;
    $(selector).show();
});


/**
 * detect when 'enter' is pressed in search bar. If pressed, call search function
 */
$("#search_input").keyup(function (e) {
    if (e.keyCode == 13) {
        search();
    }
});

/**
 * Detects any input entered in search bar. Call search on each input
 */
$('#search_input').on('input', function() {
    // if used on small viewport, search results hide 
    // search bar and it is inconvenient
    if ($(window).width() > 420){  
        search();
    }
});

/**
 * Detects click on filter checkboxes to filter on every click
 */
$(".filtre").click(function() {
    filterMarkers(false);
});


// allows hiding the "editer" nav tab when closing the sidebar
function hideEditTabAndContent() {
    $('.sidebar-tab').show();
    if($('#nav-pill-editer').hasClass("active")) {
        $('#nav-pill-filtrer').addClass("active");
        $('#nav-pill-editer').removeClass("active").addClass("hidden");
        $('#sidebar-content-editer').hide().addClass("hidden");
        $('#sidebar-content-filtrer').show();
    }
}

/**
 * Callback for click on orange edit button of info div
 * @jQuery $('#edit-btn'): the button's selector
 */
function openEditTab() {

    // open tab, enable nav-pill...
    $('#sidebar-wrapper').addClass("toggled");
    $('#sidebar-wrapper').show("slide", { direction: "left" }, 500);
    $('.sidebar-tab').removeClass("active").hide();
    $('#nav-pill-editer').addClass("active").removeClass("hidden").show();
    $('.sidebar-content').hide();
    $('#sidebar-content-editer').removeClass("hidden").show();

    // get pk value from span data
    var pk = $('#pk-data').attr("data-pk");

    // Prefill form with Ecole info
    
    var ecole_to_edit = json_db_data[pk - 1].fields;
    $('#editer_form #c_pk').val(pk); //hidden form input used by JS
    $('#editer_form #c_visite').prop("checked", ecole_to_edit.visite);
    if(ecole_to_edit.visite)
        $('#editer_form #c_visite_date').val(ecole_to_edit.visite_date);
}

/**
 * Called when 'filtrer' button is pressed in sidebar filter form
 * Used to filter the visible markers on the screen according to some parameters
 * Here, we filter by program code and by school type
 */
function filterMarkers(closeSidebar) {
	var code_uqac_checkboxes = $(".code_uqac_filtre");
    var code_partenaires_checkboxes = $(".code_partenaires_filtre");
	var type_checkboxes = $(".type_filtre");

	var codesUQAC = [];
    var codesPartenaires = [];
	var types = [];
	// retrieve checked UQAC code options
	code_uqac_checkboxes.each(function() {
		if ($(this).is(":checked")) codesUQAC.push($(this).val());
	});
    // retrieve checked partenaires code options
    code_partenaires_checkboxes.each(function() {
        if ($(this).is(":checked")) codesPartenaires.push($(this).val());
    });
	// retrieve checked type options
	type_checkboxes.each(function() {
		if ($(this).is(":checked")) types.push($(this).val());
	});
	// if at least one checkbox was checked
	if (codesUQAC.length > 0 || codesPartenaires.length > 0 || types.length > 0) {
		// go through all markers. If current marker 
		// corresponds to one filter, set it visible
        markers.forEach(function(m) {
            m.setVisible(false);
            if(m.programmes_uqac)
                codesUQAC.forEach(function(c) {
                    if (m.programmes_uqac.indexOf(c) != -1) m.setVisible(true);
                });
            if(m.programmes_partenaires)
                codesPartenaires.forEach(function(c) {
                    if (m.programmes_partenaires.indexOf(c) != -1) m.setVisible(true);
                });
            if(m.type)
                types.forEach(function(t) {
                    if(t === "V")
                        if(m.visite == true) m.setVisible(true);
                    else if (m.type == t) m.setVisible(true);
                });
        });
	}
	// is nothing was checked, show all markers
	else {
	    markers.forEach(function(m) {
            m.setVisible(true);
        });
	}
    if(closeSidebar) {
    	$("#sidebar-wrapper").removeClass("toggled");
    	$("#sidebar-wrapper").hide("slide", { direction: "left" }, 600);
    }
}

/**
 * Called when search button from search bar is pressed
 * Used to filter the shown markers on the map and create 
 * a results list of corresponding Ecoles
 */
function search() {
    var input_text = $("#search_input").val().toLowerCase();
    if(input_text) {
        var json_url = "/static/carte_interactive/json/data.json";
        var ecole_data = [];
        // get Json data
        $.getJSON(json_url, function(ecoles) {
        	// create a string containing all the information that could be searched
        	// make array from every Ecole treated
            ecoles.forEach(function(e) {
                var string_data = e.fields.nom + ',' + e.fields.programmes + ',' + e.fields.type + ',' + e.fields.ville;
                string_data = string_data.toLowerCase();
                ecole_data.push(string_data);
            });
            var ecole_results = [];
            // go through each marker, if one marker has the typed information, set it visible
            markers.forEach(function(m, index) {
                m.setVisible(false);
                var e = ecole_data[index];
                if (e.indexOf(input_text) != -1) {
                    m.setVisible(true);
                    ecole_results.push(ecoles[index].fields);
                }
            });
            // show a result list with the gathered corresponding markers
            showResultsList(ecole_results);
        });
    }
    //if nothing was entered in search bar, show all markers
    else {
        markers.forEach(function(m) {
            m.setVisible(true);
        });
    }
}

/**
 * Called when search is made and results are found
 * Used to show a right sidebar of results
 * @param  {Ecole array} results Ecoles array search results
 */
function showResultsList(results) {
    $("#results-container").show("slide", { direction: "right" }, 500);
    $("ul#results-list").empty();
    $("#results-container h1").html("Résultats...");
    if(results.length > 0) {
        results.forEach(function(r) {
        	if (!r.url) r.url = "javascript:void(0)";
        	var liItem = "<a href=\"" + r.url + "\" class=\"list-group-item\" target=\"_blank\">" + r.nom;
        	if (r.visite)
        		liItem += "<span class=\"label label-success pull-right\"> Visitée</span></a>";
        	else
        		liItem += "</a>";

            $("#results-list").append(liItem);
        });
    }
    else {
        $("#results-list").append("<li class=\"list-group-item\">Aucun résultat trouvé</li>");
    }
}

function ReloadIfNeeded() {
    var json_url = "/static/carte_interactive/json/reload.json";
    console.log("getting reload.json");
    $.getJSON(json_url, function(data) {
        console.log("reloaded? " + data.reload);
        if(data.reload) {
            console.log("saving coords to json");
            saveCoordinatesToJson();
        }
    });
}

function setReloadFalse() {
    $.ajax({
        url : "setReload/", // the endpoint
        type : "POST", // http method
        data : {content: false},
        //received json is updated data from database
        success : function(json) {
            console.log("set reload to false success!");
        }
    });
}

function UpdateEcolesAndMarkers() {
    console.log("updating Ecoles and Markers");
    $.ajax({
        url : "updateEcoles/", // the endpoint
        type : "POST", // http method
        data : {content: ""},
        //received json is updated data from database
        success : function(json) {
            console.log("update Ecoles success!");
            console.log("markers: " + markers);
            // remove references to markers on map
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
            markers = [];
            InitMap();
            setReloadFalse();
        }
    });
}

function saveCoordinatesToJson() {
    $.ajax({
        url : "saveCoordinates/", // the endpoint
        type : "POST", // http method
        data : {content: ""},
        success : function(json) {
            UpdateEcolesAndMarkers();
        }
    });
}
