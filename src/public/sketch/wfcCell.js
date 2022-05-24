const WfcStatus = {
    OPEN: 'open',
    COLLAPSED: 'collapsed',
};

class WfcCell {
    constructor (column, row) {
        this.column = column;
        this.row = row;
        this.status = WfcStatus.OPEN;
        this.entropy = 0;
        this.tileOptions = [];
        this.chosenTileIndex = null;
    }

    setTileOptions(tileIndexes) {
        this.tileOptions = tileIndexes;
    }

    calculateEntropy(tiles) {
        if (this.tileOptions.length == 0 || this.status === WfcStatus.COLLAPSED) {
            this.entropy = 0;
            return;
        }

        const sum_w = this.tileOptions.reduce((total, value) => {
            return total + tiles[value].weight;
        }, 0);
        // console.log('sum of weights', sum_w);

        const wlogw = this.tileOptions.map(tileIndex => {
            const tileW = tiles[tileIndex].weight;
            return tileW * Math.log(tileW);
        });

        const sum_wlogw = wlogw.reduce((total, currentValue) => {
            return total + currentValue;
        }, 0);

        this.entropy = Math.log(sum_w) - (sum_wlogw / sum_w);
    }

    collapseTo(tileIndex) {
        // console.log('Collapsing cell to a single tile', this, tileIndex);
        this.chosenTileIndex = tileIndex;
        this.status = WfcStatus.COLLAPSED;

        const index = this.tileOptions.indexOf(this.chosenTileIndex);
        if (index !== -1) {
            this.tileOptions.splice(index, 1);
        }
    }

    open() {
        this.chosenTileIndex = null;
        this.status = WfcStatus.OPEN;
    }

    equals(cell) {
        const answer = this.row === cell.row && this.column === cell.column
            && this.entropy === cell.entropy && this.status === cell.status;
        return answer;
    }
}

if (typeof module !== undefined) {
    module.exports = {WfcCell, WfcStatus};
}
