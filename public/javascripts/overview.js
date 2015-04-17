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
        id: 'test1',
        path: 'some.path',
        chart: undefined
    }
});

var ChartView = Backbone.View.extend({
    defaults: {
        fetch: undefined
    },
    tagName: 'div',
    className: 'col-md-4',
    initialize: function() {
        _.bindAll(this, 'render', 'buildChart', 'fetchData');

        this.fetchData();
    },
    render: function() {
        this.$el.html('<div id="' + this.model.get('id') + '" class="graph shadow-0"></div>');

        return this;
    },
    buildChart: function() {
        var table = this.model.get('table');
        table.addColumn('number', 'Day');
        table.addColumn('number', this.model.get('name'));
        this.model.set('table', table); // save for later
        table.addRows(this.model.get('data'));

        var options = {
            chart: {
                title: this.model.get('name')
            },
            legend: {
                position: 'none'
            }
        };

        options = google.charts.Line.convertOptions(options); // save for later

        this.model.set('options', options);

        this.model.set('chart', new google.charts.Line(document.getElementById(this.model.get('id'))));
        this.model.get('chart').draw(table, options);
    },
    fetchData: function() {
        var model = this.model;
        var dataPath = model.get('path').split('.');

        function pullData() {
            console.log('Pulling data for: ' + model.get('name'));

            var curData = []; //model.get('data');

            $.ajax({
                url: '/telemetry/get',
                method: 'GET'
            }).success(function(msg) {
                var newData = msg.pageResults;
                var counter = 0;
                for(var d in newData) {
                    if(d%3 === 0) {
//                            if(curData.length > 10) {
//                                curData.shift();
//                            }
                        var _d = newData[d].data;
                        for(var p in dataPath) {
                            if(_d[dataPath[p]])
                                _d = _d[dataPath[p]];
                            else
                                break;
                        }
                        if(typeof(_d) === 'number') {
                            var _t = new Date(0);
                            // _t.setUTCMilliseconds(newData[d].timestamp.split('(')[1].split(')')[0]);
                            // curData.push([_t.getDate(), _d]);
                            // The above works but doesn't fly for the demo
                            curData.push([counter, _d]);
                            counter++;
                        }
                    }
                }
                model.set('data', curData);

                var _chart = model.get('chart');
                var _table = model.get('table');

                _table.removeRows(0, _table.getNumberOfRows());
                _table.addRows(curData);
                model.set('table', _table);

                _chart.draw(_table, model.get('options'));
                model.set('chart', _chart);

                console.log('Finished drawing ' + model.get('name'));
            }).fail(function(msg){
                console.log('Failure!');
                console.log(msg);
            });
        }

        clearInterval(this.model.fetch);
        this.model.set('fetch', setInterval(pullData, 15000));
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
            path: data.path
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
    defaults: {
        // Initialize the telemetry object
        // Eventually this should be it's own Backbone object or something
        telemetry: {},
        sendData: undefined
    },
    events: {
        'click #add_rule': 'newMetric'
    },
    initialize: function() {
        _.bindAll(this, 'render', 'newMetric', 'buildTelemetry', 'sendTelemetry');

        // Ensure we have a device id (serial number)
        this.getDeviceId();
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
            id: toId(name.val())
        };

        this.metricsTableView.addRule(rule);
        this.metricsChartView.addChart(rule);
        this.buildTelemetry(rule);

        name.val('');
        path.val('');
        date.prop('selectedIndex', 0);
        dataType.prop('selectedIndex', 0);

        function toId(name) {
            return name.replace(/[^a-zA-Z0-9_-]/g,'');
        }
    },
    getDeviceId: function() {
        // Check for HTML 5 storage at some point
        window._deviceId = localStorage.getItem('deviceId');

        if(!window._deviceId) {
            // Create one
            window._deviceId = this.createDeviceId();
            localStorage.setItem('deviceId', window._deviceId);
        }
    },
    createDeviceId: function() {
        function getRandomChar() {
            var c = Math.round(Math.random() * 25);
            return String.fromCharCode(65 + c);
        }

        function getRandomDigit() {
            return Math.round(Math.random() * 100) % 10;
        }

        return getRandomChar()  + getRandomDigit() + getRandomChar() + getRandomDigit();
    },
    buildTelemetry: function(rule) {

        var dataFunc = undefined;

        switch(rule.dataType.toLowerCase()) {
            case 'percentage':
                dataFunc = function() { return Math.ceil(Math.random() * 100); };
                break;
            case 'total':
                dataFunc = function() { return Math.ceil(Math.random() * 300) + 85; };
                break;
            case 'average':
                dataFunc = function() { return Math.ceil(Math.random() * 140) + 34; };
                break;
            default:
                dataFunc = function() { return 1; }
                break;
        }

        function recursePath(obj, path, func) {
            var key = path.shift();

            if(path.length === 0) {
                obj[key] = func;
                return obj;
            }

            if(!obj.hasOwnProperty(key)) {
                obj[key] = {};
            }

            obj[key] = recursePath(obj[key], path, func);
            return obj
        }

        var split = rule.path.split('.');

        this.defaults.telemetry = recursePath(this.defaults.telemetry, split, dataFunc);

        this.sendTelemetry();
    },
    sendTelemetry: function() {
        // Activate the functions at the end of each telemetry point and send it off
        // var copy = $.extend(true, {}, this.defaults.telemetry);

        function parseData(d) {
            for(var k in d) {
                if(typeof(d[k]) === 'function') {
                    d[k] = d[k]();
                } else {
                    parseData(d[k]);
                }
            }

            return d;
        }

        // var data = parseData(copy);

        function send(data) {
            console.log('Sending data');

            var d = {
                telemetry: JSON.stringify(data),
                timestamp: Date.now()
            };

            $.ajax({
                url: '/telemetry/add',
                method: 'POST',
                data: d,
            }).success(function(msg) {
                console.log('Success!');
            }).fail(function(msg){
                console.log('Failed');
                console.log(msg);
            });
        }

        var createInterval = function(parse, save, dataSet, interval) {
            return setInterval(function() {
                var copy = $.extend(true, {}, dataSet)
                var res = parse(copy);
                save(res);
            }, interval);
        }

        clearInterval(this.defaults.sendData);
        this.defaults.sendData = createInterval(parseData, send, this.defaults.telemetry, 7000);
    }
});
