// ========== Globally available objects relevant to the sketch.
let canvas;
let wfcGrid;
let roadButton;
let scifiButton;
let circuitButton;
let doStepAlgoButton;
let stepRadioButtons;
let rerunButton;

// ========== State-based memory of the sketch as it runs.
let currentCell;
let nextCell;
let history = [];
let logHistory = true;
let collapsedCells = [];
// ==================== workflow variables for controlling what happens next.
let stepMode = false;
let doStep = false;
let continueWfcAlgorithm = true; // CircuitBreaker boolean for draw loop

// ========== Static variables relevant to the creation of the sketch.
const numColumns = 30;
const numRows = 30;
const tileWidth = 30;
const tileHeight = 30;


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
}

function draw() {

	// Housekeeping...
	const mode = stepRadioButtons.value();
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

	// Draw the current Grid (if there is one).
	if (wfcGrid) wfcGrid.draw();
	if (nextCell) {
		push();
			noFill();
			strokeWeight(4);
			stroke(155, 0, 0);
			rect(nextCell.column * tileWidth, nextCell.row * tileHeight, tileWidth, tileHeight);
		pop();
	}

}

function doAlgorithmStep() {
	if(!nextCell)
		currentCell = wfcGrid.getCellOfLeastEntropy();
	else
		currentCell = nextCell;
	if (!currentCell) {
		console.log('no cell found with entropy. Stopping the algorithm.');
		continueWfcAlgorithm = false;
	}
	else {
		// If there's no tileOptions, do some re-configuring nearby
		if (currentCell.tileOptions.length === 0) {

			// Choose one of the collapsed neighbours to stay collapsed and delete the others?

			// Get neighbours
			const neighbours = wfcGrid.getSurroundingCells(currentCell);
			const collapsedNeighbours = neighbours.filter((curr) => {
				return curr.status === WfcStatus.COLLAPSED;
			});

			const highestEntropyCells = getHighestEntropyCellInArray(collapsedNeighbours);

			const highestEntropyCell = highestEntropyCells[0];
			collapsedNeighbours.forEach(currCell => {
				if (!currCell.equals(highestEntropyCell)) {
					currCell.open();
				}
			});
			[...collapsedNeighbours, currentCell].forEach((cell) => {
				wfcGrid.updateCellTileOptions(cell);
				cell.calculateEntropy(wfcGrid.tiles);
			});
			return;
		}

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
					cell.calculateEntropy(wfcGrid.tiles);
				}
			});
		}
	}

	nextCell = wfcGrid.getCellOfLeastEntropy();
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
	// calculate all the entropy values
	wfcGrid.calculateAllCellEnthropies();
}

function loadCircuitTiles() {
	wfcGrid = new WfcGrid(numColumns, numRows, tileWidth, tileHeight, [
		new Tile('tiles/circuit/0.png', tileWidth, tileHeight, 12, 0, ['A','A','A','A',]),
		new Tile('tiles/circuit/1.png', tileWidth, tileHeight, 1, 0, ['B','B','B','B',]),
		new Tile('tiles/circuit/2.png', tileWidth, tileHeight, 1, 0, ['B','C','B','B',]),
		new Tile('tiles/circuit/3.png', tileWidth, tileHeight, 1, 0, ['B','D','B','D',]),
		new Tile('tiles/circuit/4.png', tileWidth, tileHeight, 11, 0, ['Ea','C','Ef','A',]),
		new Tile('tiles/circuit/5.png', tileWidth, tileHeight, 4, 0, ['Ea','B','B','Ef',]),
		new Tile('tiles/circuit/6.png', tileWidth, tileHeight, 1, 0, ['B','C','B','C',]),
		new Tile('tiles/circuit/7.png', tileWidth, tileHeight, 1, 0, ['D','C','D','C',]),
		new Tile('tiles/circuit/8.png', tileWidth, tileHeight, 1, 0, ['D','B','C','B',]),
		new Tile('tiles/circuit/9.png', tileWidth, tileHeight, 6, 0, ['C','C','B','C',]),
		new Tile('tiles/circuit/10.png', tileWidth, tileHeight, 1, 0, ['C','C','C','C',]),
		new Tile('tiles/circuit/11.png', tileWidth, tileHeight, 1, 0, ['C','C','B','B',]),
		new Tile('tiles/circuit/12.png', tileWidth, tileHeight, 1, 0, ['B','C','B','C',]),
	]);

	wfcGrid.addTileVariants();
	wfcGrid.load();
	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the entropy values
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
	// calculate all the entropy values
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
			return prevValue + wfcGrid.getTile(currVal).weight;
		}, 0);
		let lowerBound = 0;
		const randomNum = Math.random();
		const chosenOption = tileOptions.find(option => {
			const frac = lowerBound + (wfcGrid.getTile(option).weight / denom);
			lowerBound += frac;
			return randomNum <= frac;
		});
		return chosenOption;
	}

	return null;
}

function rerunGrid() {
	wfcGrid._initGrid();

	// first time setup of the tile options.
	wfcGrid.initCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the entropy values
	wfcGrid.calculateAllCellEnthropies();
	currentCell = null;
	doStep = false;
	continueWfcAlgorithm = true;
	history = new Array();
	logHistory = true;
}

function getLowestEntropyCellInArray(cellArray) {
	let lowestEntropyCells = [];
	let lowestValue;
	cellArray.forEach((currValue) => {
		if (lowestEntropyCells.length === 0 || currValue.entropy < prevValue) {
			lowestEntropyCells = [currValue];
			lowestValue = currValue.entropy;
		}
		else {
			lowestEntropyCells.push(currValue);
		}
	}, 0);

	return lowestEntropyCells[0];
}

function getHighestEntropyCellInArray(cellArray) {
	let highestEntropyCells = [];
	let highestValue;
	cellArray.forEach((currValue) => {
		if (highestEntropyCells.length === 0 || currValue.entropy > highestValue) {
			highestEntropyCells = [currValue];
			highestValue = currValue.entropy;
		}
		else {
			highestEntropyCells.push(currValue);
		}
	}, 0);

	return highestEntropyCells;
}
