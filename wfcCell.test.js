const { WfcCell, WfcStatus } = require('./wfcCell');

test('WfcCell gets created with a ref to its position in the grid', () => {
    let cell = new WfcCell(3, 0);
    expect(cell.column).toBe(3);
    expect(cell.row).toBe(0);

    cell = new WfcCell(3, 5);
    expect(cell.column).toBe(3);
    expect(cell.row).toBe(5);
});

test('tileOptions for the cell can be set with setTileOptions', () => {
    const cell = new WfcCell(5, 0);

    expect(cell.tileOptions.length).toBe(0);

    cell.setTileOptions([0,1,2,3,4]);

    for (let i = 0; i < 5; i++) {
        expect(cell.tileOptions[i]).toBe(i);
    }
});

test('calculateEnthropy sets the entropy for the cell by evaluating the weights of the tile options', () => {
    const cell = new WfcCell(5, 0);
    // Allow all the tileOptions.
    cell.setTileOptions([0,1,2,3,4]);

    // Before calculation we don't have a value for enthropy.
    expect(cell.enthropy).toBe(0);

    // Create "Tiles" that have a weight property that can be accessed from the cell function.
    const tiles = Array.from(Array(5), _ => {return {weight: 1}});
    cell.calculateEnthropy(tiles);

    expect(cell.enthropy).toBeCloseTo(1.6094379, 5);
});

test('calculateEnthropy sets the entropy for the cell by evaluating the varying weights of the tile options', () => {
    const cell = new WfcCell(5, 0);
    // Allow all the tileOptions.
    cell.setTileOptions([0,1,2,3,4]);

    // Before calculation we don't have a value for enthropy.
    expect(cell.enthropy).toBe(0);

    // Create "Tiles" that have a weight property that can be accessed from the cell function.
    const tiles = Array.from(Array(5), (v, i) => {return {weight: i+1}});
    cell.calculateEnthropy(tiles);

    expect(cell.enthropy).toBeCloseTo(1.489750318, 5);
});

test('collapseTo collapses the cell to the chosen value', () => {
    const cell = new WfcCell(0, 0);
    cell.setTileOptions([0,1,2,3,4]);

    const chosenIndex = 3;

    cell.collapseTo(chosenIndex);

    expect(cell.status).toBe(WfcStatus.COLLAPSED);
    expect(cell.chosenTileIndex).toBe(chosenIndex);
});

test('collapseTo clears the tileOptions', () => {
    const cell = new WfcCell(0,0);

    cell.setTileOptions([3,4,5,6]);

    cell.collapseTo(1);

    expect(cell.tileOptions.length).toBe(0);
});
