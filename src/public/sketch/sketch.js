let canvas;
let wfcGrid;
let roadButton;
let stepButton;
let rerunButton;

let history = [];
let logHistory = true;

let stepMode = false;
let redraw = false;

let continueWfcAlgorithm; // CircuitBreaker boolean for draw loop

const numColumns = 10;
const numRows = 10;
const tileWidth = 30;
const tileHeight = 30;

let  currentCell;

function setup() {

	textSize(tileHeight/2);
	textAlign(CENTER, CENTER);

	roadButton = createButton('Use Road Tiles');
	roadButton.mousePressed(loadRoadTiles);
	roadButton.parent('buttonContainer');

	stepButton = createRadio();
	stepButton.option('1','Step Mode');
	stepButton.option('2', 'Normal Mode');
	stepButton.selected('2');
	stepButton.parent('buttonContainer');

	drawButton = createButton('Draw');
	drawButton.mousePressed(reDraw);
	drawButton.parent('buttonContainer');

	rerunButton = createButton('Re-run');
	rerunButton.mousePressed(rerunGrid);
	rerunButton.parent('buttonContainer');

	canvas = createCanvas(tileWidth * numColumns, tileHeight * numRows);
	canvas.parent('sketchContainer');
	continueWfcAlgorithm = true;
}

function draw() {
	let mode = stepButton.value();

	if (mode === '1') {
		drawButton.show();
	} else if (mode === '2') {
		drawButton.hide();
	}

	if (mode === '1' && !redraw) {
		return;
	}

	if (mode === '2' || (mode === '1' && redraw)){
		if (continueWfcAlgorithm) {
			if (wfcGrid) {
				currentCell = wfcGrid.getCellOfLeastEnthropy();
				if (currentCell === null) {
					console.log('no cell found with enthropy. Stopping the algorithm.');
					continueWfcAlgorithm = false;
					return;
				}

				const option = chooseCellTileOption(currentCell.tileOptions);
				if (option === null) {
					console.log('No tile option available on the chosen tile. Stopping.');
					continueWfcAlgorithm = false;
					return;
				}
				currentCell.collapseTo(option);
				history.push({
					"cell": currentCell,
					"tile": wfcGrid.tiles[option],
				});

				const surroundingCells = wfcGrid.getSurroundingCells(currentCell);

				surroundingCells.forEach(cell => {
					if (cell.status === WfcStatus.OPEN){
						wfcGrid.updateCellTileOptions(cell);
						cell.calculateEnthropy(wfcGrid.tiles);
					}
				});

				wfcGrid.draw();

			}
		}
		else {
			// Stopped the algorithm
			if (logHistory) {
				console.log('Stopped the algorithm', history);
				logHistory = !logHistory;
			}
		}

		if (mode === 'Step Mode')
			redraw = false;
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
	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateAllCellEnthropies();
}

// function loadTronTiles() {
// 	// Create a WfcGrid for space tiles.
// 	wfcGrid = new WfcGrid(numColumns, numRows, tileWidth, tileHeight, [
// 		// Create the tiles here.
// 		new Tile('tiles/TronLike/AAAA_Blank.PNG', tileWidth, tileHeight, 1, 0, ['A','A','A','A']),
// 		new Tile('tiles/TronLike/AADE_MachineCorner.PNG', tileWidth, tileHeight, 1, 0, ['A','A','D','E']),
// 		new Tile('tiles/TronLike/ABAA_BrokenMachine.PNG', tileWidth, tileHeight, 1, 0, ['A','B','A','A']),
// 		new Tile('tiles/TronLike/ABAC_CapStop.PNG', tileWidth, tileHeight, 1, 0, ['A','B','A','C']),
// 		new Tile('tiles/TronLike/ACAC_LineContinue.PNG', tileWidth, tileHeight, 1, 0, ['A','C','A','C']),
// 		new Tile('tiles/TronLike/CCAA_SideLine_or_GGAA.PNG', tileWidth, tileHeight, 1, 0, ['G','G','A','A']),
// 		new Tile('tiles/TronLike/CCAC_LineThreeConnectors.PNG', tileWidth, tileHeight, 1, 0, ['C','C','A','C']),
// 		new Tile('tiles/TronLike/CCCC_LineAllCross.PNG', tileWidth, tileHeight, 1, 0, ['C','C','C','C']),
// 		new Tile('tiles/TronLike/CCCC_LineAllSideways_or_GGGG.PNG', tileWidth, tileHeight, 1, 0, ['G','G','G','G']),
// 		new Tile('tiles/TronLike/CCDE_MachineCornerWithLine_or_GGDE.PNG', tileWidth, tileHeight, 1, 0, ['G','G','D','E']),
// 		new Tile('tiles/TronLike/DBEF_CapMachine.PNG', tileWidth, tileHeight, 1, 0, ['D','B','E','F']),
// 		new Tile('tiles/TronLike/FFFF_MachineBlank.PNG', tileWidth, tileHeight, 1, 0, ['F','F','F','F'])
// 	]);

// 	wfcGrid.addTileVariants();
// 	wfcGrid.load();
// 	// first time setup of the tile options.
// 	wfcGrid.initCellTileOptions();

// 	// NOTE: This stuff will live in the draw method in the end.
// 	// calculate all the enthropy values
// 	wfcGrid.calculateAllCellEnthropies();
// }

function toggleStepMode() {
	stepMode = !stepMode;
}

function reDraw() {
	redraw = true;
}

function chooseCellTileOption(tileOptions) {

	if (tileOptions.length === 1) {
		return tileOptions[0];
	}
	const tileOptionIndex = Math.floor(Math.random() * tileOptions.length)
	return tileOptions[tileOptionIndex];
}

function rerunGrid() {
	wfcGrid._initGrid();

	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateAllCellEnthropies();
	currentCell = null;
	redraw = false;
	continueWfcAlgorithm = true;
	history = new Array();
	logHistory = true;
}
