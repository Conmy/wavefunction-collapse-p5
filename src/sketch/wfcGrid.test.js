const { WfcGrid } = require('./wfcGrid');
const { WfcCell, WfcStatus } = require('./WfcCell');
const { Tile } = require('./tile');

beforeEach(() => {
    // Set up expected globally available objects.
    global.WfcCell = WfcCell;
    global.WfcStatus = WfcStatus;
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

describe('addTileVariants', () => {
    test('will go through the current list of tiles and' +
    ' call getTileVariants on each tile.', () => {

        const mockTile = {getTileVariants: jest.fn()};
        // Assuming that the getTileVariants will return 3 "tiles" as variants
        mockTile.getTileVariants.mockReturnValue([{}, {}, {}]);
        const grid = new WfcGrid(1,1,1,1, [mockTile, mockTile]);

        grid.addTileVariants();

        // getTileVariants to be called on each tile in the initial tiles array.
        expect(mockTile.getTileVariants.mock.calls.length).toEqual(2);
    });

    test('will add tile variants to the original tile array' +
    'with the returned variants from Tile.prototype.getTileVariants', () => {

        const mockTile = {getTileVariants: jest.fn()};
        // Assuming that the getTileVariants will return 3 "tiles" as variants
        mockTile.getTileVariants.mockReturnValue([{}, {}, {}]);
        const grid = new WfcGrid(1,1,1,1, [mockTile, mockTile]);

        expect(grid.tiles.length).toEqual(2);
        grid.addTileVariants();

        // Grid tiles increases by the number of tiles returned from the
        // getTileVariants call on the tile objects.
        expect(grid.tiles.length).toEqual(8);
    });
});

describe('getCellOfLeastEnthropy', () => {
    test('returns the cell with the lowest enthropy value', () => {
        const lowestRowIndex = 0;
        const lowestColIndex = 3;
        const grid = new WfcGrid(5,1,1,1,[]);

        grid.grid.forEach((rows, rowIndex) => {
            rows.forEach((cell, colIndex) => {
                if (colIndex === lowestColIndex && rowIndex === lowestRowIndex) {
                    cell.enthropy = 1.234;
                } else {
                    cell.enthropy = 2.2213;
                }
            });
        });

        const lowestEnthropyCell = grid.getCellOfLeastEnthropy();

        expect(lowestEnthropyCell.row).toBe(lowestRowIndex);
        expect(lowestEnthropyCell.column).toBe(lowestColIndex);
    });
});