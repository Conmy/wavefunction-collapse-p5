let canvas;
let wfcGrid;
let roadButton;
let scifiButton;
let circuitButton;
let doStepAlgoButton;
let stepRadioButtons;
let rerunButton;

let history = [];
let logHistory = true;

let stepMode = false;
let doStep = false;

let continueWfcAlgorithm; // CircuitBreaker boolean for draw loop

const numColumns = 30;
const numRows = 30;
const tileWidth = 30;
const tileHeight = 30;

let  currentCell;

function setup() {

	textSize(tileHeight/2);
	textAlign(CENTER, CENTER);

	roadButton = createButton('Use Road Tiles');
	roadButton.mousePressed(loadRoadTiles);
	roadButton.parent('buttonContainer');

	circuitButton = createButton('Use Circuit Tiles');
	circuitButton.mousePressed(loadCircuitTiles);
	circuitButton.parent('buttonContainer');

	stepRadioButtons = createRadio();
	stepRadioButtons.option('1','Step Mode');
	stepRadioButtons.option('2', 'Normal Mode');
	stepRadioButtons.selected('2');
	stepRadioButtons.parent('buttonContainer');

	doStepAlgoButton = createButton('Step');
	doStepAlgoButton.mousePressed(enableStep);
	doStepAlgoButton.parent('buttonContainer');

	rerunButton = createButton('Re-run');
	rerunButton.mousePressed(rerunGrid);
	rerunButton.parent('buttonContainer');

	canvas = createCanvas(tileWidth * numColumns, tileHeight * numRows);
	canvas.parent('sketchContainer');
	continueWfcAlgorithm = true;
}

function draw() {

	// Housekeeping...
	let mode = stepRadioButtons.value();
	if (mode === '1') {
		doStepAlgoButton.show();
	} else if (mode === '2') {
		doStepAlgoButton.hide();
	}

	// ---------- Iterate Algorithm ----------
	if (continueWfcAlgorithm){
		if (mode === '1' && doStep === true) {
			doAlgorithmStep();
			doStep = false;
		}
		else if (mode === '2' && wfcGrid) {
			doAlgorithmStep();
		}
	}

	// Draw the current Grid
	if (wfcGrid) wfcGrid.draw();

}

function doAlgorithmStep() {
	currentCell = wfcGrid.getCellOfLeastEnthropy();
	if (!currentCell) {
		console.log('no cell found with enthropy. Stopping the algorithm.');
		continueWfcAlgorithm = false;
	}
	else {
		const option = chooseCellTileOption(currentCell.tileOptions);
		if (!option) {
			console.log('No tile option available on the chosen tile. Stopping.');
		}
		else {
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
	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateAllCellEnthropies();
}

function loadCircuitTiles() {
	wfcGrid = new WfcGrid(numColumns, numRows, tileWidth, tileHeight, [
		new Tile('tiles/circuit/0.png', tileWidth, tileHeight, 3, 0, ['A','A','A','A',]),
		new Tile('tiles/circuit/1.png', tileWidth, tileHeight, 1, 0, ['B','B','B','B',]),
		new Tile('tiles/circuit/2.png', tileWidth, tileHeight, 1, 0, ['B','C','B','B',]),
		new Tile('tiles/circuit/3.png', tileWidth, tileHeight, 1, 0, ['B','D','B','D',]),
		new Tile('tiles/circuit/4.png', tileWidth, tileHeight, 9, 0, ['Ea','C','Ef','A',]),
		new Tile('tiles/circuit/5.png', tileWidth, tileHeight, 1, 0, ['Ea','B','B','Ef',]),
		new Tile('tiles/circuit/6.png', tileWidth, tileHeight, 1, 0, ['B','C','B','C',]),
		new Tile('tiles/circuit/7.png', tileWidth, tileHeight, 1, 0, ['D','C','D','C',]),
		new Tile('tiles/circuit/8.png', tileWidth, tileHeight, 1, 0, ['D','B','C','B',]),
		new Tile('tiles/circuit/9.png', tileWidth, tileHeight, 1, 0, ['C','C','B','C',]),
		new Tile('tiles/circuit/10.png', tileWidth, tileHeight, 1, 0, ['C','C','C','C',]),
		new Tile('tiles/circuit/11.png', tileWidth, tileHeight, 1, 0, ['C','C','B','B',]),
		new Tile('tiles/circuit/12.png', tileWidth, tileHeight, 1, 0, ['B','C','B','C',]),
	]);

	wfcGrid.addTileVariants();
	wfcGrid.load();
	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateAllCellEnthropies();
}

function loadSciFiTiles() {
	wfcGrid = new WfcGrid(numColumns, numRows, tileWidth, tileHeight, [
		new Tile('tiles/sci-fi/AAAE_MachineWindow.PNG', tileWidth, tileHeight, 1, 0, ['A','A','A','E',]),
		new Tile('tiles/sci-fi/AADfDa_MachineCorner.PNG', tileWidth, tileHeight, 1, 0, ['A','A','Df','Da',]),
		new Tile('tiles/sci-fi/ABAA_BrokenMachine.PNG', tileWidth, tileHeight, 1, 0, ['A','B','A','A',]),
		new Tile('tiles/sci-fi/ABAC_CapStop.PNG', tileWidth, tileHeight, 1, 0, ['A','B','A','C',]),
		new Tile('tiles/sci-fi/ACAC_LineContinue.PNG', tileWidth, tileHeight, 1, 0, ['A','C','A','C',]),
		new Tile('tiles/sci-fi/CCAA_SideLine_or_GGAA.PNG', tileWidth, tileHeight, 1, 0, ['C','C','A','A',]),
		new Tile('tiles/sci-fi/CCAC_LineThreeConnectors.PNG', tileWidth, tileHeight, 1, 0, ['C','C','A','C',]),
		new Tile('tiles/sci-fi/CCCC_LineAllCross.PNG', tileWidth, tileHeight, 1, 0, ['C','C','C','C',]),
		new Tile('tiles/sci-fi/CCCC_LineAllSideways_or_GGGG.PNG', tileWidth, tileHeight, 1, 0, ['C','C','C','C',]),
		new Tile('tiles/sci-fi/CCDfDa_MachineCornerWithLine.PNG', tileWidth, tileHeight, 1, 0, ['C','C','Df','Da',]),
		new Tile('tiles/sci-fi/DaBDfE_CapMachine.PNG', tileWidth, tileHeight, 1, 0, ['Da','B','Df','E',]),
		new Tile('tiles/sci-fi/EEEE_MachineBlank.PNG', tileWidth, tileHeight, 1, 0, ['E','E','E','E',]),
	]);

	wfcGrid.addTileVariants();
	wfcGrid.load();
	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateAllCellEnthropies();
}

function toggleStepMode() {
	stepMode = !stepMode;
}

function enableStep() {
	doStep = true;
}

function chooseCellTileOption(tileOptions) {

	if (tileOptions.length === 1) {
		return tileOptions[0];
	}
	else if(tileOptions.length > 1) {
		const denom = tileOptions.reduce((prevValue, currVal) => {
			return prevValue + wfcGrid.tiles[currVal].weight;
		}, 0);
		let lowerBound = 0;
		const randomNum = Math.random();
		for (let i=0; i<tileOptions.length; i++) {
			const frac = lowerBound + (wfcGrid.tiles[tileOptions[i]].weight / denom);
			if (randomNum > lowerBound && randomNum <= frac) {
				return tileOptions[i];
			}
			lowerBound += frac;
		}
	}

	return null;
}

function rerunGrid() {
	wfcGrid._initGrid();

	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateAllCellEnthropies();
	currentCell = null;
	doStep = false;
	continueWfcAlgorithm = true;
	history = new Array();
	logHistory = true;
}
