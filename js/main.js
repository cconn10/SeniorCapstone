console.log("Hello world");
let data;

d3.json('data/Kings_Row_Log.json')
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
		dataOverTime.push({ "time": new Date(`2000-01-01T${property}`), "val": +data[teams[0]][players[4]][property].dmg_taken });
	}

	console.log(dataOverTime);

    lineChart = new LineSimple({
			'parentElement': '#line',
			'containerHeight': 500,
			'containerWidth': 1500
		}, dataOverTime);

});