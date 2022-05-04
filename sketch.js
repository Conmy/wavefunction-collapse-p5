let canvas;
let wfcGrid;
let roadButton;
let tronButton;

let continueWfcAlgorithm; // CircuitBreaker boolean for draw loop

const numColumns = 40;
const numRows = 20;
const tileWidth = 16;
const tileHeight = 16;

function setup() {
	roadButton = createButton('Use Road Tiles');
	roadButton.mousePressed(loadRoadTiles);
	roadButton.parent('buttonContainer');

	tronButton = createButton('Use Space Tiles');
	tronButton.mousePressed(loadTronTiles);
	tronButton.parent('buttonContainer');

	canvas = createCanvas(tileWidth*numColumns, tileHeight*numRows);
	canvas.parent('sketchContainer');
	continueWfcAlgorithm = true;

}

function draw() {
	if (continueWfcAlgorithm) {
		if (wfcGrid) {
			// Collapse a cell based on enthropy values.
			const cell = wfcGrid.getCellOfLeastEnthropy();

			if (cell === null) {
				console.log('no cell found with enthropy. Stopping the algorithm.');
				continueWfcAlgorithm = false;
				return;
			}

			wfcGrid.updateCellTileOptions(cell);
			let success = false;
			// Do this until we have collapsed the cell.
			while (!success) {
				const tileOptions = cell.tileOptions;
				if (tileOptions.length > 0) {
					const rndOption = Math.floor(Math.random() * tileOptions.length);
					const tileOption = tileOptions.splice(rndOption, 1);
					success = wfcGrid.streamlineTileOptionsAroundCell(cell, tileOption);
					if (success) {
						cell.collapseTo(tileOption);
					}
					// Get surrounding cells and update their valid options and enthropy.
					const surroundingCells = getSurroundingCells(cell, wfcGrid.grid);
					surroundingCells.forEach(cell => {
						if (cell.status === WfcStatus.OPEN) {
							wfcGrid.updateCellTileOptions(cell, wfcGrid.grid);
							cell.calculateEnthropy(wfcGrid.tiles);
						}
					});
				} else {
					console.error('no options valid for the current cell', cell);
					continueWfcAlgorithm = false;
					return;
				}
			}

			wfcGrid.draw();
		}
	}
}

function loadRoadTiles() {

	// Create a WfcGrid for road tiles.
	wfcGrid = new WfcGrid(numColumns, numRows, tileWidth, tileHeight, [
		new Tile('tiles/Road_0.png', tileWidth, tileHeight, 1, 0, ['A', 'A', 'B', 'A']),
		new Tile('tiles/Road_1.png', tileWidth, tileHeight, 1, 0, ['B', 'A', 'B', 'A']),
		new Tile('tiles/Road_2.png', tileWidth, tileHeight, 1, 0, ['A', 'A', 'B', 'B']),
		new Tile('tiles/Road_3.png', tileWidth, tileHeight, 1, 0, ['B', 'B', 'B', 'B']),
		new Tile('tiles/Road_4.png', tileWidth, tileHeight, 1, 0, ['A', 'A', 'A', 'A']),
		new Tile('tiles/Road_5.png', tileWidth, tileHeight, 1, 0, ['A', 'B', 'B', 'B'])
	]);

	wfcGrid.addTileVariants();
	wfcGrid.load();
	wfcGrid.initGrid();
	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateAllCellEnthropies();
}

function loadTronTiles() {
	// Create a WfcGrid for space tiles.
	wfcGrid = new WfcGrid(numColumns, numRows, tileWidth, tileHeight, [
		// Create the tiles here.
		new Tile('tiles/TronLike/AAAA_Blank.PNG', tileWidth, tileHeight, 1, 0, ['A','A','A','A']),
		new Tile('tiles/TronLike/AADE_MachineCorner.PNG', tileWidth, tileHeight, 1, 0, ['A','A','D','E']),
		new Tile('tiles/TronLike/ABAA_BrokenMachine.PNG', tileWidth, tileHeight, 1, 0, ['A','B','A','A']),
		new Tile('tiles/TronLike/ABAC_CapStop.PNG', tileWidth, tileHeight, 1, 0, ['A','B','A','C']),
		new Tile('tiles/TronLike/ACAC_LineContinue.PNG', tileWidth, tileHeight, 1, 0, ['A','C','A','C']),
		new Tile('tiles/TronLike/CCAA_SideLine_or_GGAA.PNG', tileWidth, tileHeight, 1, 0, ['G','G','A','A']),
		new Tile('tiles/TronLike/CCAC_LineThreeConnectors.PNG', tileWidth, tileHeight, 1, 0, ['C','C','A','C']),
		new Tile('tiles/TronLike/CCCC_LineAllCross.PNG', tileWidth, tileHeight, 1, 0, ['C','C','C','C']),
		new Tile('tiles/TronLike/CCCC_LineAllSideways_or_GGGG.PNG', tileWidth, tileHeight, 1, 0, ['G','G','G','G']),
		new Tile('tiles/TronLike/CCDE_MachineCornerWithLine_or_GGDE.PNG', tileWidth, tileHeight, 1, 0, ['G','G','D','E']),
		new Tile('tiles/TronLike/DBEF_CapMachine.PNG', tileWidth, tileHeight, 1, 0, ['D','B','E','F']),
		new Tile('tiles/TronLike/FFFF_MachineBlank.PNG', tileWidth, tileHeight, 1, 0, ['F','F','F','F'])
	]);

	wfcGrid.addTileVariants();
	wfcGrid.load();
	wfcGrid.initGrid();
	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateAllCellEnthropies();
}