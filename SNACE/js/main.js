console.log("Hello world");
let data;

// Initialize dispatcher that is used to orchestrate events
const dispatcher = d3.dispatch('filterTime');

d3.json('data/json/Kings_Row_Log.json')
  .then(_data => {
  	console.log('Data loading complete. Work with dataset.');
  	data = _data["King's Row"];

	const dataOverTime = [];
	data.teams = Object.getOwnPropertyNames(data);
	data.players = Object.getOwnPropertyNames(data[data.teams[0]]);
	data.timestampStrings = Object.getOwnPropertyNames(data[data.teams[0]][data.players[0]]);
	data.timestamps = [];
	for(const property in data[data.teams[0]][data.players[0]]) {
		data.timestamps.push(new Date(`2000-01-01T${property}`));
	}

    lineChart = new LineSimple({
			'parentElement': '#line',
			'containerHeight': 500,
			'containerWidth': 1500
		}, dispatcher, data);
	lineChart.updateVis();

	timeline = new Timeline({
		'parentElement': '#timeline',
		'containerHeight': 100,
		'containerWidth': 1500
	}, dispatcher, data);
	timeline.updateVis();
});


let players = {}

let player = "Reginald"

let dataOverTime = []

d3.json('data/json/2a6fbcaa-184c-4de4-87b7-8e2e88f924b3-Team-1-Team-2.json')
    .then(_data => {
		data = _data["Blizzard World"]

		const teams = Object.getOwnPropertyNames(data);
		const players = Object.getOwnPropertyNames(data[teams[0]]);
		const timestamps = Object.getOwnPropertyNames(data[teams[0]][players[0]]);

        for(let property in data[teams[0]][player]){
			if(!isNaN(+data[teams[0]][player][property]['pos_x']) && !isNaN(+data[teams[0]][player][property]['pos_z']))
            	dataOverTime.push({time: new Date(`2000-01-01T${property}`), x: +data[teams[0]][player][property]['pos_x'], z: +data[teams[0]][player][property]['pos_z'], death: data[teams[0]][player][property]['death'] })
        }
        
        let currentLife = []
        let lives = []

        dataOverTime.forEach(timeStamp => {
			if(timeStamp != dataOverTime[0]){
				if(timeStamp.time - dataOverTime[dataOverTime.indexOf(timeStamp) - 1].time > 3000){

					trimRespawn(currentLife)

					lives.push(currentLife)
					currentLife = [timeStamp]
				}
			}

			currentLife.push(timeStamp)

            if(timeStamp.death){
				trimRespawn(currentLife)

                lives.push(currentLife)
                currentLife = []
            }
        })
		trimRespawn(currentLife)
        lives.push(currentLife)

		//uncomment to see just one line
		//lives = [lives[9]]
		console.log(lives)

        playerPaths = new PlayerPaths({
            'parentElement': '#player-path',
			'containerHeight': 1000,
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

	function trimRespawn(currentLife){
		
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