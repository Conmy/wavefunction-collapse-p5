const { Tile, Direction } = require('../public/sketch/tile');

afterEach(() => {
    jest.clearAllMocks();
});

test('Direction returns the index of the tile structure in that direction', () => {
    expect(Direction.UP).toBe(0);
    expect(Direction.RIGHT).toBe(1);
    expect(Direction.DOWN).toBe(2);
    expect(Direction.LEFT).toBe(3);
});


test('Direction.opposite can return the opposite direction.', () => {
    expect(Direction.opposite(Direction.UP)).toBe(Direction.DOWN);
    expect(Direction.opposite(Direction.RIGHT)).toBe(Direction.LEFT);
    expect(Direction.opposite(Direction.DOWN)).toBe(Direction.UP);
    expect(Direction.opposite(Direction.LEFT)).toBe(Direction.RIGHT);

    expect(Direction.opposite(Direction.UP)).not.toBe(Direction.UP);
    expect(Direction.opposite(Direction.UP)).not.toBe(Direction.RIGHT);
    expect(Direction.opposite(Direction.UP)).not.toBe(Direction.LEFT);

});

test('getConnector returns the corresponding connector', () => {
    const tile = new Tile('tiles/1.png', 20, 20, 1, 0, ['A', 'B', 'C', 'D']);

    expect(tile.getConnector(0)).toBe('A'); // UP
    expect(tile.getConnector(1)).toBe('B'); // RIGHT
    expect(tile.getConnector(2)).toBe('C'); // DOWN
    expect(tile.getConnector(3)).toBe('D'); // LEFT

});

test('Tile sides can connect to like named sides', () => {
    //imgPath, width, height, weight, rotation, connectors
    const tile1 = new Tile('tiles/1.png', 20, 20, 1, 0, ['A','B','C','D']);
    const tile2 = new Tile('tiles/1.png', 20, 20, 1, 0, ['F','F','A','F']);

    expect(tile1.canConnect(tile2, Direction.UP)).toBe(true);
    expect(tile1.canConnect(tile2, Direction.DOWN)).toBe(false);
    expect(tile1.canConnect(tile2, Direction.LEFT)).toBe(false);
    expect(tile1.canConnect(tile2, Direction.RIGHT)).toBe(false);

    expect(tile2.canConnect(tile1, Direction.DOWN)).toBe(true);
    expect(tile2.canConnect(tile1, Direction.UP)).toBe(false);
    expect(tile2.canConnect(tile1, Direction.LEFT)).toBe(false);
    expect(tile2.canConnect(tile1, Direction.RIGHT)).toBe(false);
});


test('rotated90 returns a new tile with mostly the same properties except ' +
'rotated 90 degrees', () => {
    const inTile = new Tile('HelloWorld', 20, 15, 1, 0, ['A','B', 'C', 'D']);

    const outTile = inTile.rotated90();

    expect(outTile.width).toBe(20);
    expect(outTile.height).toBe(15);
    expect(outTile.weight).toBe(1);
    expect(outTile.rotation).toBe(-90);

    expect(outTile.connectors.length).toBe(4);
    expect(outTile.getConnector(0)).toBe('B');
    expect(outTile.getConnector(1)).toBe('C');
    expect(outTile.getConnector(2)).toBe('D');
    expect(outTile.getConnector(3)).toBe('A');

});

test('rotated90 does not change the original tile connectors', () => {
    const inTile = new Tile('HelloWorld', 20, 15, 1, 0, ['A','B', 'C', 'D']);

    const outTile = inTile.rotated90();

    expect(inTile.connectors.length).toBe(4);
    expect(inTile.getConnector(0)).toBe('A');
    expect(inTile.getConnector(1)).toBe('B');
    expect(inTile.getConnector(2)).toBe('C');
    expect(inTile.getConnector(3)).toBe('D');
});

test('rotated90 does not change the original tile properties', () => {
    const inTile = new Tile('HelloWorld', 20, 15, 1, 0, ['A','B', 'C', 'D']);

    const outTile = inTile.rotated90();

    expect(inTile.connectors.length).toBe(4);
    expect(inTile.getConnector(0)).toBe('A');
    expect(inTile.getConnector(1)).toBe('B');
    expect(inTile.getConnector(2)).toBe('C');
    expect(inTile.getConnector(3)).toBe('D');

    expect(outTile.getConnector(0)).toBe('B');
    expect(outTile.getConnector(1)).toBe('C');
    expect(outTile.getConnector(2)).toBe('D');
    expect(outTile.getConnector(3)).toBe('A');
});

test('load will call the p5 loadImage function which is assumed in the global ' +
'scope at runtime', () => {
    global.loadImage = jest.fn();

    const inTile = new Tile('HelloWorld', 20, 20, 0, 0, []);
    inTile.load();

    expect(global.loadImage.mock.calls.length).toBe(1);
});

test('getTileVariants should return variants of the tile for different rotations', () => {
    const tile = new Tile('ImagePath', 1, 1, 0, 0, ['A', 'B', 'C', 'D']);

    const tileVariants = tile.getTileVariants();

    expect(tileVariants).toBeInstanceOf(Array);
    expect(tileVariants.length).toBe(3); // the three other rotations of the tile.

});

describe('Asymetrical tiles', () => {

    test('Tile is, by default, not flipped', () => {
        const tile = new Tile('ImagePath', 5, 5, 1, 0, ['A','B','C','D']);

        expect(tile.isFlipped).toBe(false);
    });

    test('Flipping an asymetrical tile changes the UP, DOWN connectors as ' +
    'flipped and inverts the LEFT, RIGHT connectors', () => {
        const tile = new Tile('ImagePath', 5, 5, 1, 0, ['Aa','Ba','Ca','Da']);

        const flippedTile = tile.getFlipped();
        expect(flippedTile.connectors[Direction.UP]).toBe('Af');
        expect(flippedTile.connectors[Direction.RIGHT]).toBe('Da');
        expect(flippedTile.connectors[Direction.DOWN]).toBe('Cf');
        expect(flippedTile.connectors[Direction.LEFT]).toBe('Ba');
    });

    test("If a connector value isn't asymetrical during a flip, its value " +
    "doesn't change", () => {
        const tile = new Tile('ImagePath', 5, 5, 1, 0, ['A','Ba','Ca','Da']);

        const flippedTile = tile.getFlipped();
        expect(flippedTile.connectors[Direction.UP]).toBe('A');
        expect(flippedTile.connectors[Direction.RIGHT]).toBe('Da');
        expect(flippedTile.connectors[Direction.DOWN]).toBe('Cf');
        expect(flippedTile.connectors[Direction.LEFT]).toBe('Ba');
    });

    test('Flipping an image sets the flipped property to true', () => {
        const tile = new Tile('ImagePath', 5, 5, 1, 0, ['Aa','Ba','Ca','Da']);

        const flippedTile = tile.getFlipped();
        expect(flippedTile.isFlipped).toBe(true);
    });

    test("getTileVariants creates flipped tiles when there's an asymetrical " +
    'connector present', () => {
        const tile = new Tile('ImagePath', 5, 5, 1, 0, ['Aa', 'B', 'C', 'D']);

        const tileVariants = tile.getTileVariants();

        expect(tileVariants.length).toBe(7);
    });

    test("The number of asymetrical connectors doesn't matter as long as " +
    "there's one, we expect more variants.", () => {
        const tile = new Tile('ImagePath', 5, 5, 1, 0, ['Aa', 'Ba', 'C', 'D']);

        const tileVariants = tile.getTileVariants();

        expect(tileVariants.length).toBe(7);
    });

    test("connectorIsAsymetrical returns true if the connector ends in 'a'", () => {
        const tile = new Tile('imagePath', 5, 5, 1, 0, ['A', 'B', 'C', 'D']);
        const asymTile = new Tile('imagePath', 5, 5, 1, 0, ['Aa', 'Ba', 'Ca', 'Da'], false);
        const flippedAsymTile = new Tile('imagePath', 5, 5, 1, 0, ['Af', 'Bf', 'Cf', 'Df'], true);

        expect(tile.connectorIsAsymetrical(Direction.UP)).toBe(false);
        expect(tile.connectorIsAsymetrical(Direction.RIGHT)).toBe(false);
        expect(tile.connectorIsAsymetrical(Direction.DOWN)).toBe(false);
        expect(tile.connectorIsAsymetrical(Direction.LEFT)).toBe(false);

        expect(asymTile.connectorIsAsymetrical(Direction.UP)).toBe(true);
        expect(asymTile.connectorIsAsymetrical(Direction.RIGHT)).toBe(true);
        expect(asymTile.connectorIsAsymetrical(Direction.DOWN)).toBe(true);
        expect(asymTile.connectorIsAsymetrical(Direction.LEFT)).toBe(true);

        expect(flippedAsymTile.connectorIsAsymetrical(Direction.UP)).toBe(true);
        expect(flippedAsymTile.connectorIsAsymetrical(Direction.RIGHT)).toBe(true);
        expect(flippedAsymTile.connectorIsAsymetrical(Direction.DOWN)).toBe(true);
        expect(flippedAsymTile.connectorIsAsymetrical(Direction.LEFT)).toBe(true);

    });

    test('Asymetrical connectors will only connect to their flipped version.', () => {
        const tile =
            new Tile('imagePath', 5, 5, 1, 0, ['Aa', 'Ba', 'Ca', 'Da']);
        const flippedMatchingTile =
            new Tile('imagePath', 5, 5, 1, 0, ['Cf', 'Df', 'Af', 'Bf']);

        expect(tile.canConnect(flippedMatchingTile, Direction.UP)).toBe(true);
        expect(tile.canConnect(flippedMatchingTile, Direction.RIGHT)).toBe(true);
        expect(tile.canConnect(flippedMatchingTile, Direction.DOWN)).toBe(true);
        expect(tile.canConnect(flippedMatchingTile, Direction.LEFT)).toBe(true);
    });

    test("Asymetrical connectors won't connect to the same version of themselves", () => {
        const tile =
            new Tile('imagePath', 5, 5, 1, 0, ['Aa', 'Ba', 'Ca', 'Da']);
        const flippedNonMatchingTile =
            new Tile('imagePath', 5, 5, 1, 0, ['Ca', 'Da', 'Aa', 'Ba']);

        expect(tile.canConnect(flippedNonMatchingTile, Direction.UP)).toBe(false);
        expect(tile.canConnect(flippedNonMatchingTile, Direction.RIGHT)).toBe(false);
        expect(tile.canConnect(flippedNonMatchingTile, Direction.DOWN)).toBe(false);
        expect(tile.canConnect(flippedNonMatchingTile, Direction.LEFT)).toBe(false);
    });
});

describe('canConnect', () => {
    test('should return false when sides are not able to connect', () => {
        const tileOnTop = new Tile('ImagePath', 10, 10, 1, 0, ['A', 'A', 'A', 'B']);
        const tileToRight = new Tile('ImagePath', 10, 10, 1, 0, ['B', 'A', 'B', 'B']);
        const tileToBottom = new Tile('ImagePath', 10, 10, 1, 0, ['B', 'B', 'A', 'B']);

        const tile = new Tile('ImagePath', 10, 10, 1, 0, ['B', 'B', 'B', 'B']);

        let connectable = tile.canConnect(tileOnTop, Direction.UP);
        expect(connectable).toBe(false);

        connectable = tile.canConnect(tileToRight, Direction.RIGHT);
        expect(connectable).toBe(true);

        connectable = tile.canConnect(tileToBottom, Direction.DOWN);
        expect(connectable).toBe(true);
    });
});
