const { WfcGrid } = require('../public/sketch/wfcGrid');
const { WfcCell, WfcStatus } = require('../public/sketch/wfcCell');
const { Tile, Direction } = require('../public/sketch/tile');

beforeEach(() => {
    // Set up expected globally available objects.
    global.WfcCell = WfcCell;
    global.WfcStatus = WfcStatus;
    global.Direction = Direction;
});

afterEach(() => {
    jest.clearAllMocks();
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

describe('calculateAllCellEntropies', () => {
    test('calls calculateEnthropy on all cells in the grid', () => {
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

describe('getCell', () => {
    test('should return the cell at the given location in the grid', () => {
        const grid = new WfcGrid(3, 3, 10, 10, [
            new Tile('imagePath', 10, 10, 1, 0, ['A', 'B', 'C', 'D']),
            new Tile('imagePath', 10, 10, 1, 0, ['C', 'D', 'A', 'B']),
        ]);

        const cellAt1_2 = grid.getCell(1,2);
        expect(cellAt1_2.column).toBe(1);
        expect(cellAt1_2.row).toBe(2);
    });

    test('should not return a cell if index is out of range of the grid bounds', () => {
        const grid = new WfcGrid(3, 3, 10, 10, [
            new Tile('imagePath', 10, 10, 1, 0, ['A', 'B', 'C', 'D']),
            new Tile('imagePath', 10, 10, 1, 0, ['C', 'D', 'A', 'B']),
        ]);

        const exceedsCol = 3;
        const exceedsRow = 3;

        expect(() => {
            grid.getCell(exceedsCol, 0);
        }).toThrow(`Could not find cell in column index ${exceedsCol}. Out of grid bounds`);

        expect(() => {
            grid.getCell(0, exceedsRow);
        }).toThrow(`Could not find cell in row index ${exceedsRow}. Out of grid bounds`);

    });

});

describe('initCellTileOptions', () => {

    test('sets the tileOptions of the grid cells to an array of all tile indices', () => {
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
});

describe('updateCellTileOptions', () => {
    test("should check the cells around a cell and eliminate options that " +
    "can't connect", () => {
        const cols = 3;
        const rows = 3;
        const grid = new WfcGrid(cols, rows, 10, 10, [
            new Tile('imagePath', 10, 10, 1, 0, ['A', 'B', 'C', 'D']),
            // Invalid to connections from 0 in all directions
            new Tile('imagePath', 10, 10, 1, 0, ['A', 'B', 'C', 'D']),
            // Valid to 0 and 1 in all directions
            new Tile('imagePath', 10, 10, 1, 0, ['C', 'D', 'A', 'B']),
            // Valid to 0 to the right and up
            new Tile('imagePath', 10, 10, 1, 0, ['C', 'B', 'C', 'D']),
        ]);

        grid.initCellTileOptions();

        const cellAbove = grid.getCell(1, 1);
        cellAbove.collapseTo(0);

        const cell = grid.getCell(1, 2);
        // Expect all options to be valid before any update.
        expect(cell.tileOptions).toEqual([0, 1, 2, 3]);

        grid.updateCellTileOptions(cell);

        // Expect the tile options to be narrowed down to only options
        // that will connect to the collapsed tile.
        expect(cell.tileOptions).toEqual([2, 3]);

        const cellRight = grid.getCell(2, 2);
        cellRight.collapseTo(2);

        grid.updateCellTileOptions(cell);

        // Expect tile options to be just those that can connect to the already
        // collapsed tiles in 1,1 and 2,2
        expect(cell.tileOptions).toEqual([3]);
    });

    test('should only have options that fit to connections on all sides', () => {
        const cols = 1;
        const rows = 3;
        const grid = new WfcGrid(cols, rows, 10, 10, [
            new Tile('imagePath', 10, 10, 1, 0, ['A', 'B', 'C', 'D']),

            new Tile('imagePath', 10, 10, 1, 0, ['C', 'D', 'B', 'A']),

            new Tile('imagePath', 10, 10, 1, 0, ['B', 'C', 'D', 'A']),
        ]);

        grid.initCellTileOptions();

        grid.getCell(0, 0).collapseTo(0);
        grid.getCell(0, 2).collapseTo(2);

        let cell = grid.getCell(0, 1);
        grid.updateCellTileOptions(cell);

        expect(cell.tileOptions.length).toEqual(1);
        expect(cell.tileOptions[0]).toBe(1);
    });
});

describe('getSurroundingCells', () => {
    test('should get the surrounding cells in the orthogonal directions', () => {
        const grid = new WfcGrid(3,3,10,10,[]);

        const cell = grid.getCell(1, 1);
        const returnedArray = grid.getSurroundingCells(cell);

        expect(returnedArray.length).toBe(4);
        expect(returnedArray[0]).toBeInstanceOf(WfcCell);
        // UP
        expect(returnedArray[0].column).toBe(1);
        expect(returnedArray[0].row).toBe(0);
        // RIGHT
        expect(returnedArray[1].column).toBe(2);
        expect(returnedArray[1].row).toBe(1);
        // DOWN
        expect(returnedArray[2].column).toBe(1);
        expect(returnedArray[2].row).toBe(2);
        // LEFT
        expect(returnedArray[3].column).toBe(0);
        expect(returnedArray[3].row).toBe(1);
    });

    test('should return three options if cell is on one the edge', () => {
        const grid = new WfcGrid(3, 3, 10, 10, []);

        let cell = grid.getCell(0, 1);
        let returnedArray = grid.getSurroundingCells(cell);
        expect(returnedArray.length).toEqual(3);
        // UP
        expect(returnedArray[0].column).toBe(0);
        expect(returnedArray[0].row).toBe(0);
        // RIGHT
        expect(returnedArray[1].column).toBe(1);
        expect(returnedArray[1].row).toBe(1);
        //DOWN
        expect(returnedArray[2].column).toBe(0);
        expect(returnedArray[2].row).toBe(2);


        cell = grid.getCell(1, 0);
        returnedArray = grid.getSurroundingCells(cell);
        expect(returnedArray.length).toEqual(3);
        // RIGHT
        expect(returnedArray[0].column).toBe(2);
        expect(returnedArray[0].row).toBe(0);
        //DOWN
        expect(returnedArray[1].column).toBe(1);
        expect(returnedArray[1].row).toBe(1);
        //LEFT
        expect(returnedArray[2].column).toBe(0);
        expect(returnedArray[2].row).toBe(0);

        cell = grid.getCell(2, 1);
        returnedArray = grid.getSurroundingCells(cell);
        expect(returnedArray.length).toEqual(3);
        // UP
        expect(returnedArray[0].column).toBe(2);
        expect(returnedArray[0].row).toBe(0);
        //DOWN
        expect(returnedArray[1].column).toBe(2);
        expect(returnedArray[1].row).toBe(2);
        //LEFT
        expect(returnedArray[2].column).toBe(1);
        expect(returnedArray[2].row).toBe(1);
    });

    test('should return two options if cell is a corner cell', () => {
        const grid = new WfcGrid(3,3,10,10,[]);

        let cell = grid.getCell(0,0);
        let returnedArray = grid.getSurroundingCells(cell);
        expect(returnedArray.length).toBe(2);

        cell = grid.getCell(2,2);
        returnedArray = grid.getSurroundingCells(cell);
        expect(returnedArray.length).toBe(2);
    })
});

describe('updateCellTileOptions', () => {
    test('should update the cell tileOptions to a subset of the tiles that can ' +
    'connect to the collapsed neighbours', () => {
        const grid = new WfcGrid(3, 3, 10, 10, [
            new Tile('ImagePath', 10, 10, 1, 0, ['A', 'A', 'A', 'B']),
            new Tile('ImagePath', 10, 10, 1, 0, ['B', 'A', 'B', 'B']),
            new Tile('ImagePath', 10, 10, 1, 0, ['B', 'B', 'A', 'B']),

            new Tile('ImagePath', 10, 10, 1, 0, ['B', 'B', 'B', 'B']),
            new Tile('ImagePath', 10, 10, 1, 0, ['A', 'B', 'B', 'A'])
        ]);

        grid.initCellTileOptions();

        let cell = grid.getCell(0, 0);
        cell.collapseTo(0);
        cell = grid.getCell(1, 1);
        cell.collapseTo(1);
        cell = grid.getCell(0, 2);
        cell.collapseTo(2);

        cell = grid.getCell(0, 1);
        grid.updateCellTileOptions(cell);



    });

    test('should update the cell tileOptions to an empty array if there are' +
    'no valid options available', () => {
        const grid = new WfcGrid(3, 3, 10, 10, [
            new Tile('ImagePath', 10, 10, 1, 0, ['A', 'A', 'A', 'B']),
            new Tile('ImagePath', 10, 10, 1, 0, ['B', 'A', 'B', 'B']),
            new Tile('ImagePath', 10, 10, 1, 0, ['B', 'B', 'A', 'B']),

            new Tile('ImagePath', 10, 10, 1, 0, ['B', 'B', 'B', 'B']),
        ]);

        grid.initCellTileOptions();

        let cell = grid.getCell(0, 0);
        cell.collapseTo(0);
        cell = grid.getCell(1, 1);
        cell.collapseTo(1);
        cell = grid.getCell(0, 2);
        cell.collapseTo(2);

        cell = grid.getCell(0, 1);
        grid.updateCellTileOptions(cell);

        expect(cell.tileOptions.length).toBe(0);
    });
});