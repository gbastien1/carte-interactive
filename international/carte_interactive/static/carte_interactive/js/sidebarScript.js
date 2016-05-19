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
    $("#sidebar-wrapper").removeClass("toggled");
});

$(document).click(function (e){
    if(!($(e.target).is(':button') || $(e.target).is(".glyphicon-menu-hamburger"))) {
        if($("#sidebar-wrapper.toggled").length > 0 & !$(e.target).is('#sidebar-wrapper *')) {
            $('#sidebar-wrapper').removeClass("toggled");
        }
    }
});

$("#sidebar-nav-pills li").click(function(e) {
    //if(!$(this).hasClass("disabled")) { //TODO ADD THIS CONDITION
    	e.preventDefault();
    	$("#sidebar-nav-pills li").removeClass("active");
    	$(".sidebar-content").hide();

    	$(this).addClass("active");
    	var pillTitle = $(this).attr('id').split('-')[2];
    	var selector = "#sidebar-content-" + pillTitle;
    	$(selector).show();
    //}
});

$('#edit-btn *').click(function(e) {
    console.log("clicked");
    e.preventDefault();
    $('#sidebar-wrapper').addClass("toggled");
    $('#nav-pill-editer').removeClass("disabled").addClass("active");
    $('#sidebar-content-editer').show();
});

// Submit post on submit
$('#ajouter_form').on('submit', function(event){
    event.preventDefault();
    ajouter_ecole(this);
    this.reset();
});

// AJAX for posting
function ajouter_ecole(form) {
    var data = {};
    $.each(form.elements, function(index, el){
        var input = $(el);
        data[input.attr("name")] = input.val();
        delete data["undefined"];
    });

    $.ajax({
        url : "ajout/", // the endpoint
        type : "POST", // http method
        data : {content: JSON.stringify(data) },

        // handle a successful response
        success : function(json) {
            ecole_data = JSON.parse(json);
            if(ecole_data !== "already created")
                createMarker(ecole_data.fields);
        },

        // handle a non-successful response
        error : function(xhr,errmsg,err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
};


