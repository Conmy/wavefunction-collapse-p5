function getSurroundingCells(cell, grid) {
    const cells = [];
    // UP
    if (cell.row > 0) {
        cells.push(grid[cell.row - 1][cell.column]);
    }
    // RIGHT
    if (cell.column < grid.cols - 1) {
        cells.push(grid[cell.row][cell.column + 1]);
    }
    // DOWN
    if (cell.row < grid.rows - 1) {
        cells.push(grid[cell.row + 1][cell.column]);
    }
    // LEFT
    if (cell.column > 0) {
        cells.push(grid[cell.row][cell.column - 1]);
    }

    return cells;
}