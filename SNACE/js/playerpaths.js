class PlayerPaths {

    constructor(_config, _dispatcher, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 50, right: 30, bottom: 30, left: 50 }
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
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
            .append('g')
                .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleLinear()
            .range([vis.width, 0])
            .domain(vis.data.xRange)
            .nice();
        vis.zScale = d3.scaleLinear()
            .range([vis.height, 0])
            .domain(vis.data.zRange)
            .nice();
    
        vis.xAxisTop = d3.axisTop(vis.xScale)
            .ticks("")
        vis.yAxisLeft = d3.axisLeft(vis.zScale)
            .ticks("")

        vis.xAxisBottom = d3.axisTop(vis.xScale)
            .ticks("")
        vis.yAxisRight = d3.axisLeft(vis.zScale)
            .ticks("")
        
        vis.colorScale = d3.scaleOrdinal().range(["#6e40aa","#963db3","#bf3caf","#e4419d","#fe4b83","#ff5e63","#ff7847","#fb9633","#e2b72f","#c6d63c","#aff05b"])

        vis.xAxisTopGroup = vis.chart.append('g')
            .attr('class', 'axis x-axis')
        vis.xAxisBottomGroup = vis.chart.append('g')
            .attr('class', 'axis x-axis')
			.attr('transform', `translate(0,${vis.height})`)
    
        vis.yAxisLeftGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')   
        vis.yAxisRightGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')   
			.attr('transform', `translate(${vis.width}, 0)`)

        vis.selectedTeam = vis.teams[0]
        vis.selectedPlayer = vis.players[0]
    }

    updateVis() {
        let vis = this

        vis.dataOverTime = []
        vis.lives = []

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

        vis.xValue = d => d.x;
        vis.yValue = d => d.z;

        vis.colorScale.domain(vis.lives)

        vis.line = d3.line()
            .x(d => vis.xScale(vis.xValue(d)))
            .y(d => vis.zScale(vis.yValue(d)))
            .curve(d3.curveLinear)
        
        vis.chart.append('text')
            .data(vis.lives)
            .attr('x', vis.width + 10)
            .attr('y', (vis.height / 2))
            .attr('fill', 'black')
            .attr('class', 'fa toggleIcon')
            .attr('font-size', '30px')
            .text('\uf054')
            .on('click', (event, d) => {
                vis.dispatcher.call('nextPath', event, vis.lives.length)
            });

        vis.chart.append('text')
            .data(vis.lives)
            .attr('x', -30)
            .attr('y', (vis.height / 2))
            .attr('fill', 'black')
            .attr('class', 'fa toggleIcon')
            .attr('font-size', '30px')
            .text('\uf053')
            .on('click', (event, d) => {
                vis.dispatcher.call('previousPath', event, vis.lives.length)
            });

        vis.chart.append('text')
            .attr('x', vis.width*0.75)
            .attr('y', vis.height + 15)
            .attr('fill', 'black')
            .attr('font-size', '12px')
            .html(`Image courtesy of <a href="https://statbanana.com/images" target="_blank">Statbanana</a>`)
        
        vis.lives.displayedLife = [vis.lives[vis.data.pathShown]]
        //vis.lives.displayedLife = vis.lives
        vis.renderVis()

    }

    renderVis() {
        let vis = this

        vis.chart.selectAll('path')
        .remove()

        vis.chart.selectAll('path')
        .data(vis.lives.displayedLife)
        .join('path')
            .attr('d', d => vis.line(d))
            .attr('stroke', d => vis.colorScale(d))
            .attr('stroke-width', 1)
            .attr('fill', 'none')
        vis.chart.selectAll('circle')
            .data(vis.lives.displayedLife)
            .join('circle')
                .attr('cx', d => vis.xScale(vis.xValue(d[0])))
                .attr('cy', d => vis.zScale(vis.yValue(d[0])))
                .attr('r', 3)
                .attr('z-index', 1)
                .attr('fill', d => vis.colorScale(d))
                .attr('stroke', "#3f3f3f")
                .attr('stroke-width', 1)

        vis.xAxisTopGroup.call(vis.xAxisTop)
        vis.xAxisBottomGroup.call(vis.xAxisBottom)
        vis.yAxisLeftGroup.call(vis.yAxisLeft)
        vis.yAxisRightGroup.call(vis.yAxisRight)
    }

}