console.log("Hello world");
let data;

d3.json('data/json/Kings_Row_Log.json')
  .then(_data => {
  	console.log('Data loading complete. Work with dataset.');
  	data = _data["King's Row"];
    console.log(data);

	const dataOverTime = [];
	const teams = Object.getOwnPropertyNames(data);
	const players = Object.getOwnPropertyNames(data[teams[0]]);
	const timestamps = Object.getOwnPropertyNames(data[teams[0]][players[0]]);
	// console.log(teams);
	// console.log(players);
	// console.log(timestamps);
    
	// For each timestamp of Team 0's player 0:
    for(const property in data[teams[0]][players[4]]) {
		if(!isNaN(+data[teams[0]][players[4]][property].pos_y))
			dataOverTime.push({ "time": new Date(`2000-01-01T${property}`), "val": +data[teams[0]][players[4]][property].pos_y });
	}

	//console.log(dataOverTime);

    lineChart = new LineSimple({
			'parentElement': '#line',
			'containerHeight': 500,
			'containerWidth': 1500
		}, dataOverTime);

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
            'parentElement': '#player-path',
			'containerHeight': 700,
			'containerWidth': 1500
        }, dataOverTime, lives)

		playerPaths.renderVis()
        
    })