class LineSimple {

    constructor(_config, _dispatcher, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 10, bottom: 30, right: 50, left: 50 }
        }
        
        this.dispatcher = _dispatcher;
        this.data = _data;

        this.initVis();
    }

    initVis() {
      
        let vis = this;

        //set up the width and height of the area where visualizations will go- factoring in margins               
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // Initialize scales
        vis.xScale = d3.scaleTime()
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Define size of SVG drawing area
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        // Append group element that will contain chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize line
        vis.linePath = vis.chart.append('path')
            .attr('class', 'chart-line');

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d3.timeFormat("%H:%M:%S"));
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Append x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`)
        
        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')
    }


    updateVis() { 
        let vis = this;

        // Process data
        // TODO: select team, player via dropdown (or other interactivity)
        vis.teams = Object.getOwnPropertyNames(vis.data);
        vis.players = Object.getOwnPropertyNames(vis.data[vis.teams[0]]);
        vis.dataOverTime = [];
		for(const timestampString of vis.data.timestampStrings) {
            if(!isNaN(+vis.data[vis.teams[0]][vis.players[0]][timestampString].pos_y))
                vis.dataOverTime.push({ "time": new Date(`2000-01-01T${timestampString}`), 
                                        "val": +vis.data[vis.teams[0]][vis.players[0]][timestampString].pos_y });
		}
        
        //reusable functions for x and y 
        vis.xValue = d => d.time; 
        vis.yValue = d => d.val;

        // Set scale domains with processed data
        vis.xScale.domain(d3.extent(vis.dataOverTime, d => vis.xValue(d)));
        vis.yScale.domain(d3.extent(vis.dataOverTime, d => vis.yValue(d)));

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
            .attr('stroke',  '#8693a0')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('d', vis.line);

        // Update the axes
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
}