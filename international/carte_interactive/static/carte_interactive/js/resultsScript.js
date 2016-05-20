
$("#close-results-btn").click(function(e) {
    e.preventDefault();
    $("#results-container").hide("slide", { direction: "right" }, 500);
});

$(document).click(function (e){
    if(!($(e.target).is(':button') || $(e.target).is(".glyphicon-remove"))) {
        if(!$(e.target).is('#results-container *') && !$(e.target).is('#search_input *')) {
            $('#results-container').hide("slide", { direction: "right" }, 500);
        }
    }
});

$("#search_input").keyup(function (e) {
    if (e.keyCode == 13) {
        search();
    }
});
