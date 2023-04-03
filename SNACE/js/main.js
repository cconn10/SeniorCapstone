console.log("Hello world");
let data;

const DATAFILE = 'data/json/2a6fbcaa-184c-4de4-87b7-8e2e88f924b3-Team-1-Team-2.json'
const MAP_NAME = "Blizzard World"

// Initialize dispatcher that is used to orchestrate events
const dispatcher = d3.dispatch('filterTime');

d3.json(DATAFILE)
  .then(_data => {
  	console.log('Data loading complete. Work with dataset.');
  	data = _data[MAP_NAME];

	data.teams = Object.getOwnPropertyNames(data);
	data.players = Object.getOwnPropertyNames(data[data.teams[0]]);
	data.timestampStrings = Object.getOwnPropertyNames(data[data.teams[0]][data.players[0]]);
	data.timestamps = [];

	for(const property in data[data.teams[0]][data.players[0]]) {
		data.timestamps.push(new Date(`2000-01-01T${property}`));
	}

	playerPaths = new PlayerPaths({
		'parentElement': '#player-path',
		'containerHeight': 500,
		'containerWidth': 500
	}, dispatcher, data)
	playerPaths.updateVis()
	
    lineChart = new LineSimple({
		'parentElement': '#chart-one',
		'containerHeight': 200,
		'containerWidth': 1300
		}, dispatcher, data);
	lineChart.updateVis();
	
    lineChart2 = new LineSimple({
		'parentElement': '#chart-two',
		'containerHeight': 200,
		'containerWidth': 1300
	}, dispatcher, data);
	lineChart2.updateVis();

	timeline = new Timeline({
		'parentElement': '#timeline',
		'containerHeight': 100,
		'containerWidth': 1300
	}, dispatcher, data);
	timeline.updateVis();

});

	dispatcher.on('filterTime', selectedDomain => {

		if (selectedDomain.length == 0) {
			
				lineChart.data = data;
			} else {
				lineChart.data.timestampStrings = [];
				for(const property in lineChart.data[lineChart.data.teams[0]][lineChart.data.players[0]]) {
					// data.timestamps.push(new Date(`2000-01-01T${property}`));
					let timestampTemp = new Date(`2000-01-01T${property}`);
					if (selectedDomain[0] <= timestampTemp && timestampTemp <= selectedDomain[1]) {
						lineChart.data.timestampStrings.push(property);
					}
				}}
			lineChart.updateVis();
			lineChart2.updateVis();
			lineChart3.updateVis();
	});