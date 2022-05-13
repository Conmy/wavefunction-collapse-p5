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
        this.grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell.chosenTileIndex === null) {
                    stroke(strokeColor);
                    strokeWeight(weightStroke);
                    if (cell.tileOptions.length > 0) {
                        fill('green');
                    } else {
                        fill('red');
                    }
                    rect(colIndex * this.tileWidth, rowIndex * this.tileHeight,
                        this.tileWidth, this.tileHeight);
                    push();
                    strokeWeight(0);
                    stroke(51);
                    fill(51);
                    text(cell.tileOptions.length.toString(), colIndex * this.tileWidth, rowIndex * this.tileHeight + this.tileHeight - 1);
                    pop();

                } else {
                    const myTile = this.getTile(cell.chosenTileIndex);
                    myTile.draw(colIndex * this.tileWidth, rowIndex * this.tileHeight);
                }
            });
        });
    }

    getTile(index) {
        return this.tiles[index];
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
                const currentCell = this.getCell(j, i);
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
            compCell = this.getCell(cellCol, cellRow - 1);
        } else if (direction === Direction.RIGHT) {
            if (cellCol >= this.cols - 1) {
                return true;
            }
            compCell = this.getCell(cellCol + 1, cellRow);
        } else if (direction == Direction.DOWN) {
            if (cellRow >= this.rows - 1) {
                return true;
            }
            compCell = this.getCell(cellCol, cellRow + 1);
        } else if (direction == Direction.LEFT) {
            if (cellCol <= 0) {
                return true;
            }
            compCell = this.getCell(cellCol - 1, cellRow);
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
            const returnCell = smallestCells[Math.floor(Math.random() * smallestCells.length)];
            return returnCell;
        } else {
            return null;
        }
    }

    updateCellTileOptions(cell) {
        let tileOptionList = Array.from({length:this.tiles.length}, (v,i) => i);
        tileOptionList =
            this._getValidTileOptionsForCell(cell, Direction.UP, tileOptionList);
        tileOptionList =
            this._getValidTileOptionsForCell(cell, Direction.RIGHT, tileOptionList);
        tileOptionList =
            this._getValidTileOptionsForCell(cell, Direction.DOWN, tileOptionList);
        tileOptionList =
            this._getValidTileOptionsForCell(cell, Direction.LEFT, tileOptionList);

        if (tileOptionList.length === 0) {
            cell.tileOptions = [];
        }
        cell.tileOptions = tileOptionList;
    }

    _getValidTileOptionsForCell(cell, direction, currentTileOptions) {

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
        else if (direction === Direction.RIGHT) {
            if (cellCol >= this.cols - 1) {
                return currentTileOptions.slice();
            }
            otherColIndex = cellCol + 1;
        }
        else if (direction === Direction.DOWN) {
            if (cellRow >= this.rows - 1) {
                return currentTileOptions.slice();
            }
            otherRowIndex = cellRow + 1;
        }
        else if (direction === Direction.LEFT) {
            if (cellCol === 0) {
                return currentTileOptions.slice();
            }
            otherColIndex = cellCol - 1;
        }

        // Get the cell in the direction for checking.
        const otherCell = this.getCell(otherColIndex, otherRowIndex);

        // If the "other" cell is already collapsed, ensure that the current cell options
        // can match to that cell.

        if (otherCell.status === WfcStatus.COLLAPSED) {
            const otherCellTile = this.tiles[otherCell.chosenTileIndex];
            const stillValidTileIndexes = [];
            for (let i=0; i<currentTileOptions.length; i++) {
                const currentTileIndex = currentTileOptions[i];
                const tileUnderTest = this.tiles[currentTileIndex];
                if (tileUnderTest.canConnect(otherCellTile, direction)) {
                    stillValidTileIndexes.push(currentTileIndex);
                }
            }
            return stillValidTileIndexes;
        }

        // We have to do something else if there's no tile??
        // Or just return current tile options??

        return currentTileOptions.slice();

    }

    getCell(column, row){
        if (column >= this.cols || column < 0) {
            throw `Could not find cell in column index ${column}. Out of grid bounds`;
        }
        if (row >= this.rows || row < 0) {
            throw `Could not find cell in row index ${row}. Out of grid bounds`;
        }

        return this.grid[row][column];
    }

    getSurroundingCells(cell) {
        const cells = [];
        // UP
        if (cell.row > 0) {
            cells.push(this.getCell(cell.column, cell.row - 1));
        }
        // RIGHT
        if (cell.column < this.cols - 1) {
            cells.push(this.getCell(cell.column + 1, cell.row));
        }
        // DOWN
        if (cell.row < this.rows - 1) {
            cells.push(this.getCell(cell.column, cell.row + 1));
        }
        // LEFT
        if (cell.column > 0) {
            cells.push(this.getCell(cell.column - 1, cell.row));
        }

        return cells;
    }
}

if (typeof module !== undefined) {
    module.exports = { WfcGrid };
}
