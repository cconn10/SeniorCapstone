class PlayerPaths {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 5, right: 0, bottom: 30, left: 50 }
        }
        this.data = _data

        this.initVis();
    }

    initVis() {
        let vis = this;

        console.log(vis.data)

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom

        vis.xValue = d => d.x;
        vis.yValue = d => d.y;

        const svg = d3.select(vis.config.parentElement)
            .attr('width', vis.width)
            .attr('height', vis.height)
     
        const g = svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    

        console.log(d3.extent(vis.data, d => d.x))
        console.log(d3.extent(vis.data, d => d.z))

        const xScale = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d.x))
            .range([0, vis.width])
            .nice();
    
        const yScale = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d.z))
            .range([0, vis.height])
            .nice();
    
        const xAxis = d3.axisBottom(yScale)

        const yAxis = d3.axisLeft(yScale)
    
        const xAxisGroup = g.append('g')
            .attr('class', 'axis x-axis')
            .call(xAxis)
    
        const yAxisGroup = g.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)
    
        const line = d3.line()
            .x(d => yScale(d.x))
            .y(d => yScale(d.z))
            .curve(d3.curveLinearClosed);
    
        g.append('path')
            .attr('d', line(vis.data))
            .attr('stroke', 'red')
            .attr('fill', 'none')
    }
}
