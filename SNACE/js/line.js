class LineSimple {

    constructor(_config, _dispatcher, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 10, bottom: 5, right: 50, left: 50 }
        }
        
        this.dispatcher = _dispatcher;
        this.data = _data;

        this.initVis();
    }

    initVis() {
      
        let vis = this;

        vis.teams = vis.data.teams;
        
        // Fill array with all 10 player names (5 from each team object)
        vis.players = Object.getOwnPropertyNames(vis.data[vis.teams[0]]);
        vis.players = vis.players.concat(Object.getOwnPropertyNames(vis.data[vis.teams[1]]));

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Initialize scales
        vis.xScale = d3.scaleTime()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.players)
            .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Select parent node to add dropdown menus later; done here so that
        // the svg is the "active element" and this.parentNode works (I think)
        vis.parent = vis.svg.select(function() { return this.parentNode; });

        // Append group element that will contain chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize line
        vis.linePath = vis.chart.append('path')
            .attr('class', 'chart-line');

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks("")
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Append x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`)
        
        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')

        // Empty tooltip group
        vis.tooltip = vis.chart.append('g')
            .attr('class', 'tooltip')

        vis.tooltipClicked = false;

        vis.trackingArea = vis.chart.append('rect')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');

        vis.tooltip.append('path')
            .attr('class', 'tooltip-path hover')
            .attr('id', 'tooltip-path-hover')
            .attr('stroke',  "gray")
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('display', 'none');

        vis.tooltip.append('circle')
            .attr('class', 'tooltip-circle hover')
            .attr('id', 'tooltip-circle-hover')
            .attr('r', 3)
            .attr('display', 'none');

        vis.tooltip.append('text')
            .attr('class', 'tooltip-text hover')
            .attr('id', 'tooltip-text-hover')
            .attr('display', 'none');
        
        vis.properties = Object.getOwnPropertyNames(vis.data[vis.data.teams[0]][vis.data.players[0]][vis.data.timestampStrings[0]]);

        // Default/initial selection
        vis.selectedTeam = vis.teams[0];
        vis.selectedPlayer = vis.players[0];
        vis.selectedProperty = vis.properties[0];
    }


    updateVis() { 
        let vis = this;
        
        vis.dataOverTime = [];
        
        // Fill in array of {time, val} objects for graphing
		for(const timestampString of vis.data.timestampStrings) {
            if(!isNaN(+vis.data[vis.selectedTeam][vis.selectedPlayer][timestampString][vis.selectedProperty])) {
                vis.dataOverTime.push({ "time": new Date(`2000-01-01T${timestampString}`), 
                                        "val": +vis.data[vis.selectedTeam][vis.selectedPlayer][timestampString][vis.selectedProperty] });
            }
        }
        
        //reusable functions for x and y 
        vis.xValue = d => d.time; 
        vis.yValue = d => d.val;

        // Set scale domains with processed data
        vis.xScale.domain(d3.extent(vis.dataOverTime, d => vis.xValue(d)));
        vis.yScale.domain(d3.extent(vis.dataOverTime, d => vis.yValue(d))).nice();

        vis.bisectTime = d3.bisector(vis.xValue).left;

        vis.renderVis();
    }


    renderVis() { 
        let vis = this;

        // Initialize line generator helper function
        vis.line = d3.line()
            .x(d => vis.xScale(vis.xValue(d)))
            .y(d => vis.yScale(vis.yValue(d)));

        // Add line path 
        vis.linePath
            .data([vis.dataOverTime])
            .attr('stroke',  vis.colorScale(vis.selectedPlayer))
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('d', vis.line);

            vis.trackingArea
            .on('mouseenter', (event) => {
                vis.dispatcher.call('lineTooltipEnter', event);
            })
            .on('mouseleave', (event) => {
                vis.dispatcher.call('lineTooltipLeave', event);
            })
            .on('mousemove', function(event) {
                // Get date that corresponds to current mouse x-coordinate
                const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
                const time = vis.xScale.invert(xPos);
        
                // Find nearest data point to mouse pointer:
                
                // Use previously defined bisector to get the index of that player's dataOverTime array nearest to the mouse
                const index = vis.bisectTime(vis.dataOverTime, time, 1);

                // Check the values left and right of the mouse pointer to see which is actually closest
                const a = vis.dataOverTime[index - 1];
                const b = vis.dataOverTime[index];
                const d = b && (time - a.time > b.time - time) ? b : a;

                vis.dispatcher.call('lineTooltipMove', event, d.time);
        
                // // Update tooltip
                // vis.tooltip.select('#tooltip-circle-hover')
                //     .attr('transform', `translate(${vis.xScale(d.time)},${vis.yScale(d.val)})`);
                
                // vis.tooltip.select('#tooltip-text-hover')
                //     .attr('transform', `translate(${vis.xScale(d.time)},${(vis.yScale(d.val) - 15)})`)
                //     .text(Math.round(d.val));

                // // Data points to create a vertical line at d.time
                // let lineToolData = [{"time": d.time, "val": d3.min(vis.dataOverTime, d => vis.yValue(d))}, 
                //                     {"time": d.time, "val": d3.max(vis.dataOverTime, d => vis.yValue(d))}]

                // vis.tooltip.select('#tooltip-path-hover')
                //     .data([lineToolData])
                //     .attr('d', vis.line);
            });

        // Update the axes
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
}