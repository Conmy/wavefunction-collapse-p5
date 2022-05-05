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
        this._initGrid();
    }

    _initGrid() {
        this.grid = new Array(this.rows);
        for (let i=0; i<this.grid.length; i++) {
            this.grid[i] = new Array(this.cols);
        }

        for (let i=0; i<this.grid.length; i++) {
            for (let j=0; j<this.grid[i].length; j++) {
                this.grid[i][j] = new WfcCell(j, i);
            }
        }
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
                        colIndex * this.tileWidth, rowIndex * this.tileHeight);
                }
            });
        });
    }

    initCellTileOptions() {
        if (!this.grid || this.grid.length === 0) {
            throw 'Grid is not initialized.';
        }
        this.grid.forEach(row => row.forEach(cell => {
            cell.setTileOptions(Array.from({length: this.tiles.length}, (v,i) => i));
        }));
    }

    calculateAllCellEnthropies() {
        for (let i=0; i<this.grid.length; i++) {
            for (let j=0; j<this.grid[i].length; j++) {
                const currentCell = this._getCell(j, i);
                currentCell.calculateEnthropy(this.tiles);
            }
        }
    }

    // TODO: Unit Test/Refactor
    streamlineTileOptionsAroundCell(cell, tileIndex) {
        return this.streamlineCellNeighbor(cell, tileIndex, Direction.UP) &&
            this.streamlineCellNeighbor(cell, tileIndex, Direction.RIGHT) &&
            this.streamlineCellNeighbor(cell, tileIndex, Direction.DOWN) &&
            this.streamlineCellNeighbor(cell, tileIndex, Direction.LEFT);
    }

    // TODO: Unit Test/Refactor
    streamlineCellNeighbor(cell, tileIndex, direction) {
        const cellCol = cell.column;
        const cellRow = cell.row;
        const currentTile = this.tiles[tileIndex];

        // Figure out the comparison cell.
        let compCell;
        if (direction === Direction.UP) {
            if (cellRow <= 0) {
                return true;
            }
            compCell = this._getCell(cellCol, cellRow - 1);
        } else if (direction === Direction.RIGHT) {
            if (cellCol >= this.cols - 1) {
                return true;
            }
            compCell = this._getCell(cellCol + 1, cellRow);
        } else if (direction == Direction.DOWN) {
            if (cellRow >= this.rows - 1) {
                return true;
            }
            compCell = this._getCell(cellCol, cellRow + 1);
        } else if (direction == Direction.LEFT) {
            if (cellCol <= 0) {
                return true;
            }
            compCell = this._getCell(cellCol - 1, cellRow);
        }

        if (compCell.status === WfcStatus.COLLAPSED) {
            // console.log("Cell is already collapsed", compCell);
            // TODO: Should we check here for validity?
            // e.g. if we collapsed to an invalid neighbor that is already collapsed
            // and this was somehow not caught before now?
            return true;
        }

        const reduceToValidTileOptions = (totalValidOptions, currentTileOption) => {
            if (currentTile.canConnect(this.tiles[currentTileOption], direction)) {
                totalValidOptions.push(currentTileOption);
            }
            return totalValidOptions;
        }
        const validTileOptions = compCell.tileOptions.reduce(reduceToValidTileOptions, []);

        if (validTileOptions.length === 0) {
            console.error("No valid options for the cell", cell, compCell);
            return false;
        }

        // TODO: move this out to be done AFTER checking that it is valid for all 4 sides.
        // set the tile options on the compCell.
        compCell.setTileOptions(validTileOptions);
        // recalculate enthropy for the cell.
        compCell.calculateEnthropy(this.tiles);
        return true;
    }

    addTileVariants() {
        const tileLength = this.tiles.length;
        for (let i=0; i<tileLength; i++) {
            const tile = this.tiles[i];
            const variants = tile.getTileVariants();
            this.tiles.push(...variants);
        }
    }

    isFullyPopulated() {
        let fullyPopulated = true;
        this.grid.forEach(row => {
            row.forEach(cell => {
                if (cell.status === WfcStatus.OPEN){
                    fullyPopulated = false;
                }
            });
        });
        return fullyPopulated;
    }

    getCellOfHighestEnthropy() {
        let largestValue = -100;
        let largestCells = [];

        for (let i=0; i < this.grid.length; i++) {
            for (let j=0; j < this.grid[i].length; j++) {
                let currentCell = this.grid[i][j];

                if (curentCell.status === WfcStatus.OPEN) {
                    if (largestValue === -100) {
                        largestValue = currentCell.enthropy;
                        largestCells.push(curentCell);
                    } else if (currentCell.enthropy === largestValue) {
                        largestCells.push(currentCell);
                    } else if (currentCell.enthropy > largestValue) {
                        largestValue = currentCell.enthropy;
                        largestCells = [currentCell];
                    }
                }
            }
        }

        if (largestCells.length > 0) {
            return largestCells[Math.floor(Math.random() * largestCells.length)];
        } else {
            return null;
        }
    }

    /**
     *
     * @returns The cell with the smallest enthropy value.
     */
    getCellOfLeastEnthropy() {
        let smallestValue;
        let smallestCells = [];

        this.grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                // only recalculate enthropy of open cells.
                if (cell.status === WfcStatus.OPEN) {
                    if (!smallestValue) {
                        // populate the smallestValue on first pass
                        smallestValue = cell.enthropy;
                        smallestCells.push(cell);
                    } else if (cell.enthropy === smallestValue) {
                        smallestCells.push(cell)
                    } else if (cell.enthropy < smallestValue) {
                        smallestCells = [cell];
                        smallestValue = cell.enthropy;
                    }
                }
            });
        });

        if (smallestCells.length >= 1) {
            return smallestCells[Math.floor(Math.random() * smallestCells.length)];
        } else {
            return null;
        }
    }

    updateCellTileOptions(cell) {
        let tileOptionList = Array.from({length:this.tiles.length}, (v,i) => i);
        tileOptionList = this.getValidTileOptionsForCell(cell, Direction.UP, tileOptionList);
        tileOptionList = this.getValidTileOptionsForCell(cell, Direction.RIGHT, tileOptionList);
        tileOptionList = this.getValidTileOptionsForCell(cell, Direction.DOWN, tileOptionList);
        tileOptionList = this.getValidTileOptionsForCell(cell, Direction.LEFT, tileOptionList);
        if (tileOptionList.length === 0) {
            console.error("No valid options for the cell after re-calc", cell);
            cell.tileOptions = [];
        }
        cell.tileOptions = tileOptionList;
    }

    getValidTileOptionsForCell(cell, direction, currentTileOptions) {

        const cellCol = cell.column;
        const cellRow = cell.row;

        let otherRowIndex = cellRow;
        let otherColIndex = cellCol;

        // Check extremes of the grid - if there's no cells in the direction from the current cell,
        // just return the current options.
        if (direction === Direction.UP) {
            if (cellRow === 0) {
                return currentTileOptions.slice();
            }
            otherRowIndex = cellRow - 1;
        }
        if (direction === Direction.RIGHT) {
            if (cellCol >= this.cols - 1) {
                return currentTileOptions.slice();
            }
            otherColIndex = cellCol + 1;
        }
        if (direction === Direction.DOWN) {
            if (cellRow >= this.rows - 1) {
                return currentTileOptions.slice();
            }
            otherRowIndex = cellRow + 1;
        }
        if (direction === Direction.LEFT) {
            if (cellCol === 0) {
                return currentTileOptions.slice();
            }
            otherColIndex = cellCol - 1;
        }

        // Get the cell in the direction for checking.
        const otherCell = this.grid[otherRowIndex][otherColIndex];

        // If the "other" cell is already collapsed, ensure that the current cell options
        // can match to that cell.

        if (otherCell.status === WfcStatus.COLLAPSED) {
            const otherCellTile = this.tiles[otherCell.chosenTileIndex];
            const stillValidTileIndexes = [];
            for (let i=0; i<cell.tileOptions.length; i++) {
                const currentTileIndex = cell.tileOptions[i];
                const tileUnderTest = this.tiles[currentTileIndex];
                if (tileUnderTest.canConnect(otherCellTile, direction)) {
                    stillValidTileIndexes.push(currentTileIndex);
                }
            }
            return stillValidTileIndexes;
        }
        else {
            // We have to do something else if there's no tile??
            // Or just return current tile options??
        }
        return currentTileOptions.slice();

    }

    _getCell(column, row){
        return this.grid[row][column];
    }
}

if (typeof module !== undefined) {
    module.exports = { WfcGrid };
}
