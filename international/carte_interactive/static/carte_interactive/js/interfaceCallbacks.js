/**
 * This auto-calling function allows the use of csrf tokens 
 * in forms submitted with javascript .on('submit',...)
 * Otherwise Django throws errors
 */
$(function () {
	$.ajaxSetup({
		headers: { "X-CSRFToken": getCookie("csrftoken") }
	});
});

$(document).ready(function() {
	 $("#input-4").fileinput({showCaption: false});
});
/**
 * @jQuery $("#menu-toggler"): button used to open the sidebar
 */
$("#menu-toggler").click(function(e) {
	e.preventDefault();
	$("#sidebar-wrapper").addClass("toggled");
	$("#sidebar-wrapper").show("slide", { direction: "left" }, 500);
	$("#sidebar-content-ajouter").hide();
	$("#sidebar-content-editer").hide();
});

/**
 * @jQuery $("#close-menu-btn"): button in the sidebar used to close it
 */
$("#close-menu-btn").click(function(e) {
	e.preventDefault();
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
		if(!($(e.target).is(':button') || $(e.target).is(".glyphicon-menu-hamburger"))) {
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
    search();
});


/**
 * Called when 'filtrer' button is pressed in sidebar filter form
 * Used to filter the visible markers on the screen according to some parameters
 * Here, we filter by program code and by school type
 */
function filterMarkers() {
	var code_checkboxes = $(".code_filtre");
	var type_checkboxes = $(".type_filtre");

	var codes = [];
	var types = [];
	// retrieve checked code options
	code_checkboxes.each(function() {
		if ($(this).is(":checked")) codes.push($(this).val());
	});
	// retrieve checked type options
	type_checkboxes.each(function() {
		if ($(this).is(":checked")) types.push($(this).val());
	});
	// if at least one checkbox was checked
	if (codes.length > 0 || types.length > 0) {
		// go through all markers. If current marker 
		// corresponds to one filter, set it visible
        markers.forEach(function(m) {
            m.setVisible(false);
            codes.forEach(function(c) {
                if (m.programmes.indexOf(c) != -1) m.setVisible(true);
            });
            types.forEach(function(t) {
                if (m.type == t) m.setVisible(true);
            });
        });
	}
	// is nothing was checked, show all markers
	else {
	    markers.forEach(function(m) {
            m.setVisible(true);
        });
	}
	// close sidebar
	$("#sidebar-wrapper").removeClass("toggled");
	$("#sidebar-wrapper").hide("slide", { direction: "left" }, 600);
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
