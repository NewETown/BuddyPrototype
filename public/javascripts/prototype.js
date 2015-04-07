$(function() {
    $('#register').click(function() {
        var data = {username: $('#loginEmail').val(), password: $('#loginPassword').val()};
        var self = this;
        $(self).prop('disabled', true);
        
        $.ajax({
            url: '/createUser',
            method: 'POST',
            data: data
        }).success(function(msg) {
            console.log(msg);
            window.location = msg.redirect;
        }).fail(function(msg) {
            console.log('Fail');
            console.log(msg);
            $(self).prop('disabled', false);
        });
    });
    
    
    $('#login').click(function() {
        var data = {username: $('#loginEmail').val(), password: $('#loginPassword').val()};
        var self = this;
        $(self).prop('disabled', true);
        
        $.ajax({
            url: '/login',
            method: 'POST',
            data: data
        }).success(function(msg) {
            window.location = msg.redirect;
        }).fail(function(msg) {
            console.log('Fail');
            console.log(msg);
            $(self).prop('disabled', false);
        });
    });
    
    ApplyTransitions();
    
    $('#overview-btn').click(function() {
        $('.raised-button.active').removeClass('active');
        
        $(this).parent().addClass('active');
        
        $('#custom-metrics').removeClass('active');
        $('#overview').addClass('active');
        
//        $('.ink').remove();
    });
    
    $('#metrics-btn').click(function() {
        $('.raised-button.active').removeClass('active');
        
        $(this).parent().addClass('active');

        $('#custom-metrics').addClass('active');
        $('#overview').removeClass('active');
        
//        $('.ink').remove();
    });
    
    $('#admin-btn').click(function() {
        $('.raised-button.active').removeClass('active');
        
        $(this).parent().addClass('active');
        
//        $('.ink').remove();
    });
    
    $(".ink-purple").click(function(e) {
        var x = e.pageX;
        var y = e.pageY;
        var parent = $(this).parent();

        inked(x, y, parent, 'purple');
    });

    $(".ink-light-gray").click(function(e) {
        var x = e.pageX;
        var y = e.pageY;
        var parent = $(this).parent();

        inked(x, y, parent, 'light-gray');
    });
    
    if (window.location.pathname === '/overview') {
        renderGoogleCharts();
    }
});

function ApplyTransitions() {
//    $(".drawer").addClass("transition");
//    $(".drawer ul").addClass("transition");
    $(".body-container").addClass("transition");
}

var inked = function(pageX, pageY, parent, color) {
    var ink, d, x, y;

    //create .ink element if it doesn't exist
    if(parent.find(".ink").length == 0)
        parent.prepend("<span class='ink " + color + "'></span>");

    ink = parent.find(".ink");
    //incase of quick double clicks stop the previous animation
    ink.removeClass("animate");

    //set size of .ink
    if(!ink.height() && !ink.width())
    {
        //use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
        d = Math.max(parent.outerWidth(), parent.outerHeight());
        ink.css({height: d, width: d});
    }

    //get click coordinates
    //logic = click coordinates relative to page - parent's position relative to page - half of self height/width to make it controllable from the center;
    x = pageX - parent.offset().left - ink.width()/2;
    y = pageY - parent.offset().top - ink.height()/2;

    //set the position and add class .animate
    ink.css({top: y+'px', left: x+'px'}).addClass("animate");
}

function renderGoogleCharts() {
    
    google.setOnLoadCallback(drawChart);

    function drawChart() {
        var data1 = new google.visualization.DataTable();
        data1.addColumn('number', 'Day');
        data1.addColumn('number', 'Active Devices');
        data1.addRows([
            [1, 300],
            [2, 306],
            [3, 297],
            [4, 299],
            [5, 310],
            [6, 309],
            [7, 312]
        ]);
        
        var data2 = new google.visualization.DataTable();
        data2.addColumn('number', 'Day');
        data2.addColumn('number', 'Device Installs');
        data2.addRows([
            [1, 3],
            [2, 4],
            [3, 1],
            [4, 2],
            [5, 6],
            [6, 4],
            [7, 7]
        ]);

        var options1 = {
            chart: {
                title: 'Active Devices',
            },
            legend: {
                position: 'none'
            }
        };
        
        var options2 = {
            chart: {
                title: 'Device Installs'
            },
            legend: {
                position: 'none'
            }
        };

        var chart = new google.charts.Line($('#active-devices')[0]);
        chart.draw(data1, google.charts.Line.convertOptions(options1));
        
        var chart2 = new google.charts.Line($('#device-installs')[0]);
        chart2.draw(data2, google.charts.Line.convertOptions(options2));
    }
}