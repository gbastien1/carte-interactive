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
    if(!$(this).hasClass("disabled")) { //TODO ADD THIS CONDITION
    	e.preventDefault();
    	$("#sidebar-nav-pills li").removeClass("active");
    	$(".sidebar-content").hide();

    	$(this).addClass("active");
    	var pillTitle = $(this).attr('id').split('-')[2];
    	var selector = "#sidebar-content-" + pillTitle;
    	$(selector).show();
    }
});

// Click on edit button of info div
function openEditTab() {
    console.log("clicked");
    $('#sidebar-wrapper').addClass("toggled");
    $('#sidebar-wrapper').show("slide", { direction: "right" }, 500);
    $('.sidebar-tab').removeClass("active");
    $('#nav-pill-editer').addClass("active").removeClass("disabled");
    $('.sidebar-content').hide();
    $('#sidebar-content-editer').show();
    var pk = $('#pk-data').attr("data-pk");
    $('#c_pk').val(pk).prop('disabled', true);;
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
            if(ecole_data !== "already created" || ecole_data != "incomplete data")
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

// AJAX for posting
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
        data : {content: JSON.stringify(data) },

        // handle a successful response
        success : function(json) {
            $('#nav-pill-filtrer').addClass("active");
            $('#nav-pill-editer').removeClass("active").addClass("disabled");
            $('#sidebar-content-editer').hide();
            $('#sidebar-content-filtrer').show();
        },

        // handle a non-successful response
        error : function(xhr,errmsg,err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>Oops! We have encountered an error: "+errmsg+
                " <a href='#' class='close'>&times;</a></div>"); // add the error to the dom
            console.log(xhr.status + ": " + xhr.responseText); // provide a bit more info about the error to the console
        }
    });
};


