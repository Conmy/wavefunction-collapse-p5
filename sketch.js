let wfcGrid;
const numColumns = 40;
const numRows = 20;
const tileWidth = 20;
const tileHeight = 20;

function setup() {
	createCanvas(windowWidth, windowHeight);

	wfcGrid = new WfcGrid(numColumns, numRows, tileWidth, tileHeight, [
		new Tile('tiles/Road_0.png', ['A', 'A', 'B', 'A'], 15, 0),
		new Tile('tiles/Road_1.png', ['B', 'A', 'B', 'A'], 1, 0),
		new Tile('tiles/Road_2.png', ['A', 'A', 'B', 'B'], 1, 0),
		new Tile('tiles/Road_3.png', ['B', 'B', 'B', 'B'], 9, 0),
		new Tile('tiles/Road_4.png', ['A', 'A', 'A', 'A'], 9, 0),
		new Tile('tiles/Road_5.png', ['A', 'B', 'B', 'B'], 12, 0)
	]);


	wfcGrid.addTileVariants();
	wfcGrid.load();
	wfcGrid.initGrid();
	// first time setup of the tile options.
	wfcGrid.populateCellTileOptions();

	// NOTE: This stuff will live in the draw method in the end.
	// calculate all the enthropy values
	wfcGrid.calculateCellEnthropies();



	//wfcGrid.calculateTileOptions();
}

function draw() {
	if (wfcGrid.isFinished()){
		// collapse a cell based on enthropy values.
		let cell = wfcGrid.collapseCell();
		wfcGrid.streamlineOptions(cell);

		// Calculate new enthropy values based on remaining tileOptions
		wfcGrid.calculateCellEnthropies();
	}
	wfcGrid.draw();
}
