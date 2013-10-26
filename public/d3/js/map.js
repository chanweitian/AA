
var landColor = d3.rgb("#666666"); 
var width = height = null;

var chart_svg = d3.select("#chart").append("svg");

var background = chart_svg.append("rect")
							.attr("fill", "#111");

var countryNamesByCode = {};

/*
var projection = d3.geo.projection(d3.geo.mercator.raw(1.75, 2))
						.rotate([-10, -45])
	 					.scale(180);*/

var projection = d3.geo.mercator()
                    .scale(180);

var path = d3.geo.path()
					.projection(projection);
							
var rscale = d3.scale.sqrt();

function initSizes() {
  width = $(window).width();
  height = $(window).height() - 40;
  background
    .attr("width", width)
    .attr("height", height);
  projection.translate([width/2.3,height/2]);
  chart_svg
    .attr("width", width)
    .attr("height", height);
  rscale.range([0, height/45]);
};

initSizes();

function initCountryNames(world) {
  world.features.forEach(function(f) {
      countryNamesByCode[f.id] = f.properties.name;
  });
}

function highlightCountry(code){
    highlightedCountry = code;
    chart_svg.selectAll("path.land")
      .sort(function(a,b){
        //if (a.id === selectedCountry) return 1;
        //if (b.id === selectedCountry) return -1;
        if (a.id === code) return 1;
        if (b.id === code) return -1;
        return 0;
      });


}

function showTooltip(e, html) {
  var tt = $("#tooltip"), x = (e.pageX + 10), y = (e.pageY + 10);
  tt.html(html);
  if (y -10 + tt.height() > $(window).height()) {
    y = $(window).height() - tt.height() - 20;
  }
  if (x -10 + tt.width() > $(window).width()) {
    x = $(window).width() - tt.width() - 20;
  }
  tt.css("left", x + "px")
    .css("top", y + "px")
    .css("display", "block");
}


function hideTooltip() {
  $("#tooltip")
    .text("")
    .css("display", "none");
}


queue()
  .defer(d3.json, "data/world-countries.json")
  .await(function(err, world){
    var leftMargin = 350; // Math.max(100, width*0.4);
    var fitMapProjection = function() {
      fitProjection(projection, world, [[leftMargin, 60], [width - 20, height-120]], true);
    };
    
    fitMapProjection();

    chart_svg.append("g")
       	.attr("class", "map")
      	.selectAll("path")
        .data(world.features)
        .enter().append("path")
        .attr("class", "land")
        .attr("fill", landColor)
        .attr("data-code", function(d) { return d.id; })
        .on("mouseover", function(d) {highlightCountry(d.id)});

    var updateMap = function() {
      chart_svg.selectAll("g.map path")
        .attr("d", path);
    };

    updateMap();

    initCountryNames(world);


    $("#chart g.map path.land")
      .on("mousemove", function(e) {
       var d = e.target.__data__;
       var iso3 = (d.id  ||  d.iso3);
       var text = "<b>"+"ateonuh"+"</b>";

       if(highlightedCountry != null){
        text = "<b>"+countryNamesByCode[iso3]+"</b>";
       }

       if(text != null){
        showTooltip(e,text);
       }
    })
    .on("mouseout", hideTooltip);

});

/*
             if (selectedCountry != null) {
               if (selectedCountry !== iso3) {
                 val = getInterpolatedNumberOfMigrants(selectedCountry, iso3, selectedYear);
                 text = "<b>"+countryNamesByCode[iso3]+"</b>" + (!isNaN(val) ? ": <br>" +
                   msg("tooltip.migrants.number.from-a",
                     numberFormat(val),
                     countryNamesByCode[selectedCountry]) :
                     ": " + numberFormat(val));
               }
             }

             if (text === null) {
               if (highlightedCountry != null) {
                 vals = remittanceTotalsByMigrantsOrigin[highlightedCountry];
                 if (vals != null) {
                   val = vals[selectedYear];
                   text = "<b>"+countryNamesByCode[iso3]+"</b>" +
                     (!isNaN(val) ? ": <br>" +
                       msg("tooltip.remittances.amount", moneyMillionsFormat(val)) :
                       ": " + numberFormat(val));
                 }
               }
             }

             if (text !== null) showTooltip(e, text);*/
           












