class LineMulti {

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

        // Select parent node to add dropdown menus later; done here so that
        // the svg is the "active element" and this.parentNode works (I think)
        vis.parent = vis.svg.select(function() { return this.parentNode; });

        // Append group element that will contain chart (see margin convention)
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        // Initialize axes
        vis.xAxis = d3.axisBottom(vis.xScale)
            .tickFormat(d3.timeFormat("%H:%M:%S"))
            .ticks(6);
        vis.yAxis = d3.axisLeft(vis.yScale);

        // Append x-axis group and move it to the bottom of the chart
        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${vis.height})`)
        
        // Append y-axis group
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')

        // Empty tooltip group (hidden by default)
        vis.tooltip = vis.chart.append('g')
            .attr('class', 'tooltip')
            .style('display', 'none');

        vis.trackingArea = vis.chart.append('rect')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');

        vis.tooltip.append('path')
            .attr('stroke',  "gray")
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        vis.tooltip.append('circle')
            .attr('r', 3);

        vis.tooltip.append('text');
        
        vis.teams = vis.data.teams;
        vis.properties = Object.getOwnPropertyNames(vis.data[vis.data.teams[0]][vis.data.players[0]][vis.data.timestampStrings[0]]);

        // Insert checkbox containers before the chart (svg) within the parent div
        vis.team_div_a = vis.parent.insert('div', 'svg');
        vis.team_div_b = vis.parent.insert('div', 'svg');
        vis.playerToggle = {};
        vis.playerLabel = {};

        // Fill array with all 10 player names (5 from each team object)
        vis.players = Object.getOwnPropertyNames(vis.data[vis.teams[0]]);
        vis.players = vis.players.concat(Object.getOwnPropertyNames(vis.data[vis.teams[1]]));

        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.players)
            .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]);

        // Initialize lines for each player
        vis.lines = [];
        for (player of vis.players) {
            vis.lines[player] = vis.chart.append('path')
                .attr('class', 'chart-line');
        }
        
        // Add property select element
        vis.propSelect = vis.parent.insert('select', 'svg')
            .style('display', 'block')    
            .on('change', () => {
                vis.updateVis();
            });
        
        // Populate property select element with property names (already parsed into vis.properties)
        for (let i = 0; i < vis.properties.length; i++) {
            vis.propSelect.append('option')
                .attr('value', String(i))
                .text(vis.properties[i]);
        }

        // Fill checkbox containers with input elements for each player on both teams
        for (let i = 0; i < vis.players.length; i++) {
            // Append first 5 player checkboxes to team_div_a, other 5 to team_div_b
            if (i < vis.players.length / 2) {
                vis.playerToggle[vis.players[i]] = vis.team_div_a.append('input')
                vis.playerLabel[vis.players[i]] = vis.team_div_a.append('label')
            }
            else {
                vis.playerToggle[vis.players[i]] = vis.team_div_b.append('input');
                vis.playerLabel[vis.players[i]] = vis.team_div_b.append('label');
            }

            vis.playerToggle[vis.players[i]]
                .attr('type', 'checkbox')
                .attr('id', `playerToggle${i}`)
                .attr('value', vis.players[i])

            vis.playerLabel[vis.players[i]]
                .attr('for', `playerToggle${i}`)
                .text(vis.players[i]);

            if (i == 0) vis.playerToggle[vis.players[i]].property('checked', true);
        }

        for (const checkbox in vis.playerToggle) {
            vis.playerToggle[checkbox].attr('class', 'checkbox').on('click', () => {
                vis.updateVis(); 
            });
        }
    }


    updateVis() { 
        let vis = this;
        
        vis.dataOverTime = {};
        vis.dataOverTimeAll = [];
        // Find selected property from dropdown
        vis.selectedProperty = vis.properties[vis.propSelect.property('value')];
        
        // Loop through every player, checking if their box is checked
        for (player of vis.players) {
            if (vis.playerToggle[player].property('checked')) {
                vis.dataOverTime[player] = [];
                // The id of each checkbox element is "playerToggle[n]" where [n] is their index
                let playerNum = +vis.playerToggle[player].attr('id').slice(-1);
                // Find team index for each player based on player index
                let teamNum = playerNum < vis.players.length/2 ? 0 : 1;

                // Fill in subarray of {time, val} objects for graphing for each player
                for(const timestampString of vis.data.timestampStrings) {
                    if(!isNaN(+vis.data[vis.teams[teamNum]][vis.players[playerNum]][timestampString][vis.selectedProperty])) {
                        vis.dataOverTime[player].push({ "time": new Date(`2000-01-01T${timestampString}`), 
                                                "val": +vis.data[vis.teams[teamNum]][vis.players[playerNum]][timestampString][vis.selectedProperty] });
                    }
                }

                vis.dataOverTimeAll.push(...vis.dataOverTime[player]);
            }
            else {
                vis.lines[player].attr('visibility', 'hidden');
            }
        }
        
        //reusable functions for x and y 
        vis.xValue = d => d.time; 
        vis.yValue = d => d.val;

        // Set scale domains with processed data
        vis.xScale.domain(d3.extent(vis.dataOverTimeAll, d => vis.xValue(d)));
        vis.yScale.domain(d3.extent(vis.dataOverTimeAll, d => vis.yValue(d)));

        vis.bisectTime = d3.bisector(vis.xValue).left;

        vis.renderVis();
    }


    renderVis() { 
        let vis = this;

        // Initialize line generator helper function
        vis.line = d3.line()
            .x(d => vis.xScale(vis.xValue(d)))
            .y(d => vis.yScale(vis.yValue(d)));

        // Add line paths
        
        for (player of Object.getOwnPropertyNames(vis.dataOverTime)) {
            if (player == 0) break;

            vis.lines[player]
                .data([vis.dataOverTime[player]])
                .attr('stroke',  vis.colorScale(player))
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('visibility', 'visible')
                .attr('d', vis.line);
        }

        vis.trackingArea
            .on('mouseenter', () => {
                vis.tooltip.style('display', 'block');
            })
            .on('mouseleave', () => {
                vis.tooltip.style('display', 'none');
            })
            .on('mousemove', function(event) {
                // Get date that corresponds to current mouse x-coordinate
                const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
                const time = vis.xScale.invert(xPos);
        
                // Find nearest data point to mouse pointer:

                // First get a player name whose line is being drawn/shown
                const player_1 = Object.getOwnPropertyNames(vis.dataOverTime)[0];
                
                // Then use previously defined bisector to get the index of that player's dataOverTime array nearest to the mouse
                const index = vis.bisectTime(vis.dataOverTime[player_1], time, 1);

                // Check the values left and right of the mouse pointer to see which is actually closest
                const a = vis.dataOverTime[player_1][index - 1];
                const b = vis.dataOverTime[player_1][index];
                const d = b && (time - a.time > b.time - time) ? b : a; 
        
                // Update tooltip
                vis.tooltip.select('circle')
                    .attr('transform', `translate(${vis.xScale(d.time)},${vis.yScale(d.val)})`);
                
                vis.tooltip.select('text')
                    .attr('transform', `translate(${vis.xScale(d.time)},${(vis.yScale(d.val) - 15)})`)
                    .text(Math.round(d.val));

                // Data points to create a vertical line at d.time
                let lineToolData = [{"time": d.time, "val": d3.min(vis.dataOverTimeAll, d => vis.yValue(d))}, 
                                    {"time": d.time, "val": d3.max(vis.dataOverTimeAll, d => vis.yValue(d))}]

                vis.tooltip.select('path')
                    .data([lineToolData])
                    .attr('d', vis.line);
            });

        // Update the axes
        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);
    }
}