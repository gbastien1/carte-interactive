
$("#close-results-btn").click(function(e) {
    e.preventDefault();
    $("#results-container").hide(1000);
});

$(document).click(function (e){
    if(!($(e.target).is(':button') || $(e.target).is(".glyphicon-remove"))) {
        if(!$(e.target).is('#results-container *') && !$(e.target).is('#search_input *')) {
            $('#results-container').hide(1000);
        }
    }
});

$("#search_input").keyup(function (e) {
    if (e.keyCode == 13) {
        search();
    }
});
