
$("#close-results-btn").click(function(e) {
    e.preventDefault();
    $("#results-container").hide(1000);
});

$(document).click(function (e){
    if(!($(e.target).is(':button') || $(e.target).is(".glyphicon-remove"))) {
        if(!$(e.target).is('#results-container *')) {
            $('#results-container').hide(1000);
        }
    }
});
