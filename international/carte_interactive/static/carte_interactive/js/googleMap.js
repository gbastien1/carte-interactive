
function filterMarkers() {
	var code_checkboxes = $(".code_filtre");
	var type_checkboxes = $(".type_filtre");

	console.log(code_checkboxes[0]);

	var codes = [];
	var types = [];
	code_checkboxes.each(function() {
		if ($(this).is(":checked")) codes.push($(this).val());
	});
	type_checkboxes.each(function() {
		if ($(this).is(":checked")) types.push($(this).val());
	});

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