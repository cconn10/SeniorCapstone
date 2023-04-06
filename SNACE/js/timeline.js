class Timeline {
    constructor(_config, _dispatcher, _data) {
        this.config = {
			parentElement: _config.parentElement,
			containerWidth: _config.containerWidth || 500,
			containerHeight: _config.containerHeight || 140,
			margin: { top: 20, bottom: 45, right: 50, left: 50 }
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
        
        vis.teams = vis.data.teams;
        
        // Fill array with all 10 player names (5 from each team object)
        vis.players = Object.getOwnPropertyNames(vis.data[vis.teams[0]]);
        vis.players = vis.players.concat(Object.getOwnPropertyNames(vis.data[vis.teams[1]]));

		// Define size of SVG drawing area
		vis.svg = d3.select(vis.config.parentElement)
			.attr('width', vis.config.containerWidth)
			.attr('height', vis.config.containerHeight);

		// Append group element that will contain our actual chart (see margin convention)
		vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize scales with only range (domain is dependent on data filtering in updateVis())
        vis.xScale = d3.scaleTime()
			.domain(d3.extent(vis.data.timestamps))
            .range([0, vis.width]);
        
        // TODO: Use altitude data for y axis?
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize axes - NOTE: no yAxis drawn
        vis.xAxis = d3.axisBottom(vis.xScale)
			.tickFormat(d3.timeFormat("%M:%S"))
            .tickSizeOuter(0)

		// Append x-axis group and move it to the bottom of the chart
		vis.xAxisG = vis.chart.append('g')
			.attr('class', 'axis x-axis')
			.attr('transform', `translate(0,${vis.height})`)

		// Empty tooltip group
		vis.tooltip = vis.chart.append('g')
            .attr('class', 'tooltip')

		vis.tooltip.append('rect')
            .attr('class', 'tooltip-bar detailed')
            .attr('id', 'tooltip-bar-detailed')
            .attr('width', 2)
            .attr('height', vis.height)
            .attr('x', -1)
            .attr('y', 0)
            .attr('fill', '#ECB0E1')
            .attr('display', 'none');

		// Initialize brush component
		vis.brush = d3.brushX()
			.extent([[0, 0], [vis.width, vis.height]])
			.on('brush', function({selection}, event) {
				if (selection) vis.brushed(selection, event);
			})
			.on('end', function({selection}, event) {
				if (!selection) vis.brushed(null, event);
			});	

		vis.brushG = vis.chart.append('g')
			.attr('class', 'brush x-brush');

		vis.selectedPlayer = vis.players[0]
		vis.selectedTeam = vis.teams[0]
	}

	updateVis() {
        let vis = this;

		// Process timestamps from data, set axis domain
		// (This is in updateVis() for consistency but only happens once; timeline axis is "constant")

		vis.timestamps = [];
		vis.deaths = [];
		vis.finalBlows = [];

        vis.dataOverTime = []
        vis.lives = []

        let currentLife = []
		let parseTime = d3.timeFormat("%H:%M:%S")

        for(const timestamps of vis.data.timestamps){
			let timestampString = parseTime(timestamps)
            let x = +vis.data[vis.selectedTeam][vis.selectedPlayer][timestampString]['pos_x']
            let z = +vis.data[vis.selectedTeam][vis.selectedPlayer][timestampString]['pos_z']

            if(!isNaN(x) && !isNaN(z))
            	vis.dataOverTime.push({time: new Date(`2000-01-01T${timestampString}`), 
                    x: x, 
                    z: z, 
                    death: vis.data[vis.selectedTeam][vis.selectedPlayer][timestampString]['death'] })
        }

        vis.trimRespawn = function(currentLife) {
            let deathPosition = currentLife[0]

            while (currentLife.length > 0)
            {
                if(currentLife[0].x != deathPosition.x || currentLife[0].z != deathPosition.z)
                    break
                else{
                    currentLife.splice(0, 1)
                }
            }

        }
        vis.dataOverTime.forEach(timeStamp => {
			if(timeStamp != vis.dataOverTime[0]){
				if(timeStamp.time - vis.dataOverTime[vis.dataOverTime.indexOf(timeStamp) - 1].time > 3000){
					vis.trimRespawn(currentLife)

					vis.lives.push(currentLife)
					currentLife = [timeStamp]
				}
			}

			currentLife.push(timeStamp)

            if(timeStamp.death){
				vis.trimRespawn(currentLife)

                vis.lives.push(currentLife)
                currentLife = []
            }
        })
        
		vis.trimRespawn(currentLife)
        vis.lives.push(currentLife)
        vis.lives = vis.lives.filter(l => l.length > 0)
		
		for(const property in vis.data[vis.teams[0]][vis.players[0]]) {
			if(vis.data[vis.selectedTeam][vis.selectedPlayer][property].death == true)
				vis.deaths.push(new Date(`2000-01-01T${property}`))
			if(vis.data[vis.selectedTeam][vis.selectedPlayer][property].final_blow == true)
				vis.finalBlows.push(new Date(`2000-01-01T${property}`))
		}

		vis.renderVis();
	}

	renderVis() {
		let vis = this;
	
		vis.chart.selectAll('.deathIcon')
			.remove()

		vis.chart.selectAll('.finalBlowIcon')
			.remove()

		vis.chart.selectAll('.deathIcon')
			.data(vis.deaths)
			.join('text')
				.attr('class', 'fa toggleIcon deathIcon')
				.attr('x', d => vis.xScale(d) - 7)
				.attr('y', ((2 * vis.height) / 3))
				.attr('fill', '#DE6C83')
				.attr('font-size', '14px')
				.text('\uf54c')

		vis.chart.selectAll('.finalBlowIcon')
			.data(vis.finalBlows)
			.join('text')
				.attr('class', 'fa toggleIcon finalBlowIcon')
				.attr('x', d => vis.xScale(d) - 7)
				.attr('y', (vis.height / 3))
				.attr('fill', '#DE6C83')
				.attr('font-size', '14px')
				.text('\uf05b')
					
		//TODO: Add translucent blocks for respawn after each death
		// vis.chart.selectAll('.respawn')
		// 	.data(vis.deaths)
		// 	.join('rect')
		// 		.attr('class', 'respawn')
		// 		.attr('x', d => vis.xScale(d))
		// 		.attr('y', 0)
		// 		.attr('width',  )
		// 		.attr('height', vis.height)
		// 		.attr('fill', 'black')
		// 		.attr('opacity', '0.2')

		vis.chart.selectAll('.lifeStart')
			.data(vis.lives)
			.join('rect')
				.attr('class', 'lifeStart')
				.attr('x', d => vis.xScale(d[0].time))
				.attr('y', 0)
				.attr('width', 2)
				.attr('height', vis.height)
				.attr('fill', '#DE6C83')
				.attr('opacity', '1')
	
		vis.chart.selectAll('.lifeEnd')
			.data(vis.lives)
			.join('rect')
				.attr('class', 'lifeEnd')
				.attr('x', d => vis.xScale(d[d.length-1].time))
				.attr('y', 0)
				.attr('width', 1)
				.attr('height', vis.height)
				.attr('fill', '#DE6C83')
				.attr('opacity', '1')

		// Update axis
		vis.xAxisG.call(vis.xAxis);
		
		// Update the brush and define a default position
		// TODO: change default position to something meaningful? Maybe first round?
		const defaultBrushSelection = [vis.xScale(d3.extent(vis.data.timestamps)[0]), vis.xScale(d3.extent(vis.data.timestamps)[1])];
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