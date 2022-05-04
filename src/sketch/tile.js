const Direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
    opposite: function(dir) {
        if (dir === Direction.UP) return Direction.DOWN;
        if (dir === Direction.RIGHT) return Direction.LEFT;
        if (dir === Direction.DOWN) return Direction.UP;
        if (dir === Direction.LEFT) return Direction.RIGHT;
        console.error('Inappropriate direction passed to function \'opposite\'', dir);
    }
};

class Tile {
    constructor (imgPath, width, height, weight, rotation, connectors) {
        this.name = 'Tile';
        this.imgPath = imgPath;
        this.connectors = connectors;
        this.weight = weight;
        this.rotation = rotation;
        this.width = width;
        this.height = height;
    }

    load () {
        this.img = loadImage(this.imgPath);
    }

    draw (x, y) {
        if (this.rotation !== 0) {
            push();
            translate(this.width/2+x, this.height/2+y);
            imageMode(CENTER);
            rotate(PI/180 * this.rotation);
            image(this.img, 0, 0, this.width, this.height);
            pop();
        } else {
            image(this.img, x, y, this.width, this.height);
        }
    }

    getConnector (direction) {
        // TODO: validate/check direction to be valid?
        return this.connectors[direction];
    }

    canConnect (tile, direction) {
        return tile.getConnector(Direction.opposite(direction)) === this.getConnector(direction);
    }

    /**
     * Returns a new tile that is a rotated version of the current tile.
     */
    rotated90 () {
        const _connectors = [...this.connectors.slice(1), this.connectors[0]];

        return new Tile(this.imgPath, this.width, this.height, this.weight, this.rotation - 90,  _connectors);
    }

    getTileVariants() {
        // Add the variants of the tile.
        const tileVariant = this.rotated90();
        const tileVariant2 = tileVariant.rotated90();
        const tileVariant3 = tileVariant2.rotated90();

        return [tileVariant, tileVariant2, tileVariant3];
    }
}

if (typeof module !== undefined) {
    module.exports = {Tile, Direction};
}
