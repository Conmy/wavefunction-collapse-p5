const { WfcCell, WfcStatus } = require('../public/sketch/wfcCell');

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

test('calculateEntropy sets the entropy for the cell by evaluating the weights of the tile options', () => {
    const cell = new WfcCell(5, 0);
    // Allow all the tileOptions.
    cell.setTileOptions([0,1,2,3,4]);

    // Before calculation we don't have a value for entropy.
    expect(cell.entropy).toBe(0);

    // Create "Tiles" that have a weight property that can be accessed from the cell function.
    const tiles = Array.from(Array(5), _ => {return {weight: 1}});
    cell.calculateEntropy(tiles);

    expect(cell.entropy).toBeCloseTo(1.6094379, 5);
});

test('calculateEntropy sets the entropy for the cell by evaluating the varying weights of the tile options', () => {
    const cell = new WfcCell(5, 0);
    // Allow all the tileOptions.
    cell.setTileOptions([0,1,2,3,4]);

    // Before calculation we don't have a value for entropy.
    expect(cell.entropy).toBe(0);

    // Create "Tiles" that have a weight property that can be accessed from the cell function.
    const tiles = Array.from(Array(5), (v, i) => {return {weight: i+1}});
    cell.calculateEntropy(tiles);

    expect(cell.entropy).toBeCloseTo(1.489750318, 5);
});

test('collapseTo collapses the cell to the chosen value', () => {
    const cell = new WfcCell(0, 0);
    cell.setTileOptions([0,1,2,3,4]);

    const chosenIndex = 3;

    cell.collapseTo(chosenIndex);

    expect(cell.status).toBe(WfcStatus.COLLAPSED);
    expect(cell.chosenTileIndex).toBe(chosenIndex);
});
