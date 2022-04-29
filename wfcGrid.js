const weightStroke = 2;
const strokeColor = 'grey';
const gridFill = 51;

class WfcGrid {
    constructor(cols, rows, tileWidth, tileHeight, tiles) {
        this.cols = cols;
        this.rows = rows;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.tiles = tiles;
    }

    initGrid() {
        this.grid = new Array(this.rows);
        for (let i=0; i<this.grid.length; i++) {
            this.grid[i] = new Array(this.cols);
        }

        for (let i=0; i<this.grid.length; i++) {
            for (let j=0; j<this.grid[i].length; j++) {
                this.grid[i][j] = new WfcCell(j, i);
            }
        }
        // console.log('Initialized the grid', this.grid);
    }

    load() {
        this.tiles.forEach(tile => {
            tile.load();
        });
    }

    draw() {
        stroke(strokeColor);
        strokeWeight(weightStroke);
        fill(gridFill);

        this.grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell.chosenTileIndex === null) {
                    rect(colIndex * this.tileWidth, rowIndex * this.tileHeight,
                        this.tileWidth, this.tileHeight);
                } else {
                    this.tiles[cell.chosenTileIndex].draw(
                        colIndex * this.tileWidth, rowIndex * this.tileHeight,
                        this.tileWidth, this.tileHeight);
                }
            });
        });
    }

    populateCellTileOptions() {
        this.grid.forEach(row => row.forEach(cell => {
            cell.setTileOptions(Array.from({length: this.tiles.length}, (v,i) => i));
        }));
        // console.log('tileOptions populated', this.grid);
    }

    calculateCellEnthropies() {
        for (let i=0; i<this.grid.length; i++) {
            for (let j=0; j<this.grid[i].length; j++) {
                // console.log('Calculate enthropy of cell at', i, j, this.tiles);
                this.grid[i][j].calculateEnthropy(this.tiles);
            }
        }
    }

    collapseCell() {
        const cell = this._getCellOfLeastEnthropy();
        if (cell) {
            cell.collapse();
            return cell;
        }
        else {
            // console.log('No Cell to collapse');
        }
    }

    streamlineOptions(cell) {
        this.streamlineCellNeighbor(cell, Direction.UP);
        this.streamlineCellNeighbor(cell, Direction.RIGHT);
        this.streamlineCellNeighbor(cell, Direction.DOWN);
        this.streamlineCellNeighbor(cell, Direction.LEFT);
    }

    streamlineCellNeighbor(cell, direction) {
        const cellCol = cell.column;
        const cellRow = cell.row;
        const currentTile = this.tiles[cell.chosenTileIndex];

        // Figure out the comparison cell.
        let compCell;
        if (direction === Direction.UP) {
            if (cellRow <= 0) {
                // console.log("Can't streamline UP from current position", cellCol, cellRow);
                return;
            }
            compCell = this._getCell(cellCol, cellRow - 1);
        } else if (direction === Direction.RIGHT) {
            // Cell Column must be less than the max columns
            if (cellCol >= this.cols - 1) {
                // console.log("Can't streamline RIGHT from current position", cellCol, cellRow);
                return;
            }
            compCell = this._getCell(cellCol + 1, cellRow);
        } else if (direction == Direction.DOWN) {
            // Cell row must be less than max rows
            if (cellRow >= this.rows - 1) {
                // console.log("Can't streamline DOWN from current position", cellCol, cellRow);
                return;
            }
            compCell = this._getCell(cellCol, cellRow + 1);
        } else if (direction == Direction.LEFT) {
            if (cellCol <= 0) {
                // console.log("Can't streamline LEFT from current position", cellCol, cellRow);
                return;
            }
            compCell = this._getCell(cellCol - 1, cellRow);
        }

        if (compCell.status === WfcStatus.COLLAPSED) {
            // console.log("Cell is already collapsed", compCell);
            return;
        }

        const createNewValidOptions = (totalValidOptions, currentTileOption) => {
            if (currentTile.canConnect(this.tiles[currentTileOption], direction)) {
                totalValidOptions.push(currentTileOption);
            }
            return totalValidOptions;
        }
        const validOptions = compCell.tileOptions.reduce(createNewValidOptions, []);

        // set the tile options on the compCell.
        compCell.setTileOptions(validOptions);

        // ensure there is at least one valid option.
        if (validOptions.length === 0) {
            console.error("No valid options for the cell", cell, compCell);
        }
    }

    addTileVariants() {
        const tileLength = this.tiles.length;
        for (let i=0; i<tileLength; i++) {
            const tile = this.tiles[i];
            // Add the variants of the tile.
            const tileVariant = tile.rotated90();
            const tileVariant2 = tileVariant.rotated90();
            const tileVariant3 = tileVariant2.rotated90();
            this.tiles.push(tileVariant);
            this.tiles.push(tileVariant2);
            this.tiles.push(tileVariant3);
        }
    }

    // Gets the cell with the smallest enthropy value.
    _getCellOfLeastEnthropy() {
        let smallestValue;
        let smallestCell;

        // console.log('Checking grid for smallest enthropy', this.grid);
        this.grid.forEach((row) => {
            row.forEach((cell) => {
                if (cell.status === WfcStatus.OPEN) {
                    // populate the smallestValue on first pass and if cell entropy is smaller.
                    if ((!smallestValue) || cell.enthropy < smallestValue) {
                        smallestValue = cell.enthropy;
                        smallestCell = cell;
                    }
                } else {
                    // console.log('Cell is already collapsed. Skipping', cell);
                }
            });
        });

        return smallestCell;
    }

    isFinished() {
        this.grid.forEach(row => {
            row.forEach(cell => {
                if (cell.status === WfcStatus.OPEN){
                    return false;
                }
            });
        });
        return true;
    }

    _getCell(column, row){
        return this.grid[row][column];
    }
}
