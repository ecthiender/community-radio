/* Using underscore.js for manupulating the data structures
 * and d3 to present the data visually.
 * Also, d3 and underscore both have utility helper functions 
 * that we are using 
 * */
(function(M) {
  M.init = function() {
    //this.drawBarCharts();
    //this.drawTreeMap();
    this.drawPivot();
  };
  
  M.drawPivot = function() {
    var fields = [
      {name: 'Radio Station', type: 'regexp', filterable: true, labelable: true},
      {name: 'Demographic', type: 'regexp', filterable: true, labelable: true},
      {name: 'Value', type: 'string', filterable: true, labelable: true},
      {name: 'Frequency', type: 'integer', filterable: true, labelable: true},
      {name: 'Percent', type: 'float', filterable: true, labelable: true}
    ];
    if(pivot) {
      console.log('initing pivot');
      var row_labels = ['Radio Station', 'Value', 'Frequency', 'Percent'];
      $('#pivot-container').pivot_display('setup', {url: 'data/frequency.csv', fields: fields, filters: {Demographic: 'Age'}, rowLabels: row_labels});
    }
    else {
      console.log('pivot.js not loaded');
    }
  };

  M.drawBarCharts = function() {
    d3.csv('data/communitySurveys.csv', function(d) {
      //cleaning up the data; we dont need Sl Nos.
      _.each(d, function(e) {
        if(e.hasOwnProperty('Sr No')) {
          delete e['Sr No'];
        } 
      });
      M.data = d; // hold the entire csv as an array of objects
      M.params = _.keys(d[0]); // get the parameters from the objects
      //$('#data-params').append('<select name="params"></select>');
      _.each(M.params, function(val, prop) {
        //$('#data-params select').append('<option name="'+ prop +'">')
        $('#data-params').append('<a href="#" id="key' + prop + '">' + val + '</a> | ');
        $('#key' + prop).click(M.drawGraph);
      });
    });
  }; 

  M.drawGraph = function(event) {
    var prop = $(event.currentTarget).attr('id').substr(3); //get the property num from the id
    var data = _.countBy(M.data, M.params[prop]); //group by and count
    var params = _.keys(data);
    var vals = _.values(data);
    var max_label_width = _.max(params, function(param) { 
      return param.length;
    }).length;
    d3.selectAll('#vis rect').remove();
    d3.selectAll('#vis text').remove();

    // set the h and w of the svg element
    var chart = d3.select('#vis')
      .attr({
        width: 900,
        height: 20 * vals.length + 35,
      })
      .append('g')
      .attr('transform', 'translate(0, 25)');

    //draw the x axis
    var x = d3.scale.linear()
      .domain([0, d3.max(vals)])
      .range([0, 400]);
    // y axis
    var y = d3.scale.ordinal()
      .domain(vals)
      .rangeBands([0, 20 * vals.length])

    //labels
    var labels = chart.selectAll('g').data(vals);
    labels.enter().append('text');
    labels.attr({
      class: 'label',
      //x: 0,
      y: function(d, i) {
        return i * 20;
      },
      dy: '.95em'
    });
    labels.text(function(d, i) { 
      return params[i];
    });

    // draw the bars
    var bars = chart.selectAll('rect').data(vals);
    bars.enter().append('rect');
    /* Unlike HTML, SVG does not provide automatic flow layout. 
     * Shapes are positioned relative to the top-left corner, called the origin. 
     * Thus, by default, the bars would be drawn on top of each other. 
     * To fix this, set the y-coordinate and height explicitly */
    bars.attr({
      x: function(d, i) {
           return 10 + max_label_width * 10;
         },
      y: function(d, i) {
           return i * 20;
         },
      width: 0, //setting width to 0 as we are going to animate it later
      height: 20 
    });

    // append the values with each bar
    var values = chart.selectAll('g').data(vals);
    values.enter().append('text');
    values.attr({
      x: function(d, i) {
           return 30 + max_label_width * 10;
         },
      y: function(d, i) {
           return i * 20;
         },
      //dx: -3,
      dy: '0.95em',
      'text-anchor': 'end',
      fill: '#fff'
    });
    values.text(String);
    d3.selectAll('rect').data(vals).transition().duration(1000);

    //animate the bars
    bars.transition().duration(1000).ease('cubic').attr('width', x);

    return false; // to prevent the default action of the click
  };
})(M); M.init();
