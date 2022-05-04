const { Tile, Direction } = require('./tile');

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

    expect(tile.getConnector(0)).toBe('A');
    expect(tile.getConnector(1)).toBe('B');
    expect(tile.getConnector(2)).toBe('C');
    expect(tile.getConnector(3)).toBe('D');

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


test('rotated90 returns a new tile with mostly the same properties except rotated 90degrees', () => {
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
    outTile.connectors[0] = 'G';

    expect(inTile.connectors.length).toBe(4);
    expect(inTile.getConnector(0)).toBe('A');
    expect(inTile.getConnector(1)).toBe('B');
    expect(inTile.getConnector(2)).toBe('C');
    expect(inTile.getConnector(3)).toBe('D');
});

test('load will call the p5 loadImage function which is assumed in the global scope at runtime', () => {
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
