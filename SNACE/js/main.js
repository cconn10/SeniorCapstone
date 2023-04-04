let data;

const DATAFILE = 'data/json/2a6fbcaa-184c-4de4-87b7-8e2e88f924b3-Team-1-Team-2.json'
const MAP_NAME = "Blizzard World"
let lines = [];

// Initialize dispatcher that is used to orchestrate events
const dispatcher = d3.dispatch('filterTime','lineTooltipEnter', 'lineTooltipLeave', 'lineTooltipMove', 'lineTooltipClick', 'playerSelected', 'nextPath', 'previousPath');

d3.json(DATAFILE)
  .then(_data => {
  	data = _data[MAP_NAME];

	data.teams = Object.getOwnPropertyNames(data);
	data.players = (Object.getOwnPropertyNames(data[data.teams[0]]).concat(Object.getOwnPropertyNames(data[data.teams[1]])));
	data.timestampStrings = Object.getOwnPropertyNames(data[data.teams[0]][data.players[0]]);
	data.timestamps = [];

	let xExtent = []
	let zExtent = []
	let positions = []

	for (player of data.players) {
        for(const timestampString of data.timestampStrings){
			let team = data.teams[Math.floor(data.players.indexOf(player)/5)]

            let x = +data[team][player][timestampString]['pos_x']
            let z = +data[team][player][timestampString]['pos_z']

            if(!isNaN(x) && !isNaN(z))
            	positions.push({
                    x: x, 
                    z: z})
        }
	}

	xExtent = d3.extent(positions, d => d.x)
	zExtent = d3.extent(positions, d => d.z)

	let extents = normalizeExtent(xExtent, zExtent)
	data.xRange = extents[0]
	data.zRange = extents[1]

	data.LinePropLabels = {
		"dmg_dealt": "Damage Dealt",
		"barrier_dmg_dealt": "Barrier Damage Dealt",
		"dmg_blocked": "Damage Blocked",
		"dmg_taken": "Damage Taken",
		"deaths": "Deaths",
		"elims": "Eliminations",
		"final_blows": "Final Blows",
		"enviro_deaths": "Environmental Deaths",
		"enviro_kills": "Environmental Kills",
		"healing_dealt": "Healing Dealt",
		"obj_kills": "Objective Kills",
		"solo_kills": "Solo Kills",
		"ults_earned": "Ultimates Earned",
		"ults_used": "Ultimates Used",
		"healing_received": "Healing Received",
		"ult_charge": "Ultimate Charge (%)",
		"ability_1_cooldown": "Ability 1 Cooldown (s)",
		"ability_2_cooldown": "Ability 2 Cooldown (s)",
		"max_health": "Max Health",
		"altitude": "Altitude",
		"current_health": "Current Health",
		"pos_x": "Position X",
		"facing_x": "Camera Facing X",
		"pos_y": "Position Y",
		"facing_y": "Camera Facing Y",
		"pos_z": "Position Z",
		"facing_z": "Camera Facing Z"
	}

	data.pathShown = 0

	for(const property in data[data.teams[0]][data.players[0]]) {
		data.timestamps.push(new Date(`2000-01-01T${property}`));
	}



	playerPaths = new PlayerPaths({
		'parentElement': '#player-path',
		'containerHeight': 700,
		'containerWidth':700
	}, dispatcher, data)
	playerPaths.updateVis()
	
    lineChart = new LineSimple({
		'parentElement': '#chart-one',
		'containerHeight': 160,
		'containerWidth': 1000
		}, dispatcher, data);
	lineChart.updateVis();
	
    lineChart2 = new LineSimple({
		'parentElement': '#chart-two',
		'containerHeight': 160,
		'containerWidth': 1000
	}, dispatcher, data);
	lineChart2.updateVis();

	lines.push(lineChart);
	lines.push(lineChart2);

	lineSelect = new LineSelectSingle({
		'parentElement': '#chart-selections',
		'lines': lines
	}, dispatcher, data);

	timeline = new Timeline({
		'parentElement': '#timeline',
		'containerHeight': 100,
		'containerWidth': 1000
	}, dispatcher, data);
	timeline.updateVis();

	updateSVS(0,0)
});

	dispatcher.on('filterTime', selectedDomain => {

		if (selectedDomain.length == 0) {
			
				lineChart.data = data;
			} else {
				lineChart2.data.timestampStrings = [];
				for(const timestampSting in lineChart.data[lineChart2.selectedTeam][lineChart2.selectedPlayer]) {
					let timestampTemp = new Date(`2000-01-01T${timestampSting}`);
					if (selectedDomain[0] <= timestampTemp && timestampTemp <= selectedDomain[1]) {
						lineChart2.data.timestampStrings.push(timestampSting);
						// lineChart2.data.timestampStrings.push(timestampSting);
					}
				}}
			lineChart.updateVis();
			lineChart2.updateVis();
	});

	dispatcher.on('lineTooltipEnter', () => {
		for (const line of lines) {
			line.tooltip.selectAll('.hover').style('display', 'block');
		}
	});

	dispatcher.on('lineTooltipLeave', () => {
		for (const line of lines) {
			line.tooltip.selectAll('.hover').style('display', 'none');
		}
	});

	dispatcher.on('lineTooltipMove', timestamp => {
		for (const line of lines) {
			const index = line.bisectTime(line.dataOverTime, timestamp, 1);
			const d = line.dataOverTime[index];

			line.tooltip.select('#tooltip-circle-hover')
				.attr('transform', `translate(${line.xScale(d.time)},${line.yScale(d.val)})`);
                
			line.tooltip.select('#tooltip-text-hover')
				.attr('transform', `translate(${line.xScale(d.time)},${(line.yScale(d.val) - 15)})`)
				.text(Math.round(d.val));

			// Data points to create a vertical line at d.time
			let lineToolData = [{"time": d.time, "val": d3.min(line.dataOverTime, d => line.yValue(d))}, 
								{"time": d.time, "val": d3.max(line.dataOverTime, d => line.yValue(d))}]

			line.tooltip.select('#tooltip-path-hover')
				.data([lineToolData])
				.attr('d', line.line);
		}
	});

	dispatcher.on('lineTooltipClick', timestamp => {

	});

	dispatcher.on('playerSelected', selection => {
		let selectedPlayer = selection[0]
		let selectedTeam = selection[1]

		lineChart.selectedTeam = data.teams[selectedTeam];
		lineChart.selectedPlayer = data.players[selectedPlayer];
		lineChart.updateVis();

		lineChart2.selectedTeam = data.teams[selectedTeam];
		lineChart2.selectedPlayer = data.players[selectedPlayer];
		lineChart2.updateVis();

		playerPaths.selectedTeam = data.teams[selectedTeam];
		playerPaths.selectedPlayer = data.players[selectedPlayer];
		data.pathShown = 0
		playerPaths.updateVis();
		
		updateSVS(selectedPlayer, selectedTeam)
	})

	dispatcher.on('nextPath', lifeCount => {
		if(playerPaths.data.pathShown < lifeCount - 1)
			playerPaths.data.pathShown++
		else
			playerPaths.data.pathShown = 0
		playerPaths.updateVis()
	})

	dispatcher.on('previousPath', lifeCount => {
		if(playerPaths.data.pathShown > 0)
			playerPaths.data.pathShown--
		else
			playerPaths.data.pathShown = lifeCount - 1
		playerPaths.updateVis()
	})

function updateSVS(selectedPlayer = "", selectedTeam = ""){
	let playerData = data[data.teams[selectedTeam]][data.players[selectedPlayer]]
	let length = data.timestampStrings.length
	let lastTimestamp = data.timestampStrings[length - 1]

	let heroes = []
	let heroString = ""

	for (let ts in playerData){
		let hero = playerData[ts].hero
		if(hero == "L\\u00facio")
			hero = "L\u00facio"
		if(!heroes.includes(hero) && hero !== undefined){
			heroes.push(hero.normalize())
		}
	}

	heroString = heroes.join(', ')

	document.getElementById("player-name").innerText = data.players[selectedPlayer]
	document.getElementById("team-name").innerText = data.teams[selectedTeam] + " - " + heroString

	let elims = playerData[lastTimestamp].elims
	let damageDealt = playerData[lastTimestamp].dmg_dealt
	let damageTaken = playerData[lastTimestamp].dmg_taken
	let healing = playerData[lastTimestamp].healing_dealt
	let deaths = playerData[lastTimestamp].deaths
	
	document.getElementById("total-elims").innerText = elims
	document.getElementById("elims-per-ten").innerText = ((elims / length) * 600).toFixed(2)

	document.getElementById("total-damage-dealt").innerText = damageDealt
	document.getElementById("damage-dealt-per-ten").innerText = ((damageDealt / length) * 600).toFixed(2)

	document.getElementById("total-damage-taken").innerText = damageTaken
	document.getElementById("damage-taken-per-ten").innerText = ((damageTaken / length) * 600).toFixed(2)
	
	document.getElementById("total-healing").innerText = healing
	document.getElementById("healing-per-ten").innerText = ((healing / length) * 600).toFixed(2)

	document.getElementById("total-deaths").innerText = deaths
	document.getElementById("deaths-per-ten").innerText = ((deaths / length) * 600).toFixed(2)
}

function normalizeExtent(xExtent, zExtent) {

	let xWidth = xExtent[1] - xExtent[0]
	let zWidth = zExtent[1] - zExtent[0]

	if(xWidth > zWidth){
		xExtent[0] -= 10
		xExtent[1] += 10
		zExtent[0] -= (xWidth - zWidth)/2 + 10
		zExtent[1] += (xWidth - zWidth)/2 + 10
	}
	else {
		zExtent[0] -= 10
		zExtent[1] += 10
		xExtent[0] -= (zWidth - xWidth)/2 + 10
		xExtent[1] += ((zWidth - xWidth)/2 + 10)
	}

	return [xExtent, zExtent]
}