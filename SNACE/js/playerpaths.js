class PlayerPaths {

    constructor(_config, _data, _lines) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 20, right: 0, bottom: 40, left: 50 }
        }
        this.data = _data
        this.lines = _lines

        this.initVis();
    }

    initVis() {
        let vis = this;


        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom

        vis.xValue = d => d.x;
        vis.yValue = d => d.z;

        vis.chart = d3.select(vis.config.parentElement)
            .attr('width', vis.width)
            .attr('height', vis.height)
            .append('g')
                .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d.x))
            .range([0, vis.width])
            .nice();
    
        vis.yScale = d3.scaleLinear()
            .domain(d3.extent(vis.data, d => d.z))
            .range([0, vis.height])
            .nice();
    
        vis.xAxis = d3.axisTop(vis.yScale)
        vis.yAxis = d3.axisLeft(vis.yScale)
        
        // vis.xAxisGrid = d3.axisBottom(vis.yScale).tickSize(-vis.containerHeight).tickFormat('')
        // vis.yAxisGrid = d3.axisBottom(vis.yScale).tickSize(-vis.containerWidth).tickFormat('')

        console.log(vis.lines)

        vis.colorScale = d3.scaleOrdinal(d3.schemeTableau10)
            .domain(vis.lines)

        vis.xAxisGroup = vis.chart.append('g')
            .attr('class', 'axis x-axis')
            .call(vis.xAxis)
    
        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'axis y-axis')
            .call(vis.yAxis)
    
        // vis.yAxisGridGroup = vis.chart.append('g')
        //     .attr('class', 'axis-grid')
        //     .call(vis.yAxisGrid)

        // vis.xAxisGridGroup = vis.chart.append('g')
        //     .attr('class', 'axis-grid')
        //     .call(vis.xAxisGrid)
        
        vis.line = d3.line()
            .x(d => vis.yScale(vis.xValue(d)))
            .y(d => vis.yScale(vis.yValue(d)))
            .curve(d3.curveLinear);

        
        
    }

    updateVis() {
        let vis = this

        vis.renderVis()

    }

    renderVis() {
        let vis = this

        vis.chart.selectAll('path')
        .data(vis.lines)
        .join('path')
            .attr('d', d => vis.line(d))
            .attr('stroke', d => vis.colorScale(d))
            .attr('fill', 'none')

        vis.chart.selectAll('circle')
            .data(vis.lines)
            .join('circle')
                .attr('cx', d => vis.yScale(vis.xValue(d[0])))
                .attr('cy', d => vis.yScale(vis.yValue(d[0])))
                .attr('r', "3")
                .attr('fill', d => vis.colorScale(d))
                .attr('stroke', "#3f3f3f")
    }
}
