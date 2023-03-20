console.log("Hello world");
let data;

// Initialize dispatcher that is used to orchestrate events
const dispatcher = d3.dispatch('filterTime');

d3.json('data/json/Kings_Row_Log.json')
  .then(_data => {
  	console.log('Data loading complete. Work with dataset.');
  	data = _data["King's Row"];
    console.log(data);

	const dataOverTime = [];
	data.teams = Object.getOwnPropertyNames(data);
	data.players = Object.getOwnPropertyNames(data[data.teams[0]]);
	data.timestampStrings = Object.getOwnPropertyNames(data[data.teams[0]][data.players[0]]);
	console.log(data.timestampStrings);
	data.timestamps = [];
	for(const property in data[data.teams[0]][data.players[0]]) {
		data.timestamps.push(new Date(`2000-01-01T${property}`));
	}

    lineChart = new LineSimple({
			'parentElement': '#chart-one',
			'containerHeight': 500,
			'containerWidth': 1500
		}, dispatcher, data);
	lineChart.updateVis();

	timeline = new Timeline({
		'parentElement': '#chart-two',
		'containerHeight': 100,
		'containerWidth': 1500
	}, dispatcher, data);
	timeline.updateVis();
});


let players = {}

let player = "Reginald"

let dataOverTime = []

d3.json('data/json/Paraíso_Log.json')
    .then(_data => {
		data = _data["Paraíso"]

		console.log(_data)

		const teams = Object.getOwnPropertyNames(data);
		const players = Object.getOwnPropertyNames(data[teams[0]]);
		const timestamps = Object.getOwnPropertyNames(data[teams[0]][players[0]]);

        for(let property in data[teams[0]][player]){
            dataOverTime.push({x: +data[teams[0]][player][property]['pos_x'], z: +data[teams[0]][player][property]['pos_z'], death: data[teams[0]][player][property]['death'] })
        }
        
        let currentLife = []
        let lives = []

        dataOverTime.forEach(timeStamp => {

        currentLife.push(timeStamp)
            if(timeStamp.death){
                lives.push(currentLife)
                currentLife = []
            }
        })
        lives.push(currentLife)

		//uncomment to see just one line
		//lives = [lives[2]]

		console.log(lives)

        playerPaths = new PlayerPaths({
            'parentElement': '#position-map',
			'containerHeight': 700,
			'containerWidth': 1500
        }, dataOverTime, lives)

		playerPaths.renderVis()
        
    })

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
				}
			}
			lineChart.updateVis();
	});