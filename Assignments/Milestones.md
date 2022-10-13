1 - Research game data collection capabilities and survey possible users

> At the beginning of the project we will conduct background research into methods of collecting data from a variety of competitive games (Valorant, CS:GO, Rocket League, Overwatch) before deciding on which game to focus on. We will also write and distribute a survey to potential users for the chosen game (e.g. players and coaches of collegiate esports teams) to inform our planned data collection and analytics.

2 - Collect/parse game data using an existing tool or one we implement

> For the selected game (Overwatch 2), preliminary data can be collected using an existing “workshop code”, which is a script written using the in-game workshop API. Once Overwatch 2 supports the creation of new workshop codes, a custom implementation will be developed.

3 - Store data in a basic functional database

> First we will determine the database management tool that we will use to store our parsed data. Using the chosen tool, we will create a schema to contain the data that we parse from game data.

4 - Implement 2D visualization of data

> 2D visualization will be implemented using the D3 and/or VegaLite libraries, beginning with a set of “practice” data before incorporating connection to the database.

5 - Implement 3D visualization of data

> 3D visualization will be implemented using Unity and/or WebGL, with an initial focus on basic functionality such as plotting player position on a 3D rendering of the in-game map.

6 - Combine data collection, storage, and visualization into a functional app v1.0

> With basic data collection and storage, 2D visualization, and 3D visualization functionality implemented, we will combine everything together into a web application that can be deployed on a live website.

7 - Refine app based on user feedback and expansion of functionality

> By providing access to our app to UC’s Overwatch teams, we can gather feedback on our visualizations and their value to the teams. Based on this feedback we can decide on our next steps in terms of helpful visualizations.
