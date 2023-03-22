class PlayerPaths {

    constructor(_config, _dispatcher, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 20, right: 0, bottom: 40, left: 50 }
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
            .attr('width', vis.width)
            .attr('height', vis.height)
            .append('g')
                .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        vis.mapScale = d3.scaleLinear()
            .range([0, vis.height])
            .nice();
    
        vis.xAxis = d3.axisTop(vis.mapScale)
        vis.yAxis = d3.axisLeft(vis.mapScale)
        
        vis.colorScale = d3.scaleOrdinal(d3.schemeTableau10)

        vis.xAxisG = vis.chart.append('g')
            .attr('class', 'axis x-axis')
    
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis')        
        
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


        console.log(vis.lives)
		//uncomment to see just one line
		//vis.lives = [vis.lives[9]]

        vis.xValue = d => d.x;
        vis.yValue = d => d.z;
        
        vis.xExtent = d3.extent(vis.dataOverTime, d => vis.xValue(d))
        vis.zExtent = d3.extent(vis.dataOverTime, d => vis.yValue(d))

        vis.mapScale.domain(d3.extent(vis.xExtent.concat(vis.zExtent)))
        vis.colorScale.domain(vis.lives)

        vis.line = d3.line()
            .x(d => vis.mapScale(vis.xValue(d)))
            .y(d => vis.mapScale(vis.yValue(d)))
            .curve(d3.curveLinear)
            
        vis.renderVis()

    }

    renderVis() {
        let vis = this

        vis.chart.selectAll('path')
        .data(vis.lives)
        .join('path')
            .attr('d', d => vis.line(d))
            .attr('stroke', d => vis.colorScale(d))
            .attr('fill', 'none')
        vis.chart.selectAll('circle')
            .data(vis.lives)
            .join('circle')
                .attr('cx', d => vis.mapScale(vis.xValue(d[0])))
                .attr('cy', d => vis.mapScale(vis.yValue(d[0])))
                .attr('r', "3")
                .attr('fill', d => vis.colorScale(d))
                .attr('stroke', "#3f3f3f")

        vis.xAxisG.call(vis.xAxis)
        vis.yAxisG.call(vis.yAxis)
    }

}