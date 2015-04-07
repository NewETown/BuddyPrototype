$(document).ready(function() {
    var dataTable = Backbone.Model.extend({
        defaults: {
            table: new google.visualization.DataTable();
        }
    });
});