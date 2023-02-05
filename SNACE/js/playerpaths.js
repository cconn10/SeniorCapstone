class PlayerPaths {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 5, right: 0, bottom: 20, left: 50 }
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
            .attr('width', vis.width - vis.config.margin.right - vis.config.margin.left)
            .attr('height', vis.height - vis.config.margin.top - vis.config.margin.bottom)
     
        const g = svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    

        console.log(d3.extent(vis.data, d => d.x))
        console.log(d3.extent(vis.data, d => d.y))

        const xScale = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d.x))
            .range([0, vis.width]);
    
        const yScale = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d.y))
            .range([0, vis.height]);
    
        const xAxis = d3.axisBottom(xScale)

        const yAxis = d3.axisLeft(yScale)
    
        const xAxisGroup = g.append('g')
            .attr('class', 'axis x-axis')
            .call(xAxis)
    
        const yAxisGroup = g.append('g')
        .attr('class', 'axis y-axis')
        .call(yAxis)
    
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveLinearClosed);
    
        g.append('path')
            .attr('d', line(vis.data))
            .attr('stroke', 'red')
            .attr('fill', 'none')
    }
}
