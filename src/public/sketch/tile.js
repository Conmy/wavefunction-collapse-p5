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
    constructor (imgPath, width, height, weight, rotation, connectors, isFlipped=false) {
        this.name = 'Tile';
        this.imgPath = imgPath;
        this.width = width;
        this.height = height;
        this.weight = weight;
        this.rotation = rotation;
        this.connectors = connectors;
        this.isFlipped = isFlipped;
    }

    load () {
        this.img = loadImage(this.imgPath);
    }

    draw (x, y) {
        console.log('drawing tile at position', x, y, this);
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
        const oppositeConnection =
            tile.getConnector(Direction.opposite(direction));
        const thisConnection =
            this.getConnector(direction);

        if (this.connectorIsAsymetrical(direction)) {
            const thisSymmetryType = thisConnection.slice(-1);
            if (thisSymmetryType === 'a') {
                return oppositeConnection.slice(0, -1) === thisConnection.slice(0, -1)
                    && oppositeConnection.slice(-1) === 'f';
            } else if (thisSymmetryType === 'f') {
                return oppositeConnection.slice(0, -1) === thisConnection.slice(0, -1)
                    && oppositeConnection.slice(-1) === 'a';
            }
        } else {
            return thisConnection === oppositeConnection;
        }

    }

    /**
     * Returns a new tile that is a rotated version of the current tile.
     */
    rotated90 () {
        const _connectors = [...this.connectors.slice(1), this.connectors[0]];

        return new Tile(this.imgPath, this.width, this.height, this.weight, this.rotation - 90,  _connectors);
    }

    connectorIsAsymetrical(direction) {
        return this.connectors[direction].slice(-1) === 'a'
            || this.connectors[direction].slice(-1) === 'f';
    }

    getTileVariants() {
        const newVariants = [];


        const rotated90 = this.rotated90();
        const rotated180 = rotated90.rotated90();
        const rotated270 = rotated180.rotated90();

        newVariants.push(rotated90, rotated180, rotated270);

        const hasAsymmetry = this.connectorIsAsymetrical(Direction.UP)
            || this.connectorIsAsymetrical(Direction.RIGHT)
            || this.connectorIsAsymetrical(Direction.LEFT)
            || this.connectorIsAsymetrical(Direction.DOWN);

        if (hasAsymmetry) {
            newVariants.push(
                this.getFlipped(),
                rotated90.getFlipped(),
                rotated180.getFlipped(),
                rotated270.getFlipped()
            );
        }

        return newVariants;
    }

    getFlipped() {
        const newConnectors = [];
        this.connectors.forEach((conn, connIndex) => {
            let connectorIndicator = '';
            if (connIndex === Direction.UP || connIndex === Direction.DOWN) {
                if (conn.slice(-1) === 'a') {
                    connectorIndicator = conn.slice(0, -1) + 'f';
                } else {
                    connectorIndicator = conn;
                }
            }
            else if (connIndex === Direction.RIGHT) {
                connectorIndicator = this.connectors[Direction.LEFT];
            } else if (connIndex === Direction.LEFT) {
                connectorIndicator = this.connectors[Direction.RIGHT];
            }
            newConnectors.push(connectorIndicator);
        });
        return new Tile(this.imgPath, this.width, this.height,
            this.weight, this.rotation, newConnectors, !this.isFlipped);
    }
}

if (typeof module !== undefined) {
    module.exports = {Tile, Direction};
}
