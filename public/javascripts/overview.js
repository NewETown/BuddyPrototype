$(document).ready(function() {
    Backbone.sync = function(method, model, success, error) {
        success();
    }
    
    var Rule = Backbone.Model.extend({
        defaults: {
            name: null,
            telemetry_path: null,
            date_range: null,
            data_type: null
        }
    });
    
    var RuleView = Backbone.View.extend({
        tagName: 'div',
        className: 'rule-row',
        initialize: function() {
            _.bindAll(this, 'render');
        },
        render: function() {
            this.$el.html("<div class='name'>"+this.model.get('name')+"</div><div class='path'>"+this.model.get('telemetry_path')+"</div><div class='date-range'>"+this.model.get('date_range')+"</div><div class='data-type'>"+this.model.get('data_type')+"</div>");
            return this;
        }
    });
    
    var RulesList = Backbone.Collection.extend({
        model: Rule
    });
    
    var RulesListView = Backbone.View.extend({
        el: $('#rule-container'),
        events: {
            // 'click #add_rule': 'addRule'
        },
        initialize: function() {
             _.bindAll(this, 'render', 'addRule', 'appendRule');
            
            this.collection = new RulesList();
            this.collection.bind('add', this.appendRule);
            
            this.render();
        },
        render: function() {
            var self = this;
            _(this.collection.models).each(function(rule) {
                self.appendRule(rule);
            }, this);
        },
        addRule: function(data) {
            var rule = new Rule();
            rule.set({
                name: data.name,
                telemetry_path: data.path,
                date_range: data.date,
                data_type: data.dataType
            });
            
            this.collection.add(rule);
        },
        appendRule: function(rule) {
            var ruleView = new RuleView({
                model: rule
            });
            
            $('.rules-box', this.el).append(ruleView.render().el);
        }
    });
    
    var Chart = Backbone.Model.extend({
        defaults: {
            table: undefined,
            data: [],
            name: 'Test 1',
            id: 'test1'
        }
    });
    
    var ChartView = Backbone.View.extend({
        tagName: 'div',
        className: 'col-md-4',
        initialize: function() {
            _.bindAll(this, 'render', 'buildChart');
        },
        render: function() {
            this.$el.html('<div id="' + this.model.get('id') + '" class="graph shadow-0"></div>');
            
            return this;
        },
        buildChart: function() {
            var table = this.model.get('table');
            table.addColumn('number', 'Day');
            table.addColumn('number', this.model.get('name'));
            table.addRows(this.model.get('data'));
            
            var options = {
                chart: {
                    title: this.model.get('name')
                },
                legend: {
                    position: 'none'
                }
            };
            
            var chart = new google.charts.Line(document.getElementById(this.model.get('id')));
            chart.draw(table, google.charts.Line.convertOptions(options));
        }
    });
    
    var ChartList = Backbone.Collection.extend({
        model: Chart
    });
    
    var ChartListView = Backbone.View.extend({
        el: $('#charts-container'),
        defaults: {
            chartIndex: 0
        },
        events: {
            // delete?
        },
        initialize: function() {
            _.bindAll(this, 'render', 'appendChart');
            
            this.collection = new ChartList();
            this.collection.bind('add', this.appendChart);
            
            // Create an active row
            this.buildRow();
            
            this.render();
        },
        addChart: function(data) {
            var chart = new Chart();
            chart.set({
                table: new google.visualization.DataTable(),
                name: data.name,
                id: data.id,
                data: [
                    [1, 3],
                    [2, 4],
                    [3, 1],
                    [4, 2],
                    [5, 6],
                    [6, 4],
                    [7, 7]
                ]
            });
            
            this.collection.add(chart);
        },
        appendChart: function(chart) {
            if(this.getChartIndex() > 2) {
                this.buildRow();
            }
            
            this.incrementChartIndex();
            
            var chartView = new ChartView({
                model: chart
            });
            
            $('.active-row', this.el).append(chartView.render().el);
            chartView.buildChart();
        },
        render: function() {
            var self = this;
            _(this.collection.models).each(function(chart) {
                self.appendChart(chart);
            }, this);
        },
        getChartIndex: function() {
            return this.defaults.chartIndex;
        },
        incrementChartIndex: function() {
            this.defaults.chartIndex++;
        },
        decrementChartIndex: function() {
            this.defaults.chartIndex--;
        },
        resetChartIndex: function() {
            this.defaults.chartIndex = 0;
        },
        buildRow: function () {
            // Clear the previous active row
            $('.active-row', this.el).removeClass('active-row');
            // Append a new active row
            this.$el.append('<div class="row active-row"></div>');
            // Reset the chart count
            this.resetChartIndex();
        }
    });
    
    var CustomMetricsView = Backbone.View.extend({
        // This is the general page view that will contain both the table and charts
        el: $('#custom-metrics'),
        events: {
            'click #add_rule': 'newMetric'
        },
        initialize: function() {
            _.bindAll(this, 'render', 'newMetric');
            
            this.render();
        },
        render: function() {
            this.metricsTableView = new RulesListView();
            this.metricsChartView = new ChartListView();
        },
        newMetric: function() {
            var form = $('#rule-creation');
            var name = form.find('#name');
            var path = form.find('#path');
            var date = form.find('#date');
            var dataType = form.find('#type');
            
            var rule = {
                name: name.val(),
                path: path.val(),
                date: date.val(),
                dataType: dataType.val(),
                id: this.toId(name.val())
            }
            
            this.metricsTableView.addRule(rule);
            this.metricsChartView.addChart(rule);
            
            name.val('');
            path.val('');
            date.prop('selectedIndex', 0);
            dataType.prop('selectedIndex', 0);
        },
        toId: function(name) {
            return name.replace(/[^a-zA-Z0-9_-]/g,'');
        }
    });
    
    var customMetricsView = new CustomMetricsView();
    
});