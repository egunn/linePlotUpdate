//The first version that I committed was pretty simple; this one might come a little closer to actually
//mimicking your dataset (and it has comments!)


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

queue()
    .defer(d3.csv,'data/fakeCountryData.csv',parseCountry)
    .defer(d3.csv,'data/yearMetadata.csv',parseYear)
    .await(dataLoaded);

function dataLoaded(err,countryDataIn,metadataIn){

    //This probably shouldn't all be in the dataLoaded function, but it works here, so I'm not going to be
    // fancy and try to organize it

    //check that the data is here, see what it looks like
    //console.log(countryDataIn);

    //nest the data to sort by country
    var nestedCountries = d3.nest()
        .key(function (d) {
            return d.country
        })
        .entries(countryDataIn);

    //double check that it does it
    console.log(nestedCountries);

    //create an array of zeros as a placeholder; declare null array, then populate with a for loop
    //(Note that I'm populating the array with objects, which have two attributes: year, and value
    //this way, I can access them with zerosArray.year and .value)
    var zerosArray = [];
    for (i=0; i<20;i++){
        zerosArray.push({year:2000+i,value:10});
    }

    //create an array of these zeros arrays, one for each country in the data set (three in my case)
    //could also do this with a for loop, for bigger datasets
    emptyData = [zerosArray, zerosArray, zerosArray];

    //declare and populate a lookup table to index year to a particular position in the emptyData arrays
    yearMetadata = d3.map();
    for (i = 0; i < metadataIn.length; i++) {
        yearMetadata.set(metadataIn[i].year, metadataIn[i].index);
    }

    //create a DOM group for each country in emptyData (should be three - one for each country)
    //Will append lines into these groups later - for now, just want one for each element in emptyData
    var countryLines = plot.selectAll('country-groups')
        .data(emptyData)
        .enter()
        .append('g')
        .attr('class','country-groups')
        //translate each group to create the stacked graph look
        .attr('transform', function(d,i){return 'translate('+10*i+ ',' +10*i+ ')'});

    //append a path to each country group (should be 3 of them with this one append, since you are appending one to
    //each group created above)
    countryLines
        .append('path')
        .attr('class', 'data-line');

    //console.log(emptyData[1]);

    //bind the empty data array to populate the path items with zeros (should give 3 flat lines)
    var eachLine = plot.selectAll('.data-line')
        .data(emptyData)
        //need to use the accessor function here, because you want to do this for each item in emptyData;
        //this binds one element of emptyData to each group created above, making 3 lines
        .attr('d', function(d,i){return lineGenerator(emptyData[i])})
        .style('stroke','gray');


    //listen for user click event
    d3.selectAll('.btn').on('click', function () {
        var type = d3.select(this).attr('id');  //id values are coffee and tea (from HTML)

        //console.log("I heard you");

        //take the first "year" value in nestedCountries[0].values[1] (Japan), and use metaData to find what its index
        //should be in the zeros array for Japan. Print it to the console to check that it's the right one
        //console.log(yearMetadata.get([nestedCountries[0].values[1].year]));


// *****need to put this inside a for loop to update for each country - right now, only grabs information from
        //one entry in the nestedCountries array

        //store index temporarily
        temp = yearMetadata.get([nestedCountries[0].values[1].year]);

        //check that you can use the temp variable to access the emptyData array
        //console.log((emptyData[0])[temp].value);

        //create a copy of emptyData to update with values extracted from nestedCountries
        updatedData = emptyData;

        //overwrite the appropriate value for the updatedData array with the value stored in the temp variable
        //(in this case, (emptyData[0])[13].value)
        (updatedData[0])[temp].value = 50;

        //check that it updated
        console.log((updatedData[0])[temp].value);


        //update the path based on the updatedData array
        plot.select('.data-line')
            .datum(updatedData)
            .transition()
            .duration(500)
            .attr('d', function(d,i){return lineGenerator(updatedData[i])});
    });

}


function parseCountry(d){
    return {
        country: d.country,
        year: +d.year
    }
}


function parseYear(d){
    return {
        year: d.year,
        index: d.index    }
}