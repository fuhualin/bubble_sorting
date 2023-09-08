var w = 650, h = 200,
    num = document.getElementById("elements").value, 
    speed = document.getElementById("speed").value,
    //algo = "selectionSort",
    dataSet, scale, padding = 2, timer, 
    states = {"default": 0, "sorted": 1, "minimum": 2, "compare": 3, "swapping":4, "inactive": 5},
    color = ["cyan", "blue", "red", "green", "yellow", "lightgray"],
    paused = true, initPlay = true, hline = -1, // hline - which line to highlight in code
    urlcpp, urljava, urlpython, urlpseudo, urlindex = 0, //urlindex - which code url is currently selected
    expandArea = false, textShow = true, strAction="", //textshow - toggle-text on bars, expandArea - zoomin or out, strAction - current action label
    strDefault = "Press PLAY button to start sorting", // default action Label
    record, extraRecord, playIndex = 0, tempdata,
    minValue = 2, maxValue = 1000, maxElements = 100,
    svg;

generateData(num);
visualBars(dataSet);
document.getElementById("stop").disabled = true; 
actionLabel(strDefault);

function print(arr)
{
    var output = "";
    for(var k = 0; k<arr.length; k++)
        output+= arr[k].value + " ";

    console.log("output = " + output);
}

function setNum()
{
    if(num > maxElements) num = maxElements;
    else if(num < 0) num = 0;
    document.getElementById("elements").value = num;
}

function recordData(dataSet)
{
    record.push(cloneData(dataSet));
    extraRecord.push([hline, strAction]);
}

function actionLabel(str)
{
    d3.select("#action").text(str);
}

function addNotify(value)
{
    actionLabel(value + " has been added. (Range: [" + minValue + ", " + maxValue + "])");
}

function cloneData(dataSet)
{
    var clone = [];
    for(var k = 0; k<dataSet.length; k++)
    {
        clone.push({ value : dataSet[k].value, state : dataSet[k].state });
    }
    return clone;
}

function generateData(num)
{
    dataSet = [];
    for(var i = 0; i<num ; i++)
    {
        dataSet[i] = { value : minValue + Math.floor((Math.random()*num*10)),
                        state: states.default };  

        if(dataSet[i].value > maxValue) dataSet[i].value = maxValue;               
    }
    scale = d3.scale.linear()
            .domain([0, d3.max(dataSet, function(d) {return d.value} )])
            .range([0, h]);

    tempdata = []; tempdata = cloneData(dataSet);
}

function visualBars(dataSet)
{
    scale = d3.scale.linear()
            .domain([0, d3.max(dataSet, function(d) {return d.value} )])
            .range([0, h])
            
    document.getElementById("visualBox").innerHTML = "";

    svg = d3.select("#visualBox")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
        
    var div = d3.select("#visualBox").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var bars = svg.selectAll(".bar")
                .data(dataSet)
                .enter()
                    .append("g")
                    .attr("class","bar");

    bars.append("rect")
        .attr("x", function(d, i) { return i * (w / dataSet.length); } )
        .attr("y", function(d) {return h - scale(d.value); })
        .attr("width", function(d) {return w / dataSet.length - padding; })
        .attr("height", function(d) {return scale(d.value); })
        .style("fill", function(d) {return color[d.state]; } )
        .on("mouseover", function(d, i) {
            var rect = d3.select(this);
            rect.attr("class", "hover");
            var val = d.value;
            div.transition()
              .duration(50)
              .style("opacity", 0.9);
            div.html("<span class='amount'>" + val + "</span>")
              .style("left", i * (w / dataSet.length) + "px")
              .style("top", (d3.event.pageY - 150) + "px");
          })
          .on("mouseout", function() {
            var rect = d3.select(this);
            rect.attr("class", "mouseoff");
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });

    if(textShow === true)
    {
        bars.append("text")
        .attr("fill","black")
        .attr("x", function(d, i) { return i* (w/ dataSet.length) + (w/6)/dataSet.length; })
        .attr("y", function(d) { return h - 10; })
        .style("font-size", function(d) { return  (w/3) / dataSet.length + "px"; })
        .text(function(d) { return d.value; });
    }
}

function redrawBars(dataSet)
{
    var bars = svg.selectAll("rect")
                .data(dataSet)
                .transition()
                .duration(speed / 2)
                

    bars.attr("x", function(d, i) { return i * (w / dataSet.length); } );
    bars.attr("y", function(d) {return h - scale(d.value); });
    bars.attr("width", function(d) {return w / dataSet.length - padding; });
    bars.attr("height", function(d) {return scale(d.value); });
    bars.style("fill", function(d) {return color[d.state]; } );

    var txt = svg.selectAll("text")
                .data(dataSet)
                .transition()
                .duration(speed/2);

    txt.attr("fill","black")
    .attr("x", function(d, i) { return i* (w/ dataSet.length) + (w/6)/dataSet.length; })
    .attr("y", function(d) { return h - 10; })
    .style("font-size", function(d) { return  (w/3) / dataSet.length + "px"; })
    .text(function(d) { return d.value; });
}


document.getElementById("text-show").addEventListener("click", function()
{
    if(textShow === false) textShow = true;
    else textShow = false;
    dataSet = []; dataSet = cloneData(tempdata);
    visualBars(dataSet);
    tempdata = []; tempdata = cloneData(dataSet);
    sortData();
});

document.getElementById("random").addEventListener("click", function()
{
    actionLabel(strDefault);
    clearInterval(timer);
    paused = true; 
    // enable and disable things, and also change the play-pause icon
    d3.select("#play>span").classed("glyphicon-play",true);
    d3.select("#play>span").classed("glyphicon-pause",false);

    document.getElementById("play").disabled = false; 
    document.getElementById("stepback").disabled = false; 
    document.getElementById("stepforward").disabled = false;

    document.getElementById("stop").disabled = true;

    document.getElementById("add").disabled = false; 
    document.getElementById("addrandom").disabled = false;

    speed = document.getElementById("speed").value;
    num = document.getElementById("elements").value;
    if(num > maxElements || num < 0)
    {
        setNum();
        alert("Number of elements should be between 0 and " + maxElements + " inclusive.");
    } 
    else
    {
        generateData(num);
        init(); // will make initPlay = true
        visualBars(dataSet);
        tempdata = []; tempdata = cloneData(dataSet);
        sortData();    
    }

    
});

document.getElementById("addrandom").addEventListener("click", function()
{
    //clearInterval(timer);
    if(dataSet.length < maxElements)
    {
        var rand;
        if(num == 0)
        {
            rand = { value : Math.floor(minValue + Math.random() * 10 ),
                       state : states.default };
        }
        else
        {
            rand = { value : minValue + Math.floor(Math.random() * d3.max(dataSet, function(d) {return d.value + 3;}) ),
                       state : states.default };
        }
        if(rand.value > maxValue) rand.value = maxValue;

        dataSet = []; dataSet = cloneData(tempdata);
        dataSet.push(rand);
        num++; 
        document.getElementById("elements").value = num;
        addNotify(dataSet[dataSet.length - 1].value);
        visualBars(dataSet);
        tempdata = []; tempdata = cloneData(dataSet);
        sortData();
    }
    else alert("Number of elements should be between 0 and " + maxElements + " inclusive.");
    
});

document.getElementById("add").addEventListener("click", function()
{
    //clearInterval(timer);
    if(dataSet.length < maxElements)
    {
        if(parseInt(document.getElementById("addtextfield").value) < minValue)
        {
            alert("The value of elements should be between " + minValue + " and " + maxValue + " inclusive.");
            //document.getElementById("addtextfield").value = minValue;
        }    
        else if(parseInt(document.getElementById("addtextfield").value) > maxValue)
        {
            alert("The value of elements should be between " + minValue + " and " + maxValue + " inclusive.");
            //document.getElementById("addtextfield").value = maxValue;
        }
        else
        {
            var rand = { value : parseInt(document.getElementById("addtextfield").value),
               state : states.default };
            dataSet = []; dataSet = cloneData(tempdata);
            dataSet.push(rand);
            num++; 
            document.getElementById("elements").value = num;
            addNotify(dataSet[dataSet.length - 1].value);
            visualBars(dataSet);
            tempdata = []; tempdata = cloneData(dataSet);
            sortData();
        }
    }
    else alert("Number of elements should be between 0 and " + maxElements + " inclusive.");
});

document.getElementById("clear").addEventListener("click", function()
{
    clearInterval(timer);
    actionLabel(strDefault);
    paused = true; 
    init(); // will make initPlay = false
    // enable and disable things, and also change the play-pause icon
    d3.select("#play>span").classed("glyphicon-play",true);
    d3.select("#play>span").classed("glyphicon-pause",false);

    document.getElementById("play").disabled = false; 
    document.getElementById("stepback").disabled = false; 
    document.getElementById("stepforward").disabled = false;

    document.getElementById("stop").disabled = true;

    document.getElementById("add").disabled = false; 
    document.getElementById("addrandom").disabled = false;

    speed = document.getElementById("speed").value;
    num = 0;
    generateData(num);
    visualBars(dataSet);
    document.getElementById("elements").value = num;
});

document.getElementById("expand").addEventListener("click", function()
{
    if(expandArea === false)
    {
        d3.select("#visual-area").classed("col-lg-7", false);
        d3.select("#visual-area").classed("col-lg-12", true);    
        d3.select("#expand>span").classed("glyphicon-resize-full", false);    
        d3.select("#expand>span").classed("glyphicon-resize-small", true);    
        d3.select("#color-table").classed("col-md-1", false);
        d3.select("#color-table").classed("col-md-4", true);
        d3.select("#element-control").classed("col-md-6", false);
        d3.select("#element-control").classed("col-md-8", true);

        expandArea = true; w = 1100; h = 300;
        dataSet = []; dataSet = cloneData(tempdata);
        visualBars(dataSet);
        tempdata = []; tempdata = cloneData(dataSet);
        sortData();
    }
    else
    {
        d3.select("#visual-area").classed("col-lg-7", true);
        d3.select("#visual-area").classed("col-lg-12", false);
        d3.select("#color-table").classed("col-md-4", false);
        d3.select("#color-table").classed("col-md-1", true);
        d3.select("#element-control").classed("col-md-8", false);
        d3.select("#element-control").classed("col-md-6", true);
        d3.select("#expand>span").classed("glyphicon-resize-small", false);
        d3.select("#expand>span").classed("glyphicon-resize-full", true);    
        expandArea = false; w = 650; h = 200;
        dataSet = []; dataSet = cloneData(tempdata);
        visualBars(dataSet);        
        tempdata = []; tempdata = cloneData(dataSet);
        sortData();
    } 
});

