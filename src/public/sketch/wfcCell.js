const WfcStatus = {
    OPEN: 'open',
    COLLAPSED: 'collapsed',
};

class WfcCell {
    constructor (column, row) {
        this.column = column;
        this.row = row;
        this.status = WfcStatus.OPEN;
        this.enthropy = 0;
        this.tileOptions = [];
        this.chosenTileIndex = null;
    }

    setTileOptions(tileIndexes) {
        this.tileOptions = tileIndexes;
    }

    calculateEnthropy(tiles) {
        if (this.tileOptions.length == 0 || this.status === WfcStatus.COLLAPSED) {
            this.enthropy = 0;
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

        this.enthropy = Math.log(sum_w) - (sum_wlogw / sum_w);
    }

    collapseTo(tileIndex) {
        // console.log('Collapsing cell to a single tile', this, tileIndex);
        this.chosenTileIndex = tileIndex;
        this.status = WfcStatus.COLLAPSED;
        this.tileOptions = [];
        this.enthropy = 0;
    }
}

if (typeof module !== undefined) {
    module.exports = {WfcCell, WfcStatus};
}
