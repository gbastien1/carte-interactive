
function filterMarkers() {
	var code_checkboxes = $(".code_filtre");
	var type_checkboxes = $(".type_filtre");

	var codes = [];
	var types = [];
	code_checkboxes.each(function() {
		if ($(this).is(":checked")) codes.push($(this).val());
	});
	type_checkboxes.each(function() {
		if ($(this).is(":checked")) types.push($(this).val());
	});
	if (codes.length > 0 || types.length > 0) {
        markers.forEach(function(m) {
            m.setVisible(false);
            codes.forEach(function(c) {
                if (m.codes.indexOf(c) != -1) m.setVisible(true);
            });
            types.forEach(function(t) {
                if (m.type == t) m.setVisible(true);
            });
        });
	}
	else {
	    markers.forEach(function(m) {
            m.setVisible(true);
        });
	}
}

function search() {
    var input_text = $("#search_input").val().toLowerCase();
    if(input_text) {
        var json_url = "/static/carte_interactive/json/data.json";
        var ecole_data = [];
        $.getJSON(json_url, function(ecoles) {
            ecoles.forEach(function(e) {
                var string_data = e.fields.nom + ',' + e.fields.programmes + ',' + e.fields.type_ecole + ',' + e.fields.ville;
                string_data = string_data.toLowerCase();
                ecole_data.push(string_data);
            });
            var ecole_results = [];
            markers.forEach(function(m, index) {
                m.setVisible(false);
                var e = ecole_data[index];
                if (e.indexOf(input_text) != -1) {
                    m.setVisible(true);
                    ecole_results.push(ecoles[index].fields);
                }
            });
            showResultsList(ecole_results);
        });
    }
    else {
        markers.forEach(function(m) {
            m.setVisible(true);
        });
    }
}

function showResultsList(results) {
    $("#results-container").show("slide", { direction: "right" }, 500);
    $("ul#results-list").empty();
    $("#results-container h1").html("Résultats...");
    if(results.length > 0) {
        results.forEach(function(r) {
            $("#results-list").append("<li class=\"list-group-item\">" + r.nom + "</li>");
        });
    }
    else {
        $("#results-list").append("<li>Aucun résultat trouvé</li>");
    }
}
