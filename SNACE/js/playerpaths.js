class PlayerPaths {

    constructor(_config, _dispatcher, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 20, right: 10, bottom: 40, left: 50 }
        }

        this.dispatcher = _dispatcher
        this.data = _data

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.teams = vis.data.teams
        vis.players = vis.data.players

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom

        vis.chart = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth )
            .attr('height', vis.config.containerHeight)
            .append('g')
                .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
            .nice();
        vis.zScale = d3.scaleLinear()
            .range([0, vis.height])
            .nice();

        vis.mapScale = d3.scaleLinear()
            .range([0, vis.height])
            .nice();
    
        vis.xAxis = d3.axisTop(vis.xScale)
        vis.yAxis = d3.axisLeft(vis.zScale)
        
        vis.colorScale = d3.scaleOrdinal(d3.schemeTableau10)

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
    
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')   

        vis.line = d3.line()
        .x(d => vis.xScale(vis.xValue(d)))
        .y(d => vis.zScale(vis.yValue(d)))
        .curve(d3.curveLinear)
        
    }

    updateVis() {
        let vis = this

        vis.dataOverTime = []
        vis.lives = []

        vis.selectedTeam = vis.teams[0]
        vis.selectedPlayer = vis.players[0]

        let currentLife = []

        for(const timestampString of vis.data.timestampStrings){
            let x = +vis.data[vis.selectedTeam][vis.selectedPlayer][timestampString]['pos_x']
            let z = +vis.data[vis.selectedTeam][vis.selectedPlayer][timestampString]['pos_z']

            if(!isNaN(x) && !isNaN(z))
            	vis.dataOverTime.push({time: new Date(`2000-01-01T${timestampString}`), 
                    x: x, 
                    z: z, 
                    death: vis.data[vis.selectedTeam][vis.selectedPlayer][timestampString]['death'] })
        }

        vis.trimRespawn = function (currentLife) {
            let deathPosition = currentLife[0]
                    
            while (true)
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


		//uncomment to see just one line
		//vis.lives = [vis.lives[5]]

        vis.xValue = d => d.x;
        vis.yValue = d => d.z;
        
        vis.xExtent = d3.extent(vis.dataOverTime, d => vis.xValue(d))
        vis.zExtent = d3.extent(vis.dataOverTime, d => vis.yValue(d))

        vis.xWidth = vis.xExtent[1] - vis.xExtent[0]
        vis.zWidth = vis.zExtent[1] - vis.zExtent[0]

        if(vis.xWidth > vis.zWidth){
            vis.xExtent[0] -= 10
            vis.xExtent[1] += 10
            vis.zExtent[0] -= (vis.xWidth - vis.zWidth)/2 + 10
            vis.zExtent[1] += (vis.xWidth - vis.zWidth)/2 + 10
        }
        else {
            vis.zExtent[0] -= 10
            vis.zExtent[1] += 10
            vis.xExtent[0] -= (vis.zWidth - vis.xWidth)/2 + 10
            vis.xExtent[1] += ((vis.zWidth - vis.xWidth)/2 + 10)
        }

        vis.xScale.domain(vis.xExtent).nice()
        vis.zScale.domain(vis.zExtent).nice()

        vis.colorScale.domain(vis.lives)
            
        vis.renderVis()

    }

    renderVis() {
        let vis = this

        console.log(vis.lives)

        vis.chart.selectAll('path')
        .data(vis.lives)
        .join('path')
            .attr('d', d => vis.line(d))
            .attr('stroke', d => vis.colorScale(d))
            .attr('stroke-width', 1)
            .attr('opacity', 2)
            .attr('fill', 'none')
        vis.chart.selectAll('circle')
            .data(vis.lives)
            .join('circle')
                .attr('cx', d => vis.xScale(vis.xValue(d[0])))
                .attr('cy', d => vis.zScale(vis.yValue(d[0])))
                .attr('r', 3)
                .attr('fill', d => vis.colorScale(d))
                .attr('stroke', "#3f3f3f")
                .attr('stroke-width', 1)

        vis.xAxisG.call(vis.xAxis)
        vis.yAxisG.call(vis.yAxis)
    }

}