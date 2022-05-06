function getSurroundingCells(cell, grid) {
    const cells = [];
    // UP
    if (cell.row > 0) {
        cells.push(grid.getCell(cell.column, cell.row - 1));
    }
    // RIGHT
    if (cell.column < grid.cols - 1) {
        cells.push(grid.getCell(cell.column + 1, cell.row));
    }
    // DOWN
    if (cell.row < grid.rows - 1) {
        cells.push(grid.getCell(cell.column, cell.row + 1));
    }
    // LEFT
    if (cell.column > 0) {
        cells.push(grid.getCell(cell.column - 1, cell.row));
    }

    return cells;
}

if (typeof module !== undefined) {
    module.exports.getSurroundingCells = getSurroundingCells;
}