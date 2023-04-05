class LineSelectSingle {

    constructor(_config, _dispatcher, _data) {
        this.config = {
            parentElement: _config.parentElement,
            lines: _config.lines                    // Array of line chart objects
        }
        
        this.dispatcher = _dispatcher;
        this.data = _data;

        this.init();
    }

    init() {
      
        let vis = this;

        // Select parent node
        vis.parent = d3.select(vis.config.parentElement)
        
        vis.teams = vis.data.teams;

        // Fill array with all 10 player names (5 from each team object)
        vis.players = Object.getOwnPropertyNames(vis.data[vis.teams[0]]);
        vis.players = vis.players.concat(Object.getOwnPropertyNames(vis.data[vis.teams[1]]));

        vis.properties = Object.getOwnPropertyNames(vis.data[vis.data.teams[0]][vis.data.players[0]][vis.data.timestampStrings[0]]);
        
        vis.teamSelectGroup = []

        // vis.selectedTeam = vis.teams[0];
        // vis.selectedPlayer = vis.players[0];
        // vis.selectedProperty = vis.properties[0];

        vis.playerSelect = vis.parent.append('select')
            .style('display', 'block')    
            .on('change', (event, d) => {
                // TODO: Dispatcher event to update all lines in lines[]
                let selectedPlayer = parseInt(vis.playerSelect.property('value'))
                vis.dispatcher.call('playerSelected', event, [selectedPlayer, Math.floor(selectedPlayer / 5)])
            });

        // Add optgroups to playerSelect for each team
        for (let i = 0; i < vis.teams.length; i++) {
            vis.teamSelectGroup[i] = vis.playerSelect.append('optgroup')
                .attr('label', vis.data.teams[i])
        }

        // Populate each team optgroup with player names
        for (let j = 0; j < vis.players.length; j++) {
            vis.teamSelectGroup[Math.floor(j/5)].append('option')
                .text(vis.players[j])
                .attr('value', j);    // Player index from 0 to 9
        }
        
        // Add property select element for EACH line
        vis.propSelect = [];
        for (let i = 0; i < vis.config.lines.length; i++) {
            vis.propSelect[i] = vis.parent.append('select')
                .style('display', 'block')    
                .on('change', () => {
                    // TODO: Dispatcher event to update lines[i] with new property
                    vis.config.lines[i].selectedProperty = vis.properties[vis.propSelect[i].property('value')]
                    vis.config.lines[i].updateVis();
                });
            
            // Populate each property select element with property names
            for (let j = 0; j < vis.properties.length; j++) {
                // Only add an option for properties with a defined label in LinePropLabels
                if (vis.data.LinePropLabels.hasOwnProperty(vis.properties[j])) {
                    vis.propSelect[i].append('option')
                        .attr('value', j)
                        .text(vis.data.LinePropLabels[vis.properties[j]]);
                }
            }

            // Set default/initial properties for first two lines
            if (i == 0) {
                vis.propSelect[i].select('option[value="8"]').attr('selected', true);
                // vis.propSelect[i].attr('value', 8);
            }
            if (i == 1) {
                vis.propSelect[i].select('option[value="11"]').attr('selected', true);
                // vis.propSelect[i].attr('value', 11);
            }
            if (i == 2) {
                vis.propSelect[i].select('option[value="29"]').attr('selected', true);
                // vis.propSelect[i].attr('value', 11);
            }

            vis.config.lines[i].selectedProperty = vis.properties[vis.propSelect[i].property('value')];
            vis.config.lines[i].updateVis();
        }
    }

}