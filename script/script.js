/*Start by setting up the canvas */
var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.r - margin.l,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;


//Scales - create color scale based on activity classification
var scalePieColor = d3.scale.ordinal().domain([0,1,2,3,4,5,6,7]).range(['orangered','orange','darkcyan','darkviolet','lawngreen','darkgreen','peru','sienna','tan']); //ordinal scale does 1:1 lookup
var scaleX = d3.scale.linear().domain([1995,2020]).range([0,width]),
    scaleY = d3.scale.linear().domain([0,90]).range([height, 0]),
    scaleR = d3.scale.sqrt().range([0, .02]);  //set values based on sizes that I wanted to obtain - seems awfully small?

//draw plot, create svg canvas, translate as necessary to fit screen
var plot = d3.select('#plot')
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//Initialize axes (https://github.com/mbostock/d3/wiki/SVG-Axes)
var axisX = d3.svg.axis()
    .orient('bottom')
    .scale(scaleX)
    .tickFormat( d3.format('d'))
    .tickSize(-height)
    .tickValues([50,100,150]);
var axisY = d3.svg.axis()
    .orient('left')
    .scale(scaleY)
    .tickSize(-width)
    .tickValues([0,25,50,75,100]);

plot.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+height+')')
    .call(axisX);
plot.append('g').attr('class','axis axis-y')
    .call(axisY);

//TODO: Line generator
var lineGenerator = d3.svg.line()
    .x(function(d){ return scaleX(d.year)})
    .y(function(d){ return scaleY(d.value)})
    .interpolate('basis');

zerosArray = [];

for (i=0; i<20;i++){
    zerosArray.push({year:2000+i,value:10});
}

//draw(zerosArray);

//function draw(dataArray) { //runs each time the button is clicked! Parameter passes button ID - sends right dataArray depnding on input
    //can't use append in here - will add new elements each time a button is clicked!
    //only want to update the path in the draw function.



    console.log(zerosArray);

    plot.append('path')
        .attr('class', 'data-line');

    //update the path item defined above, using the new params passed in
    plot.select('.data-line')
        .datum(zerosArray)
        //.transition()
        //.duration(500)
        .attr('d', lineGenerator)
        .style('stroke','gray');


//listen for user click event
d3.selectAll('.btn').on('click',function(){
    var type = d3.select(this).attr('id');  //id values are coffee and tea (from HTML)

    dataArray = zerosArray;

    dataArray[10].value = 50;

    console.log(dataArray);


//update the path item defined above, using the new params passed in
    plot.select('.data-line')
        .datum(dataArray)
        .transition()
        .duration(500)
        .attr('d', lineGenerator);
});


