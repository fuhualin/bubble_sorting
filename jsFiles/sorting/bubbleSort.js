urlpseudo = "./jsFiles/algoCode/bubbleSort";
urlcpp = "./jsFiles/algoCode/bubbleSort.cpp";
urljava = "./jsFiles/algoCode/bubbleSort.java";
urlpython = "./jsFiles/algoCode/bubbleSort.py";
d3.select("#algo-name").text("Bubble Sort");
displayCodeFromFile(urlpseudo);

sortData();

function swap(i, j)
{
    var temp = dataSet[i];
    dataSet[i] = dataSet[j]; 
    dataSet[j] = temp;
}
// bubbleSort
function sorting()
{
    if(playIndex >= 0 && playIndex<record.length )
    {
        dataSet = cloneData(record[playIndex]);
        hline = extraRecord[playIndex][0];
        strAction = extraRecord[playIndex][1];
        if(urlindex == 0) highlightCode(hline);
        actionLabel(strAction);
        redrawBars(dataSet);
        playIndex++;
    }
    else
    {
        clearInterval(timer);
    }
}

function sortData()
{
    record = []; extraRecord = []; hline = -1; playIndex = 0;
    strAction = "Starting to Sort";
    recordData(dataSet);
    for(var i = 0; i<dataSet.length; i++)
    {        
        for(var j = 1; j<dataSet.length - i; j++)
        {
            if(j>1)
            {
                if(dataSet[j - 2].state === states.compare || dataSet[j-2].state === states.swapping)   
                    dataSet[j - 2].state = states.default;
            }
            // turning j and j-1 into comparing
            dataSet[j].state = states.compare;
            dataSet[j - 1].state = states.compare;
            strAction = "Comparing " + dataSet[j-1].value + " and " + dataSet[j].value + "."; 
            hline = 2; recordData(dataSet);

            if(dataSet[j].value < dataSet[j-1].value ) //if swapping condition satsified
            {
             // turns both elements to swapping state
                dataSet[j].state = states.swapping;
                dataSet[j-1].state = states.swapping;    
                strAction = "Swapping " + dataSet[j-1].value + " and " + dataSet[j].value + "."; 
                hline = 3; recordData(dataSet);
                //swapping both elements
                swap(j, j-1); recordData(dataSet);
                //make j-1 as default and j as comapare   
                dataSet[j].state = states.compare;
                dataSet[j-1].state = states.default;   
                recordData(dataSet);
            }

            if(j == dataSet.length-i-1)
            {
                dataSet[j-1].state = states.default;
                dataSet[j].state = states.sorted;
                strAction = dataSet[j-1].value + " has been sorted.";
                recordData(dataSet);
            } 
        }
        if(i == dataSet.length - 1)
        {
            dataSet[0].state = states.sorted;
            strAction = dataSet[j-1].value + " has been sorted.";
            recordData(dataSet);
            strAction = "All data has been sorted.";
            recordData(dataSet);
        }
    }
}

function init()
{
    initPlay = false;
    for(var k = 0; k< num; k++)
    {
        dataSet[k].state = states.default;
    }
}
function startSort(firstPlay) // if firstPlay is true then playing, else its resume
{
    if(firstPlay === true) init();
    timer = setInterval(function() { sorting() }, speed );   
}