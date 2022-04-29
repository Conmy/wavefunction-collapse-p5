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
    constructor(imgPath, connectors, weight=1, rotation=0) {
        this.name = 'Tile';
        this.imgPath = imgPath;
        this.connectors = connectors;
        this.weight = weight;
        this.rotation = rotation;
    }

    load() {
        this.img = loadImage(this.imgPath);
    }

    draw(x, y, w=20, h=20) {
        if (this.rotation !== 0) {
            push();
            translate(w/2+x, h/2+y);
            imageMode(CENTER);
            rotate(PI/180 * this.rotation);
            image(this.img, 0, 0, w, h);
            pop();
        } else {
            image(this.img, x, y, w, h);
        }
    }

    getConnector(direction) {
        // TODO: validate/check direction to be valid?
        return this.connectors[direction];
    }

    canConnect(tile, direction) {
        return tile.getConnector(Direction.opposite(direction)) === this.getConnector(direction);
    }

    /**
     * Returns a new tile that is a rotated version of the current tile.
     */
    rotated90() {
        const _connectors = [...this.connectors.slice(1), this.connectors[0]];

        return new Tile(this.imgPath, _connectors, this.weight, this.rotation - 90);
    }
}