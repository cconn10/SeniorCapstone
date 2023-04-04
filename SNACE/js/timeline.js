class Timeline {
    constructor(_config, _dispatcher, _data) {
        this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 500,
			containerHeight: _config.containerHeight || 140,
			margin: { top: 2, bottom: 50, right: 50, left: 50 }
        }
		
		this.dispatcher = _dispatcher;
        this.data = _data;
    
        // Call a class function
        this.initVis();
	}

	initVis() {
        let vis = this;

        // Width and height of just graph area            
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        
		// Define size of SVG drawing area
		vis.svg = d3.select(vis.config.parentElement)
			.attr('width', vis.config.containerWidth)
			.attr('height', vis.config.containerHeight);

		// Append group element that will contain our actual chart (see margin convention)
		vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize scales with only range (domain is dependent on data filtering in updateVis())
        vis.xScale = d3.scaleTime()
            .range([0, vis.width]);
        
        // TODO: Use altitude data for y axis?
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes - NOTE: no yAxis drawn
        vis.xAxis = d3.axisBottom(vis.xScale)
			.tickFormat(d3.timeFormat("%H:%M:%S"));

		// Append x-axis group and move it to the bottom of the chart
		vis.xAxisG = vis.chart.append('g')
			.attr('class', 'axis x-axis')
			.attr('transform', `translate(0,${vis.height})`)

		// Initialize brush component
		vis.brush = d3.brushX()
			.extent([[0, 0], [vis.width, vis.height - 1]])
			.on('brush', function({selection}, event) {
				if (selection) vis.brushed(selection, event);
			})
			.on('end', function({selection}, event) {
				if (!selection) vis.brushed(null, event);
			});	

		vis.brushG = vis.chart.append('g')
			.attr('class', 'brush x-brush');
	}

	updateVis() {
        let vis = this;

		// Process timestamps from data, set axis domain
		// (This is in updateVis() for consistency but only happens once; timeline axis is "constant")
		vis.teams = Object.getOwnPropertyNames(vis.data);
        vis.players = Object.getOwnPropertyNames(vis.data[vis.teams[0]]);
		vis.timestamps = [];
		for(const property in vis.data[vis.teams[0]][vis.players[0]]) {
        	vis.timestamps.push(new Date(`2000-01-01T${property}`));
		}

		vis.xScale.domain(d3.extent(vis.timestamps));

		vis.renderVis();
	}

	renderVis() {
		let vis = this;
		
		// Update axis
		vis.xAxisG.call(vis.xAxis);
		
		// Update the brush and define a default position
		// TODO: change default position to something meaningful? Maybe first round?
		const defaultBrushSelection = [vis.xScale(d3.extent(vis.timestamps)[0]), vis.xScale(d3.extent(vis.timestamps)[1])];
		vis.brushG
			.call(vis.brush)
			.call(vis.brush.move, defaultBrushSelection);
	}

	brushed(selection, event) {
		let vis = this;
	
		// Check if the brush is still active or if it has been removed
		if (selection) {
			// Convert given pixel coordinates (range: [x0,x1]) into a time period (domain: [Date, Date])
			const selectedDomain = selection.map(vis.xScale.invert, vis.xScale);
			
			// Call dispatcher to filter all affected charts to show only timestamps within selectedDomain
			vis.dispatcher.call('filterTime', event, selectedDomain);
		}
		else {
			// Reset x-scale of all affected charts
			vis.dispatcher.call('filterTime', event, vis.xScale.domain());
		}
	}
}