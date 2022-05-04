const { WfcGrid } = require('./wfcGrid');
const { WfcCell } = require('./WfcCell');
const { Tile } = require('./tile');

beforeEach(() => {
    // Set up expected globally available objects.
    global.WfcCell = WfcCell;
});

test('WfcGrid creates with properties correctly set', () => {
    const cols = 2;
    const rows = 2;
    const tileWidth = 20;
    const tileHeight = 40;
    const tiles = [1,2,3,4,5,6,7];

    const grid = new WfcGrid(cols, rows, tileWidth, tileHeight, tiles);

    expect(grid.cols).toBe(cols);
    expect(grid.rows).toBe(rows);
    expect(grid.tileWidth).toBe(tileWidth);
    expect(grid.tileHeight).toBe(tileHeight);
    expect(grid.tiles).toBeInstanceOf(Array);
    expect(grid.tiles).toBe(tiles);
});

test('grid property inside WfcGrid is initialized on contstruction', () => {
    const cols = 5;
    const rows = 2;

    const grid = new WfcGrid(cols, rows, 10, 10, [1,2,3]);

    for (let i=0; i<rows; i++) {
        for (let j=0; j<cols; j++) {
            expect(grid.grid[i][j]).toBeInstanceOf(WfcCell);
        }
    }
});

test('initCellTileOptions sets the tileOptions of the grid cells to an array of all tile indices', () => {
    const cols = 4;
    const rows = 5;
    const tiles = ['A', 'B', 'C', 'D', 'E', 'F'];
    const grid = new WfcGrid(cols, rows, 10, 10, tiles);

    grid.initCellTileOptions();

    for (let i=0; i<rows; i++) {
        for (let j=0; j<cols; j++) {
            const currentCell = grid.grid[i][j];
            const tileOptions = currentCell.tileOptions;

            expect(tileOptions).toBeInstanceOf(Array);
            expect(tileOptions.length).toBe(tiles.length);
            tileOptions.forEach((option, idx) => expect(option).toEqual(idx));
        }
    }
});

test('calculateAllCellEnthropies calls calculateEnthropy on all cells in the grid', () => {
    const cols = 4;
    const rows = 3;
    const grid = new WfcGrid(cols, rows, 10, 10, [1,2,3,4,5]);

    const cellMock = {
        calculateEnthropy: jest.fn()
    };

    grid.grid = [
        [
            cellMock, cellMock, cellMock, cellMock
        ],[
            cellMock, cellMock, cellMock, cellMock
        ],[
            cellMock, cellMock, cellMock, cellMock
        ]
    ];

    grid.calculateAllCellEnthropies();

    expect(cellMock.calculateEnthropy.mock.calls.length).toBe(rows*cols);

});

